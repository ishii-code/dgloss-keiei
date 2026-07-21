import { describe, expect, it } from "vitest";
import { parseTargetMonth } from "@/lib/sheets/invoices";

describe("parseTargetMonth（対象月文字列のパース）", () => {
  it('"2026年7月分" → {fy:2026, month:7}', () => {
    expect(parseTargetMonth("2026年7月分")).toEqual({ fy: 2026, month: 7 });
  });

  it('"2026/7" → {fy:2026, month:7}', () => {
    expect(parseTargetMonth("2026/7")).toEqual({ fy: 2026, month: 7 });
  });

  it('"2026-12" → {fy:2026, month:12}（2桁月）', () => {
    expect(parseTargetMonth("2026-12")).toEqual({ fy: 2026, month: 12 });
  });

  it("解釈不能な文字列は fy=0（同期対象から除外される）", () => {
    expect(parseTargetMonth("N/A")).toEqual({ fy: 0, month: 0 });
    expect(parseTargetMonth("")).toEqual({ fy: 0, month: 0 });
  });
});
