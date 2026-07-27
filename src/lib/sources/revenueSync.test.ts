import { describe, expect, it } from "vitest";
import { ymToPeriod } from "@/lib/sources/revenueSync";

describe("ymToPeriod（YYYY-MM → 年度/月）", () => {
  it('"2026-07" → {fiscalYear:2026, month:7}', () => {
    expect(ymToPeriod("2026-07")).toEqual({ fiscalYear: 2026, month: 7 });
  });

  it('"2027-01" → {fiscalYear:2027, month:1}（暦年をそのまま fiscalYear に。既存billingと同規約）', () => {
    expect(ymToPeriod("2027-01")).toEqual({ fiscalYear: 2027, month: 1 });
  });

  it("月が範囲外(00/13)は null", () => {
    expect(ymToPeriod("2026-00")).toBeNull();
    expect(ymToPeriod("2026-13")).toBeNull();
  });

  it("形式不正は null", () => {
    expect(ymToPeriod("2026/07")).toBeNull();
    expect(ymToPeriod("")).toBeNull();
    expect(ymToPeriod("2026-7-extra")).toBeNull();
  });
});
