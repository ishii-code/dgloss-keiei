/**
 * 経営ダッシュボードのスナップショット（モックデータ）。
 * 数値の出所を一箇所に集約し、UI にハードコードしない（ドリフト防止）。
 * 将来: 業績=会計/請求システム、改善エンジン=KPIレジストリ/Work Monitor/改善デーモン に接続して差し替える。
 * ※ 金額はすべて暫定モック。事業部は webinar deck 準拠(AIテレアポ/CG/OS/新規)。
 */
import type { KeieiSnapshot, PeriodPerf, YojitsuMonitor } from "@/types";

/* ── 業績（A） ────────────────────────────────────────── */

const monthly: PeriodPerf = {
  label: "2026年7月",
  note: "進行中（14日時点）",
  totals: {
    revenue: 43_000_000,
    cost: 25_000_000,
    target: 49_000_000,
    revenueDelta: "+8.2%",
    revenueTrend: "up",
    profitDelta: "+12.4%",
    profitTrend: "up",
  },
  series: [
    { label: "2月", revenue: 31_500_000, cost: 21_800_000 },
    { label: "3月", revenue: 34_200_000, cost: 22_600_000 },
    { label: "4月", revenue: 36_800_000, cost: 23_400_000 },
    { label: "5月", revenue: 39_100_000, cost: 24_100_000 },
    { label: "6月", revenue: 39_700_000, cost: 24_300_000 },
    { label: "7月", revenue: 43_000_000, cost: 25_000_000 },
  ],
  units: [
    { name: "AIテレアポ（D-ONE）", revenue: 28_000_000, cost: 15_400_000, target: 32_000_000, delta: "+6.1%", trend: "up" },
    { name: "カスタマーグロース（CG）", revenue: 9_500_000, cost: 5_200_000, target: 10_000_000, delta: "+11.8%", trend: "up" },
    { name: "dgloss OS ライセンス", revenue: 4_200_000, cost: 2_800_000, target: 5_000_000, delta: "+4.0%", trend: "up" },
    { name: "新規事業", revenue: 1_300_000, cost: 1_600_000, target: 2_000_000, delta: "-3.5%", trend: "down" },
  ],
};

const weekly: PeriodPerf = {
  label: "第28週",
  note: "7/7–7/13",
  totals: {
    revenue: 10_130_000,
    cost: 5_980_000,
    target: 11_310_000,
    revenueDelta: "+3.4%",
    revenueTrend: "up",
    profitDelta: "+5.0%",
    profitTrend: "up",
  },
  series: [
    { label: "第22週", revenue: 8_900_000, cost: 5_600_000 },
    { label: "第23週", revenue: 9_100_000, cost: 5_650_000 },
    { label: "第24週", revenue: 9_050_000, cost: 5_700_000 },
    { label: "第25週", revenue: 9_400_000, cost: 5_780_000 },
    { label: "第26週", revenue: 9_600_000, cost: 5_820_000 },
    { label: "第27週", revenue: 9_800_000, cost: 5_900_000 },
    { label: "第28週", revenue: 10_130_000, cost: 5_980_000 },
  ],
  units: [
    { name: "AIテレアポ（D-ONE）", revenue: 6_600_000, cost: 3_700_000, target: 7_400_000, delta: "+2.9%", trend: "up" },
    { name: "カスタマーグロース（CG）", revenue: 2_250_000, cost: 1_250_000, target: 2_300_000, delta: "+4.6%", trend: "up" },
    { name: "dgloss OS ライセンス", revenue: 980_000, cost: 650_000, target: 1_150_000, delta: "+1.2%", trend: "up" },
    { name: "新規事業", revenue: 300_000, cost: 380_000, target: 460_000, delta: "-2.1%", trend: "down" },
  ],
};

const daily: PeriodPerf = {
  label: "2026-07-14",
  note: "本日（速報）",
  totals: {
    revenue: 2_040_000,
    cost: 1_228_000,
    target: 2_260_000,
    revenueDelta: "+1.9%",
    revenueTrend: "up",
    profitDelta: "-0.8%",
    profitTrend: "down",
  },
  series: [
    { label: "7/8", revenue: 1_760_000, cost: 1_150_000 },
    { label: "7/9", revenue: 1_820_000, cost: 1_170_000 },
    { label: "7/10", revenue: 1_910_000, cost: 1_190_000 },
    { label: "7/11", revenue: 1_680_000, cost: 1_120_000 },
    { label: "7/12", revenue: 1_240_000, cost: 980_000 },
    { label: "7/13", revenue: 1_150_000, cost: 940_000 },
    { label: "7/14", revenue: 2_040_000, cost: 1_228_000 },
  ],
  units: [
    { name: "AIテレアポ（D-ONE）", revenue: 1_320_000, cost: 760_000, target: 1_480_000, delta: "+2.2%", trend: "up" },
    { name: "カスタマーグロース（CG）", revenue: 450_000, cost: 250_000, target: 460_000, delta: "+0.9%", trend: "up" },
    { name: "dgloss OS ライセンス", revenue: 210_000, cost: 140_000, target: 230_000, delta: "0.0%", trend: "flat" },
    { name: "新規事業", revenue: 60_000, cost: 78_000, target: 92_000, delta: "-4.0%", trend: "down" },
  ],
};

/* ── ルート ────────────────────────────────────────── */

