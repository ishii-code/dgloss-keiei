/**
 * 経営ダッシュボードの型定義（src/types で一元管理）。
 * ワイヤーフレーム section 02（経営ダッシュボード）のデータモデルに対応。
 */

/** 権限レベル L0(人が決める) 〜 L5(AI全権)。不可逆な意思決定は L4 止まり。 */
export type AuthorityLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** 週次デルタの方向。改善=up、悪化=down、横ばい=flat。 */
export type Trend = "up" | "down" | "flat";

/** モジュール（部門/機能）の稼働ステータス。 */
export type ModuleState = "live" | "building" | "planned";

/** KGI カード（①権限移譲 / ②状態 / ③労働力）。 */
export interface Kgi {
  id: "authority" | "autonomy" | "labor";
  index: "①" | "②" | "③";
  tag: string;          // 例: 権限移譲 / 状態 / 定量・日々ドライブ
  title: string;        // 例: AI経営 / AI業務実行 / AI労働力
  definition: string;   // KGIの定義文
  /** 定量KGIのみ: 現在値/目標値と単位（②のような定性KGIは null）。 */
  value: number | null;
  target: number | null;
  unit: string | null;
  /** 表示用の補足（②の「③の延長で到達」など）。 */
  note?: string;
}

/** メタKPI（日々ドライブする定量指標）。 */
export interface MetaKpi {
  id: string;
  label: string;        // 自動化率 / 改善速度 / AI稼働人月
  definition: string;   // 指標の定義
  value: string;        // 表示値（34% / 12件 / 27人月）
  delta: string;        // 週次デルタ表示（+3pt/週 など）
  trend: Trend;
  breakdown?: string;   // 例: 開発14 / CS 8 / 営業3 / 他2
}

/** 意思決定の種類ごとの権限レベル分布（KGI①の進捗指標）。 */
export interface AuthorityRow {
  name: string;                 // 意思決定の種類
  /** L0〜L5 の件数分布（現状どのレベルで運用されているか）。 */
  dist: [number, number, number, number, number, number];
  cap: AuthorityLevel;          // 上限（不可逆なものは 4 で頭打ち）
}

/** モジュール別ステータス。 */
export interface ModuleStatus {
  name: string;
  note: string;
  state: ModuleState;
}

/** 経営ダッシュボード全体のスナップショット。 */
export interface KeieiSnapshot {
  updatedAt: string;            // ISO 日付（見読性のため表示）
  headline: string;             // ダッシュボードの主眼
  kgis: Kgi[];
  metaKpis: MetaKpi[];
  authority: AuthorityRow[];
  modules: ModuleStatus[];
}
