/**
 * 経営ダッシュボードのスナップショット（モックデータ）。
 * ワイヤーフレーム section 02 の数値をそのまま初期値として保持する。
 * 将来: KPIレジストリ（カーネル）/ Work Monitor / 改善デーモンの集計に接続して差し替える。
 * ── 数値の出所を一箇所に集約し、UI 側にハードコードしない（ドリフト防止）。
 */
import type { KeieiSnapshot } from "@/types";

export const snapshot: KeieiSnapshot = {
  updatedAt: "2026-07-14",
  headline: "日々ドライブするのは ③AI労働力（測定可能）。②①はその延長線上。",
  kgis: [
    {
      id: "authority",
      index: "①",
      tag: "権限移譲",
      title: "AI経営",
      definition: "全意思決定の平均権限レベル",
      value: 1.8,
      target: 5,
      unit: "L",
      note: "L0 人が決める → L5 AI全権",
    },
    {
      id: "autonomy",
      index: "②",
      tag: "状態",
      title: "AI業務実行",
      definition: "全タスクの自動実行・自動改善",
      value: null,
      target: null,
      unit: null,
      note: "③の延長で到達",
    },
    {
      id: "labor",
      index: "③",
      tag: "定量・日々ドライブ",
      title: "AI労働力",
      definition: "各機能で 100人月/月 を目標に AI が労働力を供給",
      value: 27,
      target: 100,
      unit: "人月・月",
    },
  ],
  metaKpis: [
    {
      id: "automation-rate",
      label: "自動化率",
      definition: "人業務 → システムへの昇格割合",
      value: "34%",
      delta: "+3pt/週",
      trend: "up",
    },
    {
      id: "improve-speed",
      label: "改善速度",
      definition: "自動改善サイクル完了件数 / 週",
      value: "12件",
      delta: "+4件",
      trend: "up",
    },
    {
      id: "ai-labor-mm",
      label: "AI稼働人月",
      definition: "AI完了タスク × 人間標準時間（SOP前提）",
      value: "27人月",
      delta: "+2.4",
      trend: "up",
      breakdown: "開発14 / CS 8 / 営業3 / 他2",
    },
  ],
  // 意思決定の権限レベル分布（KGI①の進捗指標）。dist = L0..L5 の件数。
  authority: [
    { name: "SOP改善・自動化の適用", dist: [1, 3, 6, 8, 5, 2], cap: 5 },
    { name: "KPI閾値・アラート設定", dist: [2, 4, 7, 5, 2, 0], cap: 5 },
    { name: "営業リスト・架電配分", dist: [1, 5, 8, 4, 1, 0], cap: 5 },
    { name: "採用・評価（人事）", dist: [6, 5, 3, 1, 0, 0], cap: 3 },
    { name: "与信・支払（経理財務）", dist: [8, 4, 2, 0, 0, 0], cap: 4 },
    { name: "契約・法務レビュー", dist: [7, 5, 1, 0, 0, 0], cap: 4 },
  ],
  modules: [
    { name: "Work Monitor", note: "PCログ + 商談解析", state: "live" },
    { name: "KPIレジストリ（カーネル）", note: "全部門KPIの単一レジストリ", state: "live" },
    { name: "改善デーモン", note: "逸脱検知 → ISSUE自動起票", state: "building" },
    { name: "SOP・スキルグラフ", note: "機械可読な業務標準", state: "building" },
    { name: "AIテレアポ（D-ONE連携）", note: "架電/SFA/リスト", state: "live" },
    { name: "評価システム（Dig）", note: "個人貢献モデル / Dig通貨", state: "planned" },
  ],
};
