/**
 * 事業部×年度×月の「実売上」を MonthlyFinancial.actualRevenue へ upsert する共通処理。
 * partner（dgloss-pt 直DB）・tel（契約管理 直DB）の同期ルートから利用する。
 * 既存 /api/sync/billing と同じ upsert 規約（actualRevenue と source のみ更新）。
 */
import { prisma } from "@/lib/db";

/** 事業部コード×年度×月 の実売上（円）。 */
export interface RevenueRow {
  unitCode: string; // BusinessUnit.code（tel / crm / partner）
  fiscalYear: number; // 例: 2026（= 月の暦年。既存 billing 同期と同規約）
  month: number; // 1..12
  revenue: number; // 実売上（円）
}

export interface RevenueSyncResult {
  synced: number;
  aggregates: number;
  missingUnits: string[]; // BusinessUnit 未登録の事業部コード
}

/** "YYYY-MM" → { fiscalYear, month }。解釈不能なら null。 */
export function ymToPeriod(ym: string): { fiscalYear: number; month: number } | null {
  const m = String(ym).match(/^(\d{4})-(\d{1,2})$/);
  if (!m) return null;
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { fiscalYear: Number(m[1]), month };
}

/** actualRevenue を upsert。DB無効時は例外。source はソース識別タグ。 */
export async function upsertActualRevenue(rows: RevenueRow[], source: string): Promise<RevenueSyncResult> {
  if (!prisma) throw new Error("DATABASE_URL 未設定（DBオフ）");

  const units = await prisma.businessUnit.findMany();
  const unitByCode = new Map(units.map((u) => [u.code, u.id]));

  let synced = 0;
  const missingUnits: string[] = [];
  for (const r of rows) {
    const unitId = unitByCode.get(r.unitCode);
    if (!unitId) {
      if (!missingUnits.includes(r.unitCode)) missingUnits.push(r.unitCode);
      continue;
    }
    await prisma.monthlyFinancial.upsert({
      where: { unitId_fiscalYear_month: { unitId, fiscalYear: r.fiscalYear, month: r.month } },
      update: { actualRevenue: r.revenue, source },
      create: {
        unitId,
        fiscalYear: r.fiscalYear,
        month: r.month,
        actualRevenue: r.revenue,
        source,
      },
    });
    synced++;
  }
  return { synced, aggregates: rows.length, missingUnits };
}
