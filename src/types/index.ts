/**
 * 経営ダッシュボードの型定義（src/types で一元管理）。
 * ダッシュボードは2本柱:
 *  A) 業績（会社の売上・コストを 日次/週次/月次・事業部別で把握）
 *  B) 改善エンジン（機能・オペレーション改善の元 = KGI/メタKPI/権限レベル/モジュール）
 */

/* ───────────── 共通 ───────────── */

/** 週次デルタの方向。改善=up、悪化=down、横ばい=flat。 */
export type Trend = "up" | "down" | "flat";

/* ───────────── A) 業績 ───────────── */

/** 集計期間の粒度。 */
export type Period = "daily" | "weekly" | "monthly";

/** 期間サマリー（会社全体の売上・コスト・目標）。金額は円。 */
export interface FinanceTotals {
  revenue: number;      // 売上
  cost: number;         // コスト（原価+販管費）
  target: number;       // 当期の売上目標
  revenueDelta: string; // 売上の前期比表示（例: +8.2%）
  revenueTrend: Trend;
  profitDelta: string;  // 営業利益の前期比表示
  profitTrend: Trend;
}

/** 事業部別の実績。金額は円。 */
export interface BizUnitPerf {
  name: string;         // 事業部
  revenue: number;
  cost: number;
  target: number;       // 事業部の売上目標
  delta: string;        // 前期比表示
  trend: Trend;
}

/** 推移グラフの1バケット。 */
export interface SeriesPoint {
  label: string;        // 例: 7/8, 第27週, 6月
  revenue: number;
  cost: number;
}

/** ある粒度における業績スナップショット。 */
export interface PeriodPerf {
  label: string;        // 当期ラベル（例: 2026-07-14 / 第28週 / 2026年7月）
  note: string;         // 補足（進行中 など）
  totals: FinanceTotals;
  series: SeriesPoint[]; // 直近の推移
  units: BizUnitPerf[];  // 事業部別内訳（合計は totals と整合）
}

/** 日次/週次/月次すべての業績。 */
export interface Performance {
  daily: PeriodPerf;
  weekly: PeriodPerf;
  monthly: PeriodPerf;
}

/* ───────────── B) 改善エンジン ───────────── */

/** 権限レベル L0(人が決める) 〜 L5(AI全権)。不可逆な意思決定は L4 止まり。 */
export type AuthorityLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** モジュール（部門/機能）の稼働ステータス。 */
export type ModuleState = "live" | "building" | "planned";

/** KGI カード（①権限移譲 / ②状態 / ③労働力）。 */
export interface Kgi {
  id: "authority" | "autonomy" | "labor";
  index: "①" | "②" | "③";
  tag: string;
  title: string;
  definition: string;
  value: number | null;
  target: number | null;
  unit: string | null;
  note?: string;
}

/** メタKPI（日々ドライブする定量指標）。 */
export interface MetaKpi {
  id: string;
  label: string;
  definition: string;
  value: string;
  delta: string;
  trend: Trend;
  breakdown?: string;
}

/** 意思決定の種類ごとの権限レベル分布（KGI①の進捗指標）。 */
export interface AuthorityRow {
  name: string;
  dist: [number, number, number, number, number, number]; // L0..L5 の件数
  cap: AuthorityLevel;                                     // 上限
}

/** モジュール別ステータス。 */
export interface ModuleStatus {
  name: string;
  note: string;
  state: ModuleState;
}

/* ───────────── A2) 予実モニター（計画 vs 実績 vs 見込み） ───────────── */

/** 計画/実績/見込みの3値。金額は円。達成見込み% = forecast/plan、差異 = forecast - plan。 */
export interface Yojitsu {
  plan: number;      // 計画
  actual: number;    // 実績（対象時点までの累計）
  forecast: number;  // 見込み（着地）
}

/** 事業部の予実（売上・営業利益）。 */
export interface UnitYojitsu {
  name: string;
  revenue: Yojitsu;
  profit: Yojitsu;
}

