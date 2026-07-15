/**
 * 経営ダッシュボードのスナップショット（暫定モック）。
 * 事業部（売上/利益の予実対象）= AIテレアポ事業部 / CRM事業部 / パートナー事業部 の3つ。
 * カスタマーグロース部(cg) は AIテレアポ既存顧客のサポート部門で請求売上は AIテレアポに内包
 *   → 売上/利益の予実には出さず、活動KPI(cgKpi)で可視化する。財務は AIテレアポに集約。
 * 全社 = 3事業部の合計。将来: 売上=請求書システム(Sheets)、コスト=会計、計画=事業計画 で差し替え。
 */
import type {
  ImprovementRequest,
  KeieiSnapshot,
  PeriodPerf,
  PlanBook,
  WeeklyMonitor,
  YojitsuMonitor,
  CgKpi,
} from "@/types";

const U_TEL = "AIテレアポ事業部"; // カスタマーグロース部の売上・コストを内包
const U_CRM = "CRM事業部";
const U_PARTNER = "パートナー事業部";

/* ── 実績（A）：日次/週次/月次 ─────────────────────────── */

const monthly: PeriodPerf = {
  label: "2026年7月",
  note: "進行中（14日時点）",
  totals: { revenue: 43_000_000, cost: 25_000_000, target: 49_000_000, revenueDelta: "+8.2%", revenueTrend: "up", profitDelta: "+12.4%", profitTrend: "up" },
  series: [
    { label: "2月", revenue: 31_500_000, cost: 21_800_000 },
    { label: "3月", revenue: 34_200_000, cost: 22_600_000 },
    { label: "4月", revenue: 36_800_000, cost: 23_400_000 },
    { label: "5月", revenue: 39_100_000, cost: 24_100_000 },
    { label: "6月", revenue: 39_700_000, cost: 24_300_000 },
    { label: "7月", revenue: 43_000_000, cost: 25_000_000 },
  ],
  units: [
    { name: U_TEL, revenue: 33_000_000, cost: 17_800_000, target: 36_500_000, delta: "+7.4%", trend: "up" },
    { name: U_CRM, revenue: 7_000_000, cost: 3_700_000, target: 8_000_000, delta: "+5.0%", trend: "up" },
    { name: U_PARTNER, revenue: 3_000_000, cost: 3_500_000, target: 4_500_000, delta: "-3.5%", trend: "down" },
  ],
};

const weeklyPerf: PeriodPerf = {
  label: "第28週",
  note: "7/7–7/13",
  totals: { revenue: 10_130_000, cost: 5_980_000, target: 11_310_000, revenueDelta: "+3.4%", revenueTrend: "up", profitDelta: "+5.0%", profitTrend: "up" },
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
    { name: U_TEL, revenue: 7_770_000, cost: 4_180_000, target: 8_530_000, delta: "+2.9%", trend: "up" },
    { name: U_CRM, revenue: 1_650_000, cost: 870_000, target: 1_850_000, delta: "+1.2%", trend: "up" },
    { name: U_PARTNER, revenue: 710_000, cost: 930_000, target: 930_000, delta: "-2.1%", trend: "down" },
  ],
};

const daily: PeriodPerf = {
  label: "2026-07-14",
  note: "本日（速報）",
  totals: { revenue: 2_040_000, cost: 1_228_000, target: 2_260_000, revenueDelta: "+1.9%", revenueTrend: "up", profitDelta: "-0.8%", profitTrend: "down" },
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
    { name: U_TEL, revenue: 1_570_000, cost: 843_000, target: 1_730_000, delta: "+2.2%", trend: "up" },
    { name: U_CRM, revenue: 330_000, cost: 175_000, target: 380_000, delta: "0.0%", trend: "flat" },
    { name: U_PARTNER, revenue: 140_000, cost: 210_000, target: 150_000, delta: "-4.0%", trend: "down" },
  ],
};

/* ── 予実モニター（A2・月次） ─────────────────────────── */

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
      name: U_TEL,
      revenue: { plan: 36_500_000, actual: 14_600_000, forecast: 33_000_000 },
      profit: { plan: 17_000_000, actual: 6_750_000, forecast: 15_200_000 },
    },
    {
      name: U_CRM,
      revenue: { plan: 8_000_000, actual: 3_100_000, forecast: 7_000_000 },
      profit: { plan: 3_800_000, actual: 1_450_000, forecast: 3_300_000 },
    },
    {
      name: U_PARTNER,
      revenue: { plan: 4_500_000, actual: 1_300_000, forecast: 3_000_000 },
      profit: { plan: -300_000, actual: -200_000, forecast: -500_000 },
    },
  ],
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

/* ── カスタマーグロース部 活動KPI（A6） ────────────────── */
const cgKpi: CgKpi = {
  note: "売上は AIテレアポに内包（cg は既存顧客サポート部門）",
  metrics: [
    { label: "対応社数", value: "128社", delta: "+6", trend: "up" },
    { label: "NRR（売上継続率）", value: "112%", delta: "+2pt", trend: "up" },
    { label: "月次解約率", value: "1.8%", delta: "-0.3pt", trend: "up" },
    { label: "アップセルARR", value: "480万/月", delta: "+40万", trend: "up" },
    { label: "ヘルス緑比率", value: "72%", delta: "+3pt", trend: "up" },
  ],
};

