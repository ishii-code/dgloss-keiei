/**
 * 請求先コード → 事業部コード の対応表（会計/請求の売上を事業部へ振り分ける）。
 * 事業部コード: tel / cg / crm / partner（BusinessUnit.code と一致させる）。
 *
 * 運用: 請求書システムの請求先コードをキーに、どの事業部の売上かをここで定義する。
 * 前方一致（プレフィックス）でもマッチさせるので、コード体系に採番規則があれば
 * PREFIX_RULES にまとめて書ける（完全一致 CLIENT_UNIT_MAP を優先）。
 */

/** 完全一致の対応（請求先コード → 事業部コード）。 */
export const CLIENT_UNIT_MAP: Record<string, string> = {
  // 例: "C0001": "tel", "C0002": "cg",
};

/** プレフィックス一致の対応（採番規則がある場合）。長いプレフィックス優先。 */
export const PREFIX_RULES: Array<{ prefix: string; unit: string }> = [
  // 例: { prefix: "TEL", unit: "tel" }, { prefix: "CG", unit: "cg" },
];

/** 未対応の請求先コードの既定振り分け先（事業部コード）。 */
export const DEFAULT_UNIT = "partner";

/** 請求先コードから事業部コードを解決する。 */
export function resolveUnit(clientCode: string): string {
  const code = clientCode.trim();
  if (CLIENT_UNIT_MAP[code]) return CLIENT_UNIT_MAP[code];
  const hit = [...PREFIX_RULES]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((r) => code.startsWith(r.prefix));
  return hit?.unit ?? DEFAULT_UNIT;
}
