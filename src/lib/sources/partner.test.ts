import { describe, expect, it } from "vitest";
import { toPartnerRevenueRows } from "@/lib/sources/partner";

describe("toPartnerRevenueRows（partner月次NET → RevenueRow）", () => {
  it("全行に unitCode=partner を付与し、年月を分解する", () => {
    const rows = toPartnerRevenueRows([
      { ym: "2026-06", net: 12_000_000 },
      { ym: "2026-07", net: 15_500_000 },
    ]);
    expect(rows).toEqual([
      { unitCode: "partner", fiscalYear: 2026, month: 6, revenue: 12_000_000 },
      { unitCode: "partner", fiscalYear: 2026, month: 7, revenue: 15_500_000 },
    ]);
  });

  it("解釈不能な ym の行は捨てる", () => {
    const rows = toPartnerRevenueRows([
      { ym: "不明", net: 999 },
      { ym: "2026-07", net: 100 },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].month).toBe(7);
  });

  it("NET が負（CXL 超過）でもそのまま通す", () => {
    const rows = toPartnerRevenueRows([{ ym: "2026-07", net: -500_000 }]);
    expect(rows[0].revenue).toBe(-500_000);
  });
});