/* ── 予実モニター（A2）：計画 vs 実績 vs 見込み ─────────────── */
// 円単位。全社 = 事業部合計（見込み・計画とも整合）。

const yojitsu: YojitsuMonitor = {
  targetMonth: "2026年7月 (実績+見込み)",
  asOf: "2026-07-14 05:04時点、13日分実績/31日",
  planSource: "事業計画 v1.4 (2026/7/14)",
  company: {
    revenue: { plan: 49_000_000, actual: 19_000_000, forecast: 43_000_000 },
    profit: { plan: 20_500_000, actual: 8_000_000, forecast: 18_000_000 },
  },
  units: [
    {
      name: "AIテレアポ（D-ONE）",
      revenue: { plan: 32_000_000, actual: 12_500_000, forecast: 28_000_000 },
      profit: { plan: 14_500_000, actual: 5_600_000, forecast: 12_600_000 },
    },
    {
      name: "カスタマーグロース（CG）",
      revenue: { plan: 10_000_000, actual: 4_200_000, forecast: 9_500_000 },
      profit: { plan: 4_500_000, actual: 1_900_000, forecast: 4_300_000 },
    },
    {
      name: "dgloss OS ライセンス",
      revenue: { plan: 5_000_000, actual: 1_900_000, forecast: 4_200_000 },
      profit: { plan: 1_700_000, actual: 600_000, forecast: 1_400_000 },
    },
    {
      name: "新規事業",
      revenue: { plan: 2_000_000, actual: 600_000, forecast: 1_300_000 },
      profit: { plan: -200_000, actual: -150_000, forecast: -300_000 },
    },
  ],
  // 全社 売上 月次（3月〜2月）。過去=実績、7月=実績(部分)+見込み、未来=計画のみ。
  revenueSeries: [
    { label: "3月", plan: 44_000_000, actual: 39_700_000, forecast: null },
    { label: "4月", plan: 45_000_000, actual: 41_000_000, forecast: null },
    { label: "5月", plan: 46_000_000, actual: 43_800_000, forecast: null },
    { label: "6月", plan: 47_000_000, actual: 39_700_000, forecast: null },
    { label: "7月", plan: 49_000_000, actual: 19_000_000, forecast: 43_000_000 },
    { label: "8月", plan: 50_000_000, actual: null, forecast: null },
    { label: "9月", plan: 51_000_000, actual: null, forecast: null },
    { label: "10月", plan: 52_000_000, actual: null, forecast: null },
    { label: "11月", plan: 53_000_000, actual: null, forecast: null },
    { label: "12月", plan: 54_000_000, actual: null, forecast: null },
    { label: "1月", plan: 52_000_000, actual: null, forecast: null },
    { label: "2月", plan: 50_000_000, actual: null, forecast: null },
  ],
  // 全社 営業利益 月次。
  profitSeries: [
    { label: "3月", plan: 18_000_000, actual: 15_900_000, forecast: null },
    { label: "4月", plan: 18_500_000, actual: 16_400_000, forecast: null },
    { label: "5月", plan: 19_000_000, actual: 15_600_000, forecast: null },
    { label: "6月", plan: 19_500_000, actual: 15_400_000, forecast: null },
    { label: "7月", plan: 20_500_000, actual: 8_000_000, forecast: 18_000_000 },
    { label: "8月", plan: 21_000_000, actual: null, forecast: null },
    { label: "9月", plan: 21_500_000, actual: null, forecast: null },
    { label: "10月", plan: 22_000_000, actual: null, forecast: null },
    { label: "11月", plan: 22_500_000, actual: null, forecast: null },
    { label: "12月", plan: 23_000_000, actual: null, forecast: null },
    { label: "1月", plan: 21_000_000, actual: null, forecast: null },
    { label: "2月", plan: 20_000_000, actual: null, forecast: null },
  ],
};

export const snapshot: KeieiSnapshot = {
  updatedAt: "2026-07-14",
  headline: "日々ドライブするのは ③AI労働力（測定可能）。②①はその延長線上。",
  performance: { daily, weekly, monthly },
  yojitsu,
  kgis: [
    { id: "authority", index: "①", tag: "権限移譲", title: "AI経営", definition: "全意思決定の平均権限レベル", value: 1.8, target: 5, unit: "L", note: "L0 人が決める → L5 AI全権" },
    { id: "autonomy", index: "②", tag: "状態", title: "AI業務実行", definition: "全タスクの自動実行・自動改善", value: null, target: null, unit: null, note: "③の延長で到達" },
    { id: "labor", index: "③", tag: "定量・日々ドライブ", title: "AI労働力", definition: "各機能で 100人月/月 を目標に AI が労働力を供給", value: 27, target: 100, unit: "人月・月" },
  ],
  metaKpis: [
    { id: "automation-rate", label: "自動化率", definition: "人業務 → システムへの昇格割合", value: "34%", delta: "+3pt/週", trend: "up" },
    { id: "improve-speed", label: "改善速度", definition: "自動改善サイクル完了件数 / 週", value: "12件", delta: "+4件", trend: "up" },
    { id: "ai-labor-mm", label: "AI稼働人月", definition: "AI完了タスク × 人間標準時間（SOP前提）", value: "27人月", delta: "+2.4", trend: "up", breakdown: "開発14 / CS 8 / 営業3 / 他2" },
  ],
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
