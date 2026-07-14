import { describe, expect, it } from "vitest";
import { snapshot } from "@/data/keiei";
import type { Period } from "@/types";

const periods: Period[] = ["daily", "weekly", "monthly"];

describe("業績スナップショットの整合性", () => {
  it.each(periods)("%s: 事業部の売上・コスト合計が全社totalsと一致する", (p) => {
    const perf = snapshot.performance[p];
    const rev = perf.units.reduce((a, u) => a + u.revenue, 0);
    const cost = perf.units.reduce((a, u) => a + u.cost, 0);
    expect(rev).toBe(perf.totals.revenue);
    expect(cost).toBe(perf.totals.cost);
  });
});
