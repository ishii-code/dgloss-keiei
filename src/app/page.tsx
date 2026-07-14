/**
 * 経営ダッシュボード（ワイヤーフレーム section 02）。
 * KGI①②③ / メタKPI / 意思決定の権限レベル / モジュール別ステータス を俯瞰する。
 * データは src/data/keiei.ts の単一スナップショットから供給（UIにハードコードしない）。
 */
import { AuthorityBar, Card, MetaKpiCard, StatePill } from "@/components/ui";
import { snapshot } from "@/data/keiei";
import type { Kgi } from "@/types";

export default function Page() {
  const { updatedAt, headline, kgis, metaKpis, authority, modules } = snapshot;

  return (
    <div className="space-y-6">
      {/* ページヘッダ */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand">02 / 経営者視点</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">経営ダッシュボード</h1>
          <p className="mt-1 text-sm text-muted">KGI・メタKPI・権限レベルの俯瞰</p>
        </div>
        <div className="text-right text-xs text-muted">
          <div>最終更新 {updatedAt}</div>
          <div className="mt-0.5">出所: KPIレジストリ / Work Monitor（暫定モック）</div>
        </div>
      </div>

      {/* 主眼バナー */}
      <div className="rounded-2xl border border-brand/20 bg-brand-light px-5 py-3 text-sm font-medium text-brand-dark">
        {headline}
      </div>

      {/* KGI ①②③ */}
      <div className="grid gap-4 md:grid-cols-3">
        {kgis.map((k) => (
          <KgiCard key={k.id} kgi={k} />
        ))}
      </div>

      {/* メタKPI（日々ドライブ） */}
      <Card title="メタKPI" hint="日々ドライブする定量指標（③AI労働力の延長で①②に波及）">
        <div className="grid gap-4 sm:grid-cols-3">
          {metaKpis.map((m) => (
            <MetaKpiCard key={m.id} kpi={m} />
          ))}
        </div>
      </Card>

      {/* 権限レベル + モジュールステータス */}
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
                  <div className="truncate text-xs text-muted">{m.note}</div>
                </div>
                <StatePill state={m.state} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/** KGIカード（①権限移譲 / ②状態 / ③労働力）。 */
function KgiCard({ kgi }: { kgi: Kgi }) {
  const isViolet = kgi.id === "autonomy";
  const pctToTarget =
    kgi.value !== null && kgi.target ? Math.min(100, (kgi.value / kgi.target) * 100) : null;

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
          <div className="text-xs text-muted">KGI {kgi.index}（{kgi.tag}）</div>
          <div className="text-sm font-bold text-ink">{kgi.title}</div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">{kgi.definition}</p>

      <div className="mt-3">
        {kgi.value !== null && kgi.target !== null ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums text-ink">
                {kgi.unit === "L" ? `L${kgi.value}` : kgi.value}
              </span>
              <span className="text-sm text-muted">
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

      {kgi.note && <p className="mt-2 text-xs text-muted">{kgi.note}</p>}
    </div>
  );
}

/** 権限レベルバーの凡例。 */
function AuthorityLegend() {
  return (
    <div className="flex items-center gap-2 text-[11px] text-muted">
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-3 rounded-sm bg-slate-300" />L0
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-3 rounded-sm bg-brand" />L4
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-3 rounded-sm bg-violet" />L5
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-3 w-0.5 bg-ink/70" />上限
      </span>
    </div>
  );
}
