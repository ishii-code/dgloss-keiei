/**
 * カスタマーグロース部（dgloss-cg）の活動KPIを KPI エクスポートAPIから取り込む。
 * cg は NRR/解約率などを保存せずアプリ内で算出するため、直DB読取ではなく
 * dgloss-cg 側の token-guard エクスポート route（例: GET /api/kpi）から JSON を取得する。
 *
 * 期待レスポンス（keiei の CgKpi と同形）:
 *   { note?: string, metrics: [{ label, value, delta?, trend? }] }
 *
 * env:
 *   CG_KPI_URL    … dgloss-cg の KPI エクスポート URL（未設定なら無効）
 *   CG_KPI_TOKEN  … x-internal-secret ヘッダに載せる共有シークレット（dgloss-cg の INTERNAL_JOB_SECRET）
 */
import type { CgKpi, CgMetric, Trend } from "@/types";

const CG_KPI_URL = process.env.CG_KPI_URL ?? "";
const CG_KPI_TOKEN = process.env.CG_KPI_TOKEN ?? "";

export const CG_ENABLED = Boolean(CG_KPI_URL);

const TRENDS: Trend[] = ["up", "down", "flat"];

/** 任意の JSON を CgKpi へ正規化（未知フィールドは捨て、型を保証する）。 */
export function normalizeCgKpi(data: unknown): CgKpi {
  const obj = (data ?? {}) as Record<string, unknown>;
  const note = typeof obj.note === "string" ? obj.note : "";
  const rawMetrics = Array.isArray(obj.metrics) ? obj.metrics : [];
  const metrics: CgMetric[] = rawMetrics
    .map((m): CgMetric | null => {
      const r = (m ?? {}) as Record<string, unknown>;
      if (typeof r.label !== "string" || r.label === "") return null;
      const value = typeof r.value === "string" ? r.value : String(r.value ?? "");
      const metric: CgMetric = { label: r.label, value };
      if (typeof r.delta === "string") metric.delta = r.delta;
      if (typeof r.trend === "string" && TRENDS.includes(r.trend as Trend)) metric.trend = r.trend as Trend;
      return metric;
    })
    .filter((m): m is CgMetric => m !== null);
  return { note, metrics };
}

/** dgloss-cg の KPI エクスポートAPIから活動KPIを取得。 */
export async function fetchCgKpi(): Promise<CgKpi> {
  if (!CG_ENABLED) throw new Error("CG_KPI_URL 未設定（cg連携オフ）");
  const res = await fetch(CG_KPI_URL, {
    headers: CG_KPI_TOKEN ? { "x-internal-secret": CG_KPI_TOKEN } : {},
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`cg KPI API ${res.status}: ${await res.text()}`);
  return normalizeCgKpi(await res.json());
}