/** 推移グラフの1点（計画は常時／実績は確定分／見込みは進行・着地）。 */
export interface YojitsuPoint {
  label: string;              // 3月, 4月, …
  plan: number;
  actual: number | null;      // 未確定月は null
  forecast: number | null;    // 進行中月のみ着地見込み
}

/** 予実モニター（対象月の全社＋事業部別＋推移）。 */
export interface YojitsuMonitor {
  targetMonth: string;   // 例: 2026年7月 (実績+見込み)
  asOf: string;          // 例: 2026-07-14 05:04時点、13日分実績/31日
  planSource: string;    // 例: 事業計画 v1.4 (2026/7/14)
  company: { revenue: Yojitsu; profit: Yojitsu };
  units: UnitYojitsu[];
  revenueSeries: YojitsuPoint[]; // 全社 売上 月次
  profitSeries: YojitsuPoint[];  // 全社 営業利益 月次
}

/* ───────────── A3) 週次予実 ───────────── */

/** 週次推移の1点。 */
export interface WeeklyPoint {
  label: string;
  plan: number;
  actual: number | null;
  forecast: number | null;
}

/** 週次の1指標（売上/コスト/営業利益）。 */
export interface WeeklyMetric {
  y: Yojitsu;
  series: WeeklyPoint[];
  hasActual: boolean;
}

export interface WeeklyMonitor {
  unit: string;
  targetWeek: string;
  asOf: string;
  note: string;
  revenue: WeeklyMetric;
  cost: WeeklyMetric;
  profit: WeeklyMetric;
}

/* ───────────── A4) 事業計画（FY2026〜2030） ───────────── */

export type Fiscal = "FY2026" | "FY2027" | "FY2028" | "FY2029" | "FY2030";

/** 事業部の年間計画（3月〜2月の12ヶ月・売上/コスト）。 */
export interface PlanRow {
  unit: string;
  revenue: number[];
  cost: number[];
}

/** 事業計画ブック。FY2026 を基準に、他FYは成長倍率で算出。 */
export interface PlanBook {
  months: string[];
  fiscals: Fiscal[];
  base: PlanRow[];
  growth: Record<Fiscal, number>;
}

/* ───────────── A5) 改善リクエスト ───────────── */

export type RequestStatus = "open" | "in_progress" | "done";

export interface ImprovementRequest {
  id: string;
  title: string;
  source: string;
  category: string;
  status: RequestStatus;
  date: string;
}

/* ───────────── A6) カスタマーグロース部 活動KPI ───────────── */
// cg は AIテレアポ既存顧客のサポート部門。請求売上は AIテレアポに内包されるため、
// 予実(売上/利益)ではなく活動KPI（NRR/対応社数/解約防止 等）で可視化する。

export interface CgMetric {
  label: string;
  value: string;
  delta?: string;
  trend?: Trend;
}

export interface CgKpi {
  note: string;        // 例: 売上はAIテレアポに内包
  metrics: CgMetric[];
}

/* ───────────── ルート ───────────── */

/** 経営ダッシュボード全体のスナップショット。 */
export interface KeieiSnapshot {
  updatedAt: string;
  headline: string;
  performance: Performance;   // A) 業績（日次/週次/月次の実績）
  yojitsu: YojitsuMonitor;    // A2) 予実モニター（月次・計画 vs 実績 vs 見込み）
  weekly: WeeklyMonitor;      // A3) 週次予実
  plan: PlanBook;             // A4) 事業計画（FY2026〜2030）
  requests: ImprovementRequest[]; // A5) 改善リクエスト
  cgKpi: CgKpi;               // A6) カスタマーグロース部 活動KPI（売上はAIテレアポ内包）
  kgis: Kgi[];                // B) 改善エンジン
  metaKpis: MetaKpi[];
  authority: AuthorityRow[];
  modules: ModuleStatus[];
}
