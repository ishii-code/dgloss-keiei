import { NextResponse } from "next/server";
import { DB_ENABLED, prisma } from "@/lib/db";
import { SHEETS_ENABLED, fetchBillingRevenue } from "@/lib/sheets/invoices";

/**
 * 請求書システム（Google スプレッドシート invoices）から請求売上を取り込み、
 * MonthlyFinancial.actualRevenue（事業部×年度×月）へ同期する。
 * コスト・計画は対象外（コスト=会計、計画=事業計画）。
 * DB と Sheets の両方が有効なときのみ動作。定期実行は Vercel Cron から叩く想定。
 */
export async function POST() {
  if (!DB_ENABLED || !prisma) {
    return NextResponse.json({ error: "DATABASE_URL 未設定（DBオフ）" }, { status: 503 });
  }
  if (!SHEETS_ENABLED) {
    return NextResponse.json({ error: "Google Sheets 連携が未設定" }, { status: 503 });
  }

  let rows;
  try {
    rows = await fetchBillingRevenue();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Sheets 読み取り失敗" }, { status: 502 });
  }

  const units = await prisma.businessUnit.findMany();
  const unitByCode = new Map(units.map((u) => [u.code, u.id]));

  let synced = 0;
  const skipped: string[] = [];
  for (const r of rows) {
    const unitId = unitByCode.get(r.unitCode);
    if (!unitId) {
      skipped.push(`${r.unitCode} (未登録事業部)`);
      continue;
    }
    // actualRevenue のみ更新（planは事業計画、actualCostは会計が持つ）。
    await prisma.monthlyFinancial.upsert({
      where: { unitId_fiscalYear_month: { unitId, fiscalYear: r.fiscalYear, month: r.month } },
      update: { actualRevenue: r.revenue, source: "sheets-billing" },
      create: {
        unitId,
        fiscalYear: r.fiscalYear,
        month: r.month,
        actualRevenue: r.revenue,
        source: "sheets-billing",
      },
    });
    synced++;
  }

  return NextResponse.json({ synced, skipped, rows: rows.length });
}
