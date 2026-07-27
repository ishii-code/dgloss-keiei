import { describe, expect, it } from "vitest";
import {
  enumerateMonths,
  isActiveInMonth,
  normalizeContractRow,
  safeViewName,
  telMonthlyRevenue,
  type TelContractRow,
} from "@/lib/sources/tel";

describe("safeViewName", () => {
  it("英数/アンダースコア/ドットは許可", () => {
    expect(safeViewName("cg_customer_master")).toBe("cg_customer_master");
    expect(safeViewName("public.contracts_v2")).toBe("public.contracts_v2");
  });
  it("不正文字は既定 VIEW に落とす（SQLインジェクション防止）", () => {
    expect(safeViewName("foo; DROP TABLE x")).toBe("cg_customer_master");
    expect(safeViewName(undefined)).toBe("cg_customer_master");
  });
});

describe("normalizeContractRow", () => {
  it("monthly_total を優先", () => {
    expect(normalizeContractRow({ monthly_total: "300000", base_amount: 1 }).monthlyTotal).toBe(300000);
  });
  it("monthly_total 無しは base+bpo で補完", () => {
    expect(normalizeContractRow({ base_amount: 200000, bpo_fixed: 50000 }).monthlyTotal).toBe(250000);
  });
  it("金額列が皆無なら monthlyTotal=null（0集計＝誤配賦しない）", () => {
    expect(normalizeContractRow({ customer_name: "X" }).monthlyTotal).toBeNull();
  });
  it("start_date 無しは contract_date で代替", () => {
    expect(normalizeContractRow({ contract_date: "2026-05-01" }).startDate).toBe("2026-05-01");
  });
});

describe("enumerateMonths", () => {
  it("対象年の1..12月をゼロ埋めで返す", () => {
    const ms = enumerateMonths(2026);
    expect(ms).toHaveLength(12);
    expect(ms[0]).toBe("2026-01");
    expect(ms[11]).toBe("2026-12");
  });
});

describe("isActiveInMonth（契約期間の重なり判定）", () => {
  const row = (startDate: string | null, endDate: string | null): TelContractRow => ({
    monthlyTotal: 100000,
    startDate,
    endDate,
  });

  it("期間内の月は有効", () => {
    expect(isActiveInMonth(row("2026-04-01", "2026-12-31"), "2026-07")).toBe(true);
  });
  it("開始前の月は無効", () => {
    expect(isActiveInMonth(row("2026-08-01", null), "2026-07")).toBe(false);
  });
  it("終了後の月は無効", () => {
    expect(isActiveInMonth(row("2026-01-01", "2026-06-30"), "2026-07")).toBe(false);
  });
  it("end 無し（継続中）は開始以降ずっと有効", () => {
    expect(isActiveInMonth(row("2026-01-01", null), "2026-12")).toBe(true);
  });
  it("開始月ちょうど・終了月ちょうどは境界含む", () => {
    expect(isActiveInMonth(row("2026-07-15", "2026-07-20"), "2026-07")).toBe(true);
  });
});

describe("telMonthlyRevenue（月次MRR合計）", () => {
  it("各月の有効契約MRRを合算し unitCode=tel を付与", () => {
    const rows: TelContractRow[] = [
      { monthlyTotal: 300000, startDate: "2026-01-01", endDate: null }, // 通年
      { monthlyTotal: 200000, startDate: "2026-07-01", endDate: "2026-09-30" }, // 7-9月のみ
    ];
    const out = telMonthlyRevenue(rows, ["2026-06", "2026-07"]);
    expect(out).toEqual([
      { unitCode: "tel", fiscalYear: 2026, month: 6, revenue: 300000 },
      { unitCode: "tel", fiscalYear: 2026, month: 7, revenue: 500000 },
    ]);
  });

  it("monthlyTotal=null の契約は売上に加えない", () => {
    const rows: TelContractRow[] = [{ monthlyTotal: null, startDate: "2026-01-01", endDate: null }];
    const out = telMonthlyRevenue(rows, ["2026-07"]);
    expect(out[0].revenue).toBe(0);
  });
});
