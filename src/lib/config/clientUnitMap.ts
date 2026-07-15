/**
 * 請求先コード → 事業部コード の対応（請求書システムの請求先コードで振り分け）。
 * 事業部コード: tel / cg / crm / partner（BusinessUnit.code と一致）。
 *
 * 実マッピング（請求書№検索の運用に準拠）:
 *   DG…  → partner（パートナー事業部）
 *   CRM… → crm（CRM事業部）
 *   AT… / C2…(C25/C26 取込由来) → tel（AIテレアポ事業部）
 * ※ cg（カスタマーグロース部）の請求先コード規則は未確定。該当プレフィックスが分かれば追記。
 */

/** 完全一致の対応（個別指定が必要な請求先コード）。 */
export const CLIENT_UNIT_MAP: Record<string, string> = {
  // 例: "C2599": "tel"
};

/** プレフィックス一致の対応（長いプレフィックス優先）。 */
export const PREFIX_RULES: Array<{ prefix: string; unit: string }> = [
  { prefix: "CRM", unit: "crm" }, // CRM事業部
  { prefix: "DG", unit: "partner" }, // パートナー事業部
  { prefix: "AT", unit: "tel" }, // AIテレアポ事業部
  { prefix: "C2", unit: "tel" }, // C25/C26…（取込由来）→ AIテレアポ事業部
];

/**
 * 請求先コード→事業部コードを解決。どの規則にもマッチしなければ null。
 * （null は同期時に「未マッピング」として報告し、黙って誤配賦しない）
 */
export function resolveUnit(clientCode: string): string | null {
  const code = clientCode.trim();
  if (CLIENT_UNIT_MAP[code]) return CLIENT_UNIT_MAP[code];
  const hit = [...PREFIX_RULES]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((r) => code.startsWith(r.prefix));
  return hit?.unit ?? null;
}
