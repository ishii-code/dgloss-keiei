/**
 * 経営ダッシュボードの共通UI部品。
 * ワイヤーフレーム（dgloss-os）のブルー/パープル基調に統一。
 */
import type { AuthorityRow, MetaKpi, ModuleState, Trend } from "@/types";

/** カード枠。ダッシュボードの各ブロックの器。 */
export function Card({
  title,
  hint,
  action,
  children,
}: {
  title?: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-bold text-ink">{title}</h2>}
            {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** 週次デルタのバッジ（改善=緑 / 悪化=赤 / 横ばい=灰）。 */
export function DeltaBadge({ delta, trend }: { delta: string; trend: Trend }) {
  const map: Record<Trend, { cls: string; mark: string }> = {
    up: { cls: "bg-good/10 text-good", mark: "▲" },
    down: { cls: "bg-bad/10 text-bad", mark: "▼" },
    flat: { cls: "bg-slate-100 text-muted", mark: "—" },
  };
  const { cls, mark } = map[trend];
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-bold tabular-nums ${cls}`}>
      <span aria-hidden>{mark}</span>
      {delta}
    </span>
  );
}

/** メタKPIカード（自動化率・改善速度・AI稼働人月）。 */
export function MetaKpiCard({ kpi }: { kpi: MetaKpi }) {
  return (
    <div className="rounded-xl border border-line bg-surface/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">{kpi.label}</span>
        <DeltaBadge delta={kpi.delta} trend={kpi.trend} />
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums text-ink">{kpi.value}</div>
      <p className="mt-1 text-xs leading-relaxed text-muted">{kpi.definition}</p>
      {kpi.breakdown && (
        <p className="mt-2 rounded-md bg-brand-light px-2 py-1 text-xs font-medium text-brand-dark">
          {kpi.breakdown}
        </p>
      )}
    </div>
  );
}

const L_COLORS = [
  "bg-slate-300", // L0 人が決める
  "bg-brand/30",  // L1
  "bg-brand/50",  // L2
  "bg-brand/70",  // L3
  "bg-brand",     // L4
  "bg-violet",    // L5 AI全権
];

/** 権限レベル分布バー（L0..L5 の件数を積み上げ、上限 cap を破線マーカーで表示）。 */
export function AuthorityBar({ row }: { row: AuthorityRow }) {
  const total = row.dist.reduce((a, b) => a + b, 0) || 1;
  // 平均レベル（重み付き）— 行内の到達度合いの指標。
  const avg = row.dist.reduce((sum, n, lvl) => sum + n * lvl, 0) / total;
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3">
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-ink">{row.name}</span>
          <span className="text-xs tabular-nums text-muted">
            平均 L{avg.toFixed(1)} ・ 上限 L{row.cap}
          </span>
        </div>
        <div className="relative flex h-3 overflow-hidden rounded-full bg-slate-100">
          {row.dist.map((n, lvl) => (
            <div
              key={lvl}
              className={L_COLORS[lvl]}
              style={{ width: `${(n / total) * 100}%` }}
              title={`L${lvl}: ${n}件`}
            />
          ))}
          {/* 上限マーカー（不可逆な意思決定は L4 止まり等） */}
          <div
            className="absolute top-[-2px] h-[16px] w-0.5 bg-ink/70"
            style={{ left: `${(row.cap / 5) * 100}%` }}
            title={`上限 L${row.cap}`}
          />
        </div>
      </div>
    </div>
  );
}

/** モジュール稼働ステータスのピル。 */
export function StatePill({ state }: { state: ModuleState }) {
  const map: Record<ModuleState, { cls: string; label: string }> = {
    live: { cls: "bg-good/10 text-good", label: "稼働中" },
    building: { cls: "bg-warn/10 text-warn", label: "構築中" },
    planned: { cls: "bg-slate-100 text-muted", label: "計画" },
  };
  const { cls, label } = map[state];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

/* ── 数値フォーマッタ ───────────────────────── */

/** 円を億/万で短縮表示（例: 43,000,000 → 4,300万円 / 120,000,000 → 1.2億円）。 */
export function jpy(n: number): string {
  const sign = n < 0 ? "−" : "";
  const a = Math.abs(n);
  if (a >= 100_000_000) return `${sign}${(a / 100_000_000).toFixed(1)}億円`;
  return `${sign}${Math.round(a / 10_000).toLocaleString("ja-JP")}万円`;
}

/** 0..1 or 実比率を % 表示。 */
export function pct(v: number, digits = 1): string {
  return `${(v * 100).toFixed(digits)}%`;
}
