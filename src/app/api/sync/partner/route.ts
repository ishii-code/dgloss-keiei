import { NextResponse } from "next/server";
import { DB_ENABLED, prisma } from "@/lib/db";
import { PARTNER_ENABLED, fetchPartnerRevenue } from "@/lib/sources/partner";
import { upsertActualRevenue } from "@/lib/sources/revenueSync";

/**
 * パートナー事業部（dgloss-pt / Supabase Postgres）から実売上を取り込み、
 * MonthlyFinancial(partner).actualRevenue へ同期する。
 * 売上のみ更新（plan=事業計画、actualCost=会計）。DB と PARTNER_DB_URL の両方が有効なときのみ動作。
 * 定期実行は Vercel Cron から叩く想定。
 */
export async function POST() {
  if (!DB_ENABLED || !prisma) {
    return NextResponse.json({ error: "DATABASE_URL 未設定（DBオフ）" }, { status: 503 });
  }
  if (!PARTNER_ENABLED) {
    return NextResponse.json({ error: "PARTNER_DB_URL 未設定（partner連携オフ）" }, { status: 503 });
  }

  let rows;
  try {
    rows = await fetchPartnerRevenue();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "partner DB 読み取り失敗" },
      { status: 502 },
    );
  }

  const result = await upsertActualRevenue(rows, "pt-appt");
  return NextResponse.json(result);
}
