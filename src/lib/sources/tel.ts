/**
 * AIテレアポ事業部（tel）の実売上を、契約管理（keiyaku-kanri-next / Supabase Postgres）の
 * read-only VIEW から月次MRR（月次経常売上）として集計する。
 * READ-ONLY：VIEW を SELECT するのみ（契約管理DBへは書き込まない）。
 * 各月Mの売上 = 「その月に契約期間が有効な契約」の monthlyTotal の合計（MRR認識）。
 *
 * env:
 *   TEL_CONTRACT_DB_URL  … 契約管理DBへの read-only 接続文字列（未設定なら無効）
 *   TEL_CONTRACT_VIEW    … VIEW 名（既定 cg_customer_master。金額列 monthly_total 等が必要）
 *   TEL_TARGET_YEAR      … 集計対象の暦年（既定 2026。finance.ts の対象年度に合わせる）
 *
 * 注意: 既定 VIEW cg_customer_master は金額列を持たない構成もある（dgloss-cg 側の運用に依存）。
 *   金額列が無い場合、monthlyTotal は null となり売上は 0 集計になる（誤配賦しないための安全側）。
 */
import { queryReadOnly } from "@/lib/sources/pg";
import { ymToPeriod, type RevenueRow } from "@/lib/sources/revenueSync";

const TEL_CONTRACT_DB_URL = process.env.TEL_CONTRACT_DB_URL ?? "";
const TEL_TARGET_YEAR = Number(process.env.TEL_TARGET_YEAR) || 2026;

export const TEL_ENABLED = Boolean(TEL_CONTRACT_DB_URL);

/** SQL識別子として安全な VIEW 名のみ許可（英数・アンダースコア・ドット）。 */
export function safeViewName(raw: string | undefined): string {
  const name = (raw ?? "cg_customer_master").trim();
  return /^[A-Za-z0-9_.]+$/.test(name) ? name : "cg_customer_master";
}

/** 契約行（VIEW から拾う最小フィールド）。金額・期間が無ければ null。 */
export interface TelContractRow {
  monthlyTotal: number | null; // 月額合計（monthly_total、無ければ base+bpo）
  startDate: string | null; // ISO 日付
  endDate: string | null; // ISO 日付（null=無期限/継続中）
}

function asNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}
function asStringOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

/** 生の VIEW 行 → TelContractRow（存在する列だけ拾う）。 */
export function normalizeContractRow(row: Record<string, unknown>): TelContractRow {
  const base = asNumberOrNull(row.base_amount);
  const bpo = asNumberOrNull(row.bpo_fixed);
  const monthlyTotal =
    asNumberOrNull(row.monthly_total) ?? (base != null || bpo != null ? (base ?? 0) + (bpo ?? 0) : null);
  return {
    monthlyTotal,
    startDate: asStringOrNull(row.start_date) ?? asStringOrNull(row.contract_date),
    endDate: asStringOrNull(row.end_date),
  };
}

/** 対象暦年の "YYYY-MM"（1..12月）を列挙。 */
export function enumerateMonths(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
}

/** 契約が ym（"YYYY-MM"）に有効か：start<=月末 かつ (end 無し or end>=月初)。 */
export function isActiveInMonth(row: TelContractRow, ym: string): boolean {
  const monthStart = new Date(`${ym}-01T00:00:00Z`);
  if (Number.isNaN(monthStart.getTime())) return false;
  const monthEnd = new Date(monthStart);
  monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);
  monthEnd.setUTCDate(0); // 前月末日 = 当月末

  if (row.startDate) {
    const start = new Date(row.startDate);
    if (!Number.isNaN(start.getTime()) && start > monthEnd) return false;
  }
  if (row.endDate) {
    const end = new Date(row.endDate);
    if (!Number.isNaN(end.getTime()) && end < monthStart) return false;
  }
  return true;
}

/** 契約群 × 対象月 → 月次MRR合計の RevenueRow[]（unitCode=tel）。 */
export function telMonthlyRevenue(rows: TelContractRow[], months: string[]): RevenueRow[] {
  const out: RevenueRow[] = [];
  for (const ym of months) {
    const period = ymToPeriod(ym);
    if (!period) continue;
    let revenue = 0;
    for (const r of rows) {
      if (r.monthlyTotal == null) continue;
      if (isActiveInMonth(r, ym)) revenue += r.monthlyTotal;
    }
    out.push({ unitCode: "tel", fiscalYear: period.fiscalYear, month: period.month, revenue });
  }
  return out;
}

/** 契約管理VIEW を読み、対象年の月次MRR を tel の RevenueRow[] として返す。 */
export async function fetchTelRevenue(): Promise<RevenueRow[]> {
  if (!TEL_ENABLED) return [];
  const view = safeViewName(process.env.TEL_CONTRACT_VIEW);
  const raw = await queryReadOnly<Record<string, unknown>>(TEL_CONTRACT_DB_URL, `SELECT * FROM ${view}`);
  const rows = raw.map(normalizeContractRow);
  return telMonthlyRevenue(rows, enumerateMonths(TEL_TARGET_YEAR));
}
