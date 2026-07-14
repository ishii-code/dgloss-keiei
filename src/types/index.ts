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

/* ───────────── ルート ───────────── */

/** 経営ダッシュボード全体のスナップショット。 */
export interface KeieiSnapshot {
  updatedAt: string;
  headline: string;
  performance: Performance;   // A) 業績
  kgis: Kgi[];                // B) 改善エンジン
  metaKpis: MetaKpi[];
  authority: AuthorityRow[];
  modules: ModuleStatus[];
}
