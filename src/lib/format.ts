/**
 * 数値フォーマッタ（純関数・UI非依存＝テスト対象）。
 */

/** 円を億/万で短縮表示（例: 43,000,000 → 4,300万円 / 120,000,000 → 1.2億円）。 */
export function jpy(n: number): string {
  const sign = n < 0 ? "−" : "";
  const a = Math.abs(n);
  if (a >= 100_000_000) return `${sign}${(a / 100_000_000).toFixed(1)}億円`;
  return `${sign}${Math.round(a / 10_000).toLocaleString("ja-JP")}万円`;
}

/** 実比率を % 表示。 */
export function pct(v: number, digits = 1): string {
  return `${(v * 100).toFixed(digits)}%`;
}
