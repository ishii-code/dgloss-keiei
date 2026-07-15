/**
 * 請求書システム（Google スプレッドシート）の invoices を読み、
 * 事業部×年度×月の「請求売上（税抜 subtotal）」に集計する。
 * サービスアカウントでシートに読み取り共有しておくこと。
 * 環境変数が未設定なら無効（SHEETS_ENABLED=false）。
 */
import { JWT } from "google-auth-library";
import { resolveUnit } from "@/lib/config/clientUnitMap";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? "";
const SA_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY ?? "";
const INVOICES_SHEET = process.env.INVOICES_SHEET_NAME ?? "invoices";

/** Sheets 連携が有効か。 */
export const SHEETS_ENABLED = Boolean(SPREADSHEET_ID && SA_KEY);

/** 事業部×年度×月 の請求売上。 */
export interface BillingRevenue {
  unitCode: string;
  fiscalYear: number;
  month: number;
  revenue: number; // 税抜 subtotal 合計（円）
  invoiceCount: number;
}

function serviceAccount(): { client_email: string; private_key: string } {
  const raw = SA_KEY.trim().startsWith("{") ? SA_KEY : Buffer.from(SA_KEY, "base64").toString("utf8");
  return JSON.parse(raw);
}

async function readValues(range: string): Promise<string[][]> {
  const sa = serviceAccount();
  const jwt = new JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const { token } = await jwt.getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Sheets API ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { values?: string[][] };
  return data.values ?? [];
}

/** "2026年7月分" / "2026/7" 等 → {fy, month}。解釈不能なら fy=0。 */
export function parseTargetMonth(s: string): { fy: number; month: number } {
  const m = String(s).match(/(\d{4})\D+(\d{1,2})/);
  if (!m) return { fy: 0, month: 0 };
  return { fy: Number(m[1]), month: Number(m[2]) };
}

const num = (v: string | undefined) => Math.round(Number(String(v ?? "0").replace(/[, ¥]/g, "")) || 0);

/** invoices を読み、事業部×年度×月の請求売上へ集計。 */
export async function fetchBillingRevenue(): Promise<BillingRevenue[]> {
  if (!SHEETS_ENABLED) return [];
  const rows = await readValues(`${INVOICES_SHEET}!A1:Z`);
  if (rows.length < 2) return [];

  const header = rows[0];
  const ci = (name: string) => header.indexOf(name);
  const cCode = ci("clientCode");
  const cSub = ci("subtotal");
  const cTgt = ci("targetMonthStr");
  if (cCode < 0 || cSub < 0 || cTgt < 0) {
    throw new Error("invoices シートに clientCode/subtotal/targetMonthStr 列が必要です");
  }

  const agg = new Map<string, BillingRevenue>();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const code = String(r[cCode] ?? "").trim();
    if (!code) continue;
    const { fy, month } = parseTargetMonth(String(r[cTgt] ?? ""));
    if (!fy || !month) continue;
    const unitCode = resolveUnit(code);
    const revenue = num(r[cSub]);
    const key = `${unitCode}|${fy}|${month}`;
    const cur = agg.get(key) ?? { unitCode, fiscalYear: fy, month, revenue: 0, invoiceCount: 0 };
    cur.revenue += revenue;
    cur.invoiceCount += 1;
    agg.set(key, cur);
  }
  return [...agg.values()];
}
