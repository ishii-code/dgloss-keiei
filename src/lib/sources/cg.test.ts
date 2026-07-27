import { describe, expect, it } from "vitest";
import { normalizeCgKpi } from "@/lib/sources/cg";

describe("normalizeCgKpi（cg KPI レスポンス正規化）", () => {
  it("note と metrics を保持し、trend を検証", () => {
    const out = normalizeCgKpi({
      note: "売上はAIテレアポに内包",
      metrics: [
        { label: "対応社数", value: "128社", delta: "+6", trend: "up" },
        { label: "月次解約率", value: "1.8%", trend: "down" },
      ],
    });
    expect(out.note).toBe("売上はAIテレアポに内包");
    expect(out.metrics).toHaveLength(2);
    expect(out.metrics[0]).toEqual({ label: "対応社数", value: "128社", delta: "+6", trend: "up" });
    expect(out.metrics[1].trend).toBe("down");
  });

  it("value が数値でも文字列化する", () => {
    const out = normalizeCgKpi({ metrics: [{ label: "NRR", value: 112 }] });
    expect(out.metrics[0].value).toBe("112");
  });

  it("label 欠落の metric は捨てる", () => {
    const out = normalizeCgKpi({ metrics: [{ value: "x" }, { label: "対応社数", value: "1社" }] });
    expect(out.metrics).toHaveLength(1);
    expect(out.metrics[0].label).toBe("対応社数");
  });

  it("不正な trend は落とす", () => {
    const out = normalizeCgKpi({ metrics: [{ label: "A", value: "1", trend: "sideways" }] });
    expect(out.metrics[0].trend).toBeUndefined();
  });

  it("metrics 欠落や null でも空配列で安全に返す", () => {
    expect(normalizeCgKpi(null)).toEqual({ note: "", metrics: [] });
    expect(normalizeCgKpi({}).metrics).toEqual([]);
  });
});