/* ── 週次予実（A3） ───────────────────────────────────── */
const weekly: WeeklyMonitor = {
  unit: "全社",
  targetWeek: "2W（7/9(木)–7/15(水)・7日）進行中",
  asOf: "2026-07-14 05:04時点、6日分実績/7日",
  note: "進行中（週末見込み）",
  revenue: {
    y: { plan: 11_310_000, actual: 6_850_000, forecast: 10_130_000 },
    hasActual: true,
    series: [
      { label: "1W", plan: 11_800_000, actual: 9_880_000, forecast: 9_880_000 },
      { label: "2W", plan: 11_310_000, actual: 6_850_000, forecast: 10_130_000 },
      { label: "3W", plan: 11_200_000, actual: null, forecast: null },
      { label: "4W", plan: 11_600_000, actual: null, forecast: null },
      { label: "5W", plan: 5_400_000, actual: null, forecast: null },
    ],
  },
  cost: {
    y: { plan: 6_600_000, actual: 0, forecast: 6_750_000 },
    hasActual: false,
    series: [
      { label: "1W", plan: 6_500_000, actual: null, forecast: 6_600_000 },
      { label: "2W", plan: 6_600_000, actual: null, forecast: 6_750_000 },
      { label: "3W", plan: 6_400_000, actual: null, forecast: 6_400_000 },
      { label: "4W", plan: 6_700_000, actual: null, forecast: 6_700_000 },
      { label: "5W", plan: 3_100_000, actual: null, forecast: 3_100_000 },
    ],
  },
  profit: {
    y: { plan: 4_710_000, actual: 0, forecast: 3_380_000 },
    hasActual: false,
    series: [
      { label: "1W", plan: 5_300_000, actual: null, forecast: 3_280_000 },
      { label: "2W", plan: 4_710_000, actual: null, forecast: 3_380_000 },
      { label: "3W", plan: 4_800_000, actual: null, forecast: 4_800_000 },
      { label: "4W", plan: 4_900_000, actual: null, forecast: 4_900_000 },
      { label: "5W", plan: 2_300_000, actual: null, forecast: 2_300_000 },
    ],
  },
};

/* ── 事業計画（A4・FY2026基準／他FYは倍率） ─────────────── */
const M = (base: number, shape: number[]): number[] => shape.map((s) => Math.round((base * s) / 100));
const SHAPE = [7, 8, 8, 8, 9, 9, 9, 9, 8, 9, 8, 8];

const plan: PlanBook = {
  months: ["3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月"],
  fiscals: ["FY2026", "FY2027", "FY2028", "FY2029", "FY2030"],
  base: [
    { unit: U_TEL, revenue: M(438_000_000, SHAPE), cost: M(228_000_000, SHAPE) }, // cg 内包
    { unit: U_CRM, revenue: M(96_000_000, SHAPE), cost: M(51_000_000, SHAPE) },
    { unit: U_PARTNER, revenue: M(54_000_000, SHAPE), cost: M(66_000_000, SHAPE) },
  ],
  growth: { FY2026: 1.0, FY2027: 1.6, FY2028: 2.4, FY2029: 3.4, FY2030: 4.6 },
};

/* ── 改善リクエスト（A5） ─────────────────────────────── */
const requests: ImprovementRequest[] = [
  { id: "REQ-142", title: "予実モニターに前年同月比を追加したい", source: "AIテレアポ事業部", category: "データ", status: "open", date: "2026-07-14" },
  { id: "REQ-141", title: "事業部別テーブルをCSVエクスポートしたい", source: "コーポレート", category: "データ", status: "open", date: "2026-07-13" },
  { id: "REQ-140", title: "週次予実のコスト実績を日次から自動集計", source: "CRM事業部", category: "自動化", status: "in_progress", date: "2026-07-13" },
  { id: "REQ-139", title: "改善リクエストにSLA（対応期限）を表示", source: "カスタマーグロース部", category: "UI", status: "open", date: "2026-07-12" },
  { id: "REQ-138", title: "パートナー事業部の原価按分ロジックを見直し", source: "パートナー事業部", category: "データ", status: "in_progress", date: "2026-07-11" },
  { id: "REQ-137", title: "達成見込み%の色しきい値を部門別に設定", source: "経営", category: "UI", status: "open", date: "2026-07-11" },
  { id: "REQ-136", title: "取締役会資料タブのPDF出力", source: "コーポレート", category: "自動化", status: "open", date: "2026-07-10" },
  { id: "REQ-135", title: "モバイル表示でカードが崩れる", source: "AIテレアポ事業部", category: "不具合", status: "open", date: "2026-07-10" },
  { id: "REQ-134", title: "KPIレジストリと予実の数値差異アラート", source: "経営", category: "自動化", status: "in_progress", date: "2026-07-09" },
  { id: "REQ-133", title: "事業計画の月次を四半期表示に切替", source: "コーポレート", category: "UI", status: "done", date: "2026-07-08" },
  { id: "REQ-132", title: "見込みの算出根拠をツールチップ表示", source: "カスタマーグロース部", category: "UI", status: "done", date: "2026-07-07" },
  { id: "REQ-131", title: "権限管理：閲覧専用ロールの追加", source: "経営", category: "自動化", status: "done", date: "2026-07-06" },
];

/* ── ルート ────────────────────────────────────────── */

export const snapshot: KeieiSnapshot = {
  updatedAt: "2026-07-14",
  headline: "日々ドライブするのは ③AI労働力（測定可能）。②①はその延長線上。",
  performance: { daily, weekly: weeklyPerf, monthly },
  yojitsu,
  weekly,
  plan,
  requests,
  cgKpi,
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
