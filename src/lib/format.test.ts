import { describe, expect, it } from "vitest";
import { jpy, pct } from "@/lib/format";

describe("jpy", () => {
  it("万円で表示する", () => {
    expect(jpy(43_000_000)).toBe("4,300万円");
    expect(jpy(2_040_000)).toBe("204万円");
  });
  it("1億以上は億円", () => {
    expect(jpy(120_000_000)).toBe("1.2億円");
  });
  it("負値は先頭に−（赤字利益）", () => {
    expect(jpy(-300_000)).toBe("−30万円");
  });
});

describe("pct", () => {
  it("比率を%へ", () => {
    expect(pct(0.419)).toBe("41.9%");
    expect(pct(0.88, 0)).toBe("88%");
  });
});
