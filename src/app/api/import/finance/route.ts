import { NextResponse, type NextRequest } from "next/server";
import { DB_ENABLED, prisma } from "@/lib/db";

/**
 * 会計/請求 CSV の取込。
 * ヘッダ: unit_code,fiscal_year,month,plan_revenue,plan_cost,actual_revenue,actual_cost[,source]
 * 金額は円（整数）。既存(事業部×年度×月)は upsert。
 * ※ freee / バクラク の API 連携も、正規化してこの upsert を呼ぶ形で追加できる。
 */
export async function POST(request: NextRequest) {
  if (!DB_ENABLED || !prisma) {
    return NextResponse.json({ error: "DATABASE_URL 未設定（DBオフ）" }, { status: 503 });
  }

  const text = await request.text();
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    return NextResponse.json({ error: "CSVが空です" }, { status: 400 });
  }

  const header = lines[0].split(",").map((h) => h.trim());
  const need = ["unit_code", "fiscal_year", "month"];
  for (const n of need) {
    if (!header.includes(n)) {
      return NextResponse.json({ error: `必須列 ${n} がありません` }, { status: 400 });
    }
  }
  const col = (name: string) => header.indexOf(name);
  const num = (v: string | undefined) => {
    const n = Number((v ?? "").replace(/[, ]/g, ""));
    return Number.isFinite(n) ? Math.round(n) : 0;
  };

  let imported = 0;
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const c = lines[i].split(",");
    const code = (c[col("unit_code")] ?? "").trim();
    const fy = num(c[col("fiscal_year")]);
    const month = num(c[col("month")]);
    if (!code || fy <= 0 || month < 1 || month > 12) {
      errors.push(`L${i + 1}: 不正な行`);
      continue;
    }
    const unit = await prisma.businessUnit.findUnique({ where: { code } });
    if (!unit) {
      errors.push(`L${i + 1}: 事業部コード ${code} が未登録`);
      continue;
    }
    const data = {
      planRevenue: num(c[col("plan_revenue")]),
      planCost: num(c[col("plan_cost")]),
      actualRevenue: num(c[col("actual_revenue")]),
      actualCost: num(c[col("actual_cost")]),
      source: (c[col("source")] ?? "csv").trim() || "csv",
    };
    await prisma.monthlyFinancial.upsert({
      where: { unitId_fiscalYear_month: { unitId: unit.id, fiscalYear: fy, month } },
      update: data,
      create: { unitId: unit.id, fiscalYear: fy, month, ...data },
    });
    imported++;
  }

  return NextResponse.json({ imported, errors });
}
