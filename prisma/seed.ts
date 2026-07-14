/**
 * 財務データの初期投入（会計/請求データ相当）。
 * snapshot（モック）の 事業計画(plan) を計画値に、当月(7月)の予実を実績に反映。
 * 実運用では CSV 取込（/api/import/finance）や freee/バクラク連携で上書きする。
 */
import { PrismaClient } from "@prisma/client";
import { snapshot } from "../src/data/keiei";

const prisma = new PrismaClient();

const MONTH_ORDER = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];
const CURRENT_MONTH = 7;
const FY = 2026;

// 事業部名 → code。
const CODE: Record<string, string> = {
  "AIテレアポ事業部": "tel",
  "カスタマーグロース部": "cg",
  "CRM事業部": "crm",
  "パートナー事業部": "partner",
};

async function main() {
  const planBase = snapshot.plan.base; // 事業部×12ヶ月の計画(売上/コスト)
  const yUnits = snapshot.yojitsu.units; // 当月の予実

  for (let i = 0; i < planBase.length; i++) {
    const p = planBase[i];
    const y = yUnits.find((u) => u.name === p.unit);
    const unit = await prisma.businessUnit.upsert({
      where: { code: CODE[p.unit] ?? p.unit },
      update: { name: p.unit, sortOrder: i },
      create: { code: CODE[p.unit] ?? p.unit, name: p.unit, sortOrder: i },
    });

    for (let mi = 0; mi < MONTH_ORDER.length; mi++) {
      const month = MONTH_ORDER[mi];
      const planRevenue = p.revenue[mi];
      const planCost = p.cost[mi];

      // 実績: 過去月(3-6月)=計画達成とみなす／当月(7月)=予実の実績／未来=0。
      let actualRevenue = 0;
      let actualCost = 0;
      if ([3, 4, 5, 6].includes(month)) {
        actualRevenue = planRevenue;
        actualCost = planCost;
      } else if (month === CURRENT_MONTH && y) {
        actualRevenue = y.revenue.actual;
        actualCost = y.revenue.actual - y.profit.actual; // コスト実績 = 売上実績 − 利益実績
      }

      await prisma.monthlyFinancial.upsert({
        where: { unitId_fiscalYear_month: { unitId: unit.id, fiscalYear: FY, month } },
        update: { planRevenue, planCost, actualRevenue, actualCost, source: "seed" },
        create: { unitId: unit.id, fiscalYear: FY, month, planRevenue, planCost, actualRevenue, actualCost, source: "seed" },
      });
    }
  }
  console.log(`seeded ${planBase.length} units × ${MONTH_ORDER.length} months (FY${FY})`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
