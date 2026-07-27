import { NextResponse } from "next/server";
import { DB_ENABLED, prisma } from "@/lib/db";
import { TEL_ENABLED, fetchTelRevenue } from "@/lib/sources/tel";
import { upsertActualRevenue } from "@/lib/sources/revenueSync";

/**
 * AIテレアポ事業部（tel）の実売上を契約管理DB（read-only VIEW）から取り込み、
 * MonthlyFinancial(tel).actualRevenue へ同期する。各月に有効な契約のMRR合計。
 * DB と TEL_CONTRACT_DB_URL の両方が有効なときのみ動作。定期実行は Vercel Cron 想定。
 */
export async function POST() {
  if (!DB_ENABLED || !prisma) {
    return NextResponse.json({ error: "DATABASE_URL 未設定（DBオフ）" }, { status: 503 });
  }
  if (!TEL_ENABLED) {
    return NextResponse.json({ error: "TEL_CONTRACT_DB_URL 未設定（tel連携オフ）" }, { status: 503 });
  }

  let rows;
  try {
    rows = await fetchTelRevenue();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "契約管理DB 読み取り失敗" },
      { status: 502 },
    );
  }

  const result = await upsertActualRevenue(rows, "tel-contract");
  return NextResponse.json(result);
}
