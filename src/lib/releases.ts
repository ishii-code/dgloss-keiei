/**
 * リリースマニフェスト（社内向け /releases タブのデータ源）。
 * RELEASE.md §4-5 準拠: 機能リリース毎に features を追記し、要件ID＋名称で追跡可能にする。
 * ※ CHANGELOG.md / package.json version は semantic-release が自動更新（手編集禁止）。
 */

export interface ReleaseNote {
  version: string;
  date: string; // YYYY-MM-DD
  features: string[];
}

export const SYSTEM = "dgloss-keiei";

export const releases: ReleaseNote[] = [
  {
    version: "0.2.0",
    date: "2026-07-14",
    features: [
      "業績セクション新設（日次/週次/月次トグルで売上・コスト・営業利益・利益率）",
      "売上・コスト推移チャート（コスト＋営業利益の積み上げ）",
      "事業部別の数字進捗テーブル（売上/営業利益/前期比/対目標）",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-07-14",
    features: [
      "経営ダッシュボード初版（KGI①②③ / メタKPI / 意思決定の権限レベル / モジュール別ステータス）",
    ],
  },
];
