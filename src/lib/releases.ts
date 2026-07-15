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
    version: "1.5.0",
    date: "2026-07-15",
    features: [
      "カスタマーグロース部を活動KPIとして分離表示(売上はAIテレアポに内包)",
      "予実の売上/利益は3事業部(AIテレアポ/CRM/パートナー)に、cgはNRR/対応社数/解約率等のKPIで可視化",
      "cgの売上・コストをAIテレアポに集約(全社合計は不変)",
    ],
  },
  {
    version: "1.4.0",
    date: "2026-07-15",
    features: [
      "請求書システム(Googleスプレッドシート)連携: 請求売上を経営ダッシュボードへ同期",
      "Google Sheets API(サービスアカウント)でinvoicesを読み、請求先コード→事業部で集計",
      "同期API /api/sync/billing で MonthlyFinancial.actualRevenue へupsert(コスト/計画は別ソース)",
      "請求先コード→事業部マップ src/lib/config/clientUnitMap.ts を新設",
    ],
  },
  {
    version: "1.3.0",
    date: "2026-07-14",
    features: [
      "実データ接続の基盤を追加（会計/請求を真実源）: Prisma + Supabase(PostgreSQL)",
      "getDashboardData()でDB→モックのフォールバック。財務(予実/事業計画)をDBから構築",
      "会計/請求CSV取込 API(/api/import/finance) と seed を追加（freee/バクラクは同取込に接続可）",
      "全画面をサーバー取得＋force-dynamic化（DB接続時に実データを反映）",
    ],
  },
  {
    version: "1.2.0",
    date: "2026-07-14",
    features: [
      "UIを shadcn/ui へ移行（Tailwind + shadcn/ui 標準準拠・見た目は維持）",
      "cn/CSS変数テーマ/components.json 整備、dgloss ブランドをトークンにマッピング",
      "Button/Card/Badge/Tabs/Table/Separator プリミティブを導入し全画面に適用",
    ],
  },
  {
    version: "0.4.0",
    date: "2026-07-14",
    features: [
      "事業部を4事業部に整理（パートナー/CRM/AIテレアポ/カスタマーグロース）",
      "予実モニター：全社サマリー（大型カード）と事業部別を明確に分離",
      "週次予実タブ実装：売上/コスト/営業利益の週次 計画/実績/見込＋1W〜5W推移",
      "事業計画タブ実装：FY2026〜2030トグル・事業部×月次（売上/コスト/営業利益）表",
      "改善リクエストタブ実装：ステータス別（未対応/対応中/完了）集約、ナビ件数連動",
    ],
  },
  {
    version: "0.3.0",
    date: "2026-07-14",
    features: [
      "経営 AI OS シェルへ刷新（トップバー＋多タブナビ：予実モニター/週次予実/現状分析/事業計画/リリースノート/改善リクエスト）",
      "予実モニター新設：全社＋事業部別の 計画 vs 実績 vs 見込み・達成見込み%・進捗バー",
      "推移とブレイクダウン：計画/実績/見込のグループ棒グラフ＋事業部別 予実テーブル",
      "改善エンジン（KGI/権限レベル/実績内訳）を「今月:現状分析」タブへ集約",
    ],
  },
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
