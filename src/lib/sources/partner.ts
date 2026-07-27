/**
 * パートナー事業部（dgloss-pt / Supabase Postgres）から実売上を read-only 集計する。
 * 売上は NET（総売上 − CXL）運用：CXL は ApptAppointment.status='キャンセル' の案件金額。
 * 集計基準は取得日（acquiredDate）を既定とし、YYYY-MM 月次で MonthlyFinancial(partner) へ入れる。
 * dgloss-pt の GET /api/appt/sales?basis=acquired と同じ計算を直DBで再現。
 *
 * env:
 *   PARTNER_DB_URL       … dgloss-pt DB への read-only 接続文字列（未設定なら無効）
 *   PARTNER_SALES_BASIS  … acquired（既定）| appointment
 */
import { queryReadOnly, toNumber } from "@/lib/sources/pg";
import { ymToPeriod, type RevenueRow } from "@/lib/sources/revenueSync";

const PARTNER_DB_URL = process.env.PARTNER_DB_URL ?? "";
const BASIS = process.env.PARTNER_SALES_BASIS === "appointment" ? "appointment" : "acquired";

export const PARTNER_ENABLED = Boolean(PARTNER_DB_URL);

/** ソースの月次NET行。 */
export interface PartnerMonthRow {
  ym: string;
  net: number;
}

/** 月次NET行 → MonthlyFinancial(partner) 用の RevenueRow へ。解釈不能な ym は捨てる。 */
export function toPartnerRevenueRows(months: PartnerMonthRow[]): RevenueRow[] {
  const rows: RevenueRow[] = [];
  for (const m of months) {
    const period = ymToPeriod(m.ym);
    if (!period) continue;
    rows.push({ unitCode: "partner", fiscalYear: period.fiscalYear, month: period.month, revenue: m.net });
  }
  return rows;
}

/** dgloss-pt から月次NET売上を集計して RevenueRow[] を返す。 */
export async function fetchPartnerRevenue(): Promise<RevenueRow[]> {
  if (!PARTNER_ENABLED) return [];
  // 日付列は定数のみ（ユーザー入力を SQL へ入れない）。
  const dateCol = BASIS === "appointment" ? '"appointmentDate"' : '"acquiredDate"';
  const sql = `
    SELECT substring(${dateCol} from 1 for 7) AS ym,
           COALESCE(SUM(amount), 0)
             - COALESCE(SUM(amount) FILTER (WHERE status = 'キャンセル'), 0) AS net
    FROM "ApptAppointment"
    WHERE ${dateCol} ~ '^[0-9]{4}-[0-9]{2}'
    GROUP BY ym
    ORDER BY ym
  `;
  const raw = await queryReadOnly<{ ym: string; net: unknown }>(PARTNER_DB_URL, sql);
  const months: PartnerMonthRow[] = raw.map((r) => ({ ym: r.ym, net: toNumber(r.net) }));
  return toPartnerRevenueRows(months);
}
