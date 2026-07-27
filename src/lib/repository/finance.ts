/**
 * 財務データのリポジトリ（④実データ接続）。
 * DATABASE_URL 設定時: 会計/請求由来の DB（MonthlyFinancial）から
 *   予実モニター(yojitsu) と 事業計画(plan) を構築。
 * 未設定 or 未seed 時: 静的モック(snapshot)をそのまま返す。
 * 業績内訳(performance)/週次/KGI/改善リクエスト等の非財務は当面 snapshot 由来。
 */
import { cache } from "react";
import { DB_ENABLED, prisma } from "@/lib/db";
import { snapshot } from "@/data/keiei";
import type {
  CgKpi,
  CgMetric,
  KeieiSnapshot,
  PlanBook,
  PlanRow,
  Yojitsu,
  YojitsuMonitor,
  YojitsuPoint,
} from "@/types";

/** 会計期の月順（3月開始→翌2月）。 */
const MONTH_ORDER = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];
const CURRENT_FY = 2026;
const CURRENT_MONTH = 7; // 対象月（2026年7月）
/** 対象月の経過割合（13日/31日）。見込み按分に使用。 */
const ASOF_PROGRESS = 13 / 31;

type Fin = {
  month: number;
  planRevenue: number;
  planCost: number;
  actualRevenue: number;
  actualCost: number;
};
type UnitRow = { name: string; fins: Fin[] };

const sumBy = (rows: Yojitsu[], k: "plan" | "actual" | "forecast") => rows.reduce((a, r) => a + r[k], 0);

function unitYojitsu(fins: Fin[]) {
  const m = fins.find((f) => f.month === CURRENT_MONTH);
  const planRev = m?.planRevenue ?? 0;
  const planCost = m?.planCost ?? 0;
  const actRev = m?.actualRevenue ?? 0;
  const actCost = m?.actualCost ?? 0;
  // 見込み = 実績 + 残計画の按分（会計の実績を起点にした着地予測）
  const fcRev = Math.round(actRev + planRev * (1 - ASOF_PROGRESS));
  const fcCost = Math.round(actCost + planCost * (1 - ASOF_PROGRESS));
  const revenue: Yojitsu = { plan: planRev, actual: actRev, forecast: fcRev };
  const profit: Yojitsu = { plan: planRev - planCost, actual: actRev - actCost, forecast: fcRev - fcCost };
  return { revenue, profit };
}

function seriesFor(rows: UnitRow[], pick: "revenue" | "profit"): YojitsuPoint[] {
  const curIdx = MONTH_ORDER.indexOf(CURRENT_MONTH);
  return MONTH_ORDER.map((month, idx) => {
    let plan = 0;
    let actual = 0;
    let forecast = 0;
    for (const u of rows) {
      const f = u.fins.find((x) => x.month === month);
      if (!f) continue;
      const p = pick === "revenue" ? f.planRevenue : f.planRevenue - f.planCost;
      const a = pick === "revenue" ? f.actualRevenue : f.actualRevenue - f.actualCost;
      plan += p;
      actual += a;
      forecast += Math.round(
        (pick === "revenue" ? f.actualRevenue : f.actualRevenue - f.actualCost) +
          (pick === "revenue" ? f.planRevenue : f.planRevenue - f.planCost) * (1 - ASOF_PROGRESS),
      );
    }
    const label = `${month}月`;
    if (idx < curIdx) return { label, plan, actual, forecast: null };
    if (idx === curIdx) return { label, plan, actual, forecast };
    return { label, plan, actual: null, forecast: null };
  });
}

function buildYojitsu(rows: UnitRow[]): YojitsuMonitor {
  const units = rows.map((u) => ({ name: u.name, ...unitYojitsu(u.fins) }));
  const rev = units.map((u) => u.revenue);
  const prof = units.map((u) => u.profit);
  const company = {
    revenue: { plan: sumBy(rev, "plan"), actual: sumBy(rev, "actual"), forecast: sumBy(rev, "forecast") },
    profit: { plan: sumBy(prof, "plan"), actual: sumBy(prof, "actual"), forecast: sumBy(prof, "forecast") },
  };
  return {
    ...snapshot.yojitsu, // targetMonth/asOf/planSource はメタ情報として流用
    company,
    units,
    revenueSeries: seriesFor(rows, "revenue"),
    profitSeries: seriesFor(rows, "profit"),
  };
}

function buildPlan(rows: UnitRow[]): PlanBook {
  const base: PlanRow[] = rows.map((u) => ({
    unit: u.name,
    revenue: MONTH_ORDER.map((mn) => u.fins.find((f) => f.month === mn)?.planRevenue ?? 0),
    cost: MONTH_ORDER.map((mn) => u.fins.find((f) => f.month === mn)?.planCost ?? 0),
  }));
  return { ...snapshot.plan, base };
}

/** cg 活動KPI の最新スナップショット（無ければ静的 snapshot.cgKpi）。 */
async function latestCgKpi(): Promise<CgKpi> {
  if (!prisma) return snapshot.cgKpi;
  const snap = await prisma.cgKpiSnapshot.findFirst({ orderBy: { fetchedAt: "desc" } });
  if (!snap) return snapshot.cgKpi;
  const metrics = Array.isArray(snap.metrics) ? (snap.metrics as unknown as CgMetric[]) : [];
  if (metrics.length === 0) return snapshot.cgKpi;
  return { note: snap.note, metrics };
}

/** ダッシュボード全体（財務は DB、非財務は snapshot）。DB 無効/未seed はモック。 */
export const getDashboardData = cache(async (): Promise<KeieiSnapshot> => {
  if (!DB_ENABLED || !prisma) return snapshot;

  try {
    const units = await prisma.businessUnit.findMany({
      orderBy: { sortOrder: "asc" },
      include: { financials: { where: { fiscalYear: CURRENT_FY } } },
    });
    if (units.length === 0) return snapshot; // 未seed

    const rows: UnitRow[] = units.map((u) => ({
      name: u.name,
      fins: u.financials.map((f) => ({
        month: f.month,
        planRevenue: f.planRevenue,
        planCost: f.planCost,
        actualRevenue: f.actualRevenue,
        actualCost: f.actualCost,
      })),
    }));

    const cgKpi = await latestCgKpi();
    return { ...snapshot, yojitsu: buildYojitsu(rows), plan: buildPlan(rows), cgKpi };
  } catch (e) {
    // DB 接続失敗時はクラッシュさせずモックへフォールバック。
    console.error("[getDashboardData] DB読取失敗、モックにフォールバック:", e);
    return snapshot;
  }
});
