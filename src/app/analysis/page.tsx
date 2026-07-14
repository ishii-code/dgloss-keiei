/**
 * 今月:現状分析 — 改善エンジン（機能・オペレーション改善の元）と実績内訳。
 * KGI①②③ / メタKPI / 意思決定の権限レベル / モジュール別ステータス ＋ 日次/週次/月次の実績。
 */
import { AuthorityBar, Card, MetaKpiCard, StatePill } from "@/components/ui";
import { Separator } from "@/components/shadcn/separator";
import { BusinessPerformance } from "@/components/BusinessPerformance";
import { snapshot } from "@/data/keiei";
import type { Kgi } from "@/types";

export default function Page() {
  const { headline, performance, kgis, metaKpis, authority, modules } = snapshot;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold tracking-wide text-violet">今月:現状分析</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">改善エンジン & 実績内訳</h1>
        <p className="mt-1 text-sm text-muted-foreground">{headline}</p>
      </div>

      {/* KGI */}
      <div className="grid gap-4 md:grid-cols-3">
        {kgis.map((k) => (
          <KgiCard key={k.id} kgi={k} />
        ))}
      </div>

      <Card title="メタKPI" hint="日々ドライブする定量指標（③AI労働力の延長で①②に波及）">
        <div className="grid gap-4 sm:grid-cols-3">
          {metaKpis.map((m) => (
            <MetaKpiCard key={m.id} kpi={m} />
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title="意思決定の権限レベル（KGI①の進捗指標）"
            hint="L0 人が決める → L5 AI全権 ／ 不可逆な意思決定は L4 止まり"
            action={<AuthorityLegend />}
          >
            <div className="space-y-4">
              {authority.map((row) => (
                <AuthorityBar key={row.name} row={row} />
              ))}
            </div>
          </Card>
        </div>
        <Card title="モジュール別ステータス" hint="カーネル / デーモン / 各業務モジュール">
          <ul className="divide-y divide-line">
            {modules.map((m) => (
              <li key={m.name} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink">{m.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{m.note}</div>
                </div>
                <StatePill state={m.state} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Separator className="bg-line" />

      {/* 実績（日次/週次/月次） */}
      <BusinessPerformance performance={performance} />
    </div>
  );
}

function KgiCard({ kgi }: { kgi: Kgi }) {
  const isViolet = kgi.id === "autonomy";
  const pctToTarget = kgi.value !== null && kgi.target ? Math.min(100, (kgi.value / kgi.target) * 100) : null;
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-white ${
            isViolet ? "bg-violet" : "bg-brand"
          }`}
        >
          {kgi.index}
        </span>
        <div>
          <div className="text-xs text-muted-foreground">
            KGI {kgi.index}（{kgi.tag}）
          </div>
          <div className="text-sm font-bold text-ink">{kgi.title}</div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{kgi.definition}</p>
      <div className="mt-3">
        {kgi.value !== null && kgi.target !== null ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums text-ink">
                {kgi.unit === "L" ? `L${kgi.value}` : kgi.value}
              </span>
              <span className="text-sm text-muted-foreground">
                / {kgi.unit === "L" ? `L${kgi.target}` : `${kgi.target}`}
                {kgi.unit && kgi.unit !== "L" ? ` ${kgi.unit}` : ""}
              </span>
            </div>
            {pctToTarget !== null && (
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={isViolet ? "h-full bg-violet" : "h-full bg-brand"}
                  style={{ width: `${pctToTarget}%` }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-sm font-semibold text-violet">状態KGI（定性）</div>
        )}
      </div>
      {kgi.note && <p className="mt-2 text-xs text-muted-foreground">{kgi.note}</p>}
    </div>
  );
}

function AuthorityLegend() {
  return (
    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-3 rounded-sm bg-slate-300" />
        L0
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-3 rounded-sm bg-brand" />
        L4
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-3 rounded-sm bg-violet" />
        L5
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-3 w-0.5 bg-ink/70" />
        上限
      </span>
    </div>
  );
}
