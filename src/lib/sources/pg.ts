/**
 * 外部ソースDB（partner=dgloss-pt / tel=契約管理）への read-only 接続ヘルパ。
 * READ-ONLY 運用：呼び出し側は SELECT のみを投げる（外部DBへ書き込まない）。
 * 接続は都度開いて必ず閉じる。接続URLは各ソースの env に read-only ロールを設定すること。
 */
import { Pool } from "pg";

/** 外部PGに SELECT を投げ、行配列を返す。接続はこの関数内で閉じる。 */
export async function queryReadOnly<T = Record<string, unknown>>(
  connectionString: string,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 2 });
  try {
    const res = await pool.query(sql, params);
    return res.rows as T[];
  } finally {
    await pool.end();
  }
}

/** bigint/numeric（pg は文字列で返す）を number へ安全変換。 */
export function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  return Math.round(Number(String(v ?? "0")) || 0);
}
