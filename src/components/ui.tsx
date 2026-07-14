/**
 * 経営ダッシュボードのドメインUI部品（shadcn/ui プリミティブ上に構築）。
 * 見た目は dgloss ブランドのまま、コンテナ=shadcn Card / バッジ=shadcn Badge を土台にする。
 */
import type { AuthorityRow, MetaKpi, ModuleState, Trend } from "@/types";
import { cn } from "@/lib/utils";
import { Card as SCard } from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
export { jpy, pct } from "@/lib/format";

/** カード枠（shadcn Card 土台）。title/hint/action の薄いラッパ。 */
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
    <SCard className="rounded-2xl border-line p-5">
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-bold text-ink">{title}</h2>}
            {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </SCard>
  );
}

/** 週次デルタのバッジ（改善=緑 / 悪化=赤 / 横ばい=灰）。 */
export function DeltaBadge({ delta, trend }: { delta: string; trend: Trend }) {
  const map: Record<Trend, { cls: string; mark: string }> = {
    up: { cls: "bg-good/10 text-good", mark: "▲" },
    down: { cls: "bg-bad/10 text-bad", mark: "▼" },
    flat: { cls: "bg-slate-100 text-muted-foreground", mark: "—" },
  };
  const { cls, mark } = map[trend];
  return (
    <Badge className={cn("rounded-md border-transparent px-1.5 py-0.5 font-bold tabular-nums", cls)}>
      <span aria-hidden>{mark}</span>
      {delta}
    </Badge>
  );
}

/** メタKPIカード（自動化率・改善速度・AI稼働人月）。 */
export function MetaKpiCard({ kpi }: { kpi: MetaKpi }) {
  return (
    <SCard className="rounded-xl border-line bg-surface/60 p-4 shadow-none">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{kpi.label}</span>
        <DeltaBadge delta={kpi.delta} trend={kpi.trend} />
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums text-ink">{kpi.value}</div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{kpi.definition}</p>
      {kpi.breakdown && (
        <p className="mt-2 rounded-md bg-brand-light px-2 py-1 text-xs font-medium text-brand-dark">
          {kpi.breakdown}
        </p>
      )}
    </SCard>
  );
}

const L_COLORS = [
  "bg-slate-300",
  "bg-brand/30",
  "bg-brand/50",
  "bg-brand/70",
  "bg-brand",
  "bg-violet",
];

/** 権限レベル分布バー（L0..L5 を積み上げ、上限 cap を破線マーカーで表示）。 */
export function AuthorityBar({ row }: { row: AuthorityRow }) {
  const total = row.dist.reduce((a, b) => a + b, 0) || 1;
  const avg = row.dist.reduce((sum, n, lvl) => sum + n * lvl, 0) / total;
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3">
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-ink">{row.name}</span>
          <span className="text-xs tabular-nums text-muted-foreground">
            平均 L{avg.toFixed(1)} ・ 上限 L{row.cap}
          </span>
        </div>
        <div className="relative flex h-3 overflow-hidden rounded-full bg-slate-100">
          {row.dist.map((n, lvl) => (
            <div key={lvl} className={L_COLORS[lvl]} style={{ width: `${(n / total) * 100}%` }} title={`L${lvl}: ${n}件`} />
          ))}
          <div className="absolute top-[-2px] h-[16px] w-0.5 bg-ink/70" style={{ left: `${(row.cap / 5) * 100}%` }} title={`上限 L${row.cap}`} />
        </div>
      </div>
    </div>
  );
}

/** モジュール稼働ステータスのバッジ。 */
export function StatePill({ state }: { state: ModuleState }) {
  const map: Record<ModuleState, { cls: string; label: string }> = {
    live: { cls: "bg-good/10 text-good", label: "稼働中" },
    building: { cls: "bg-warn/10 text-warn", label: "構築中" },
    planned: { cls: "bg-slate-100 text-muted-foreground", label: "計画" },
  };
  const { cls, label } = map[state];
  return (
    <Badge className={cn("border-transparent px-2.5 py-1 font-semibold", cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}
