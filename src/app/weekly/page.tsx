/**
 * 週次予実（A3）。木〜水を1週サイクル。
 * 売上=週次実績あり／コスト・営業利益=週次実績なし（計画・見込みのみ）。
 */
import { snapshot } from "@/data/keiei";
import { jpy, pct } from "@/lib/format";
import { Card } from "@/components/ui";
import { YojitsuBarChart, amt } from "@/components/yojitsu";
import type { WeeklyMetric } from "@/types";

export default function Page() {
  const w = snapshot.weekly;

  return (
    <div className="space-y-6">
      {/* コントロール行 */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink">
          {w.unit}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">対象週</span>
          <span className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink">
            {w.targetWeek}
          </span>
        </div>
        <span className="rounded-full bg-warn/10 px-2 py-0.5 text-[11px] font-bold text-warn">{w.note}</span>
        <span className="text-xs text-muted-foreground">木〜水を1週サイクル。売上=週次実績／コスト・営利=計画・見込のみ</span>
      </div>

      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-ink">主要指標</h2>
        <span className="text-xs text-muted-foreground">{w.targetWeek}（{w.asOf}）</span>
      </div>

      {/* 週次 KPI */}
      <div className="grid gap-4 md:grid-cols-3">
        <WeeklyCard label="売上（週）" metric={w.revenue} kind="revenue" />
        <WeeklyCard label="コスト（週）" metric={w.cost} kind="cost" />
        <WeeklyCard label="営業利益（週）" metric={w.profit} kind="profit" />
      </div>

      {/* 推移とブレイクダウン */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-ink">推移とブレイクダウン</h2>
          <p className="text-xs text-muted-foreground">週次 計画 / 実績 / 見込（1W〜5W）</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="週次 売上" hint="計画 / 実績 / 見込">
            <YojitsuBarChart points={w.revenue.series} />
          </Card>
          <Card title="週次 コスト" hint="計画 / 見込（週次実績なし）">
            <YojitsuBarChart points={w.cost.series} />
          </Card>
          <Card title="週次 営業利益" hint="計画 / 見込（週次実績なし）">
            <YojitsuBarChart points={w.profit.series} />
          </Card>
        </div>
      </section>
    </div>
  );
}

/** 週次KPIカード。kind で達成の良し悪しを色分け（コストは超過=悪）。 */
function WeeklyCard({
  label,
  metric,
  kind,
}: {
  label: string;
  metric: WeeklyMetric;
  kind: "revenue" | "cost" | "profit";
}) {
  const { plan, actual, forecast } = metric.y;
  const diff = forecast - plan;
  const ratio = plan !== 0 ? forecast / plan : null;

  // 達成の色: コストは低いほど良い（超過=赤）。売上/営利は高いほど良い。
  let ratioCls = "text-muted-foreground";
  if (ratio !== null) {
    if (kind === "cost") ratioCls = ratio <= 1 ? "text-good" : "text-bad";
    else ratioCls = ratio >= 1 ? "text-good" : ratio >= 0.9 ? "text-warn" : "text-bad";
  }
  const barColor = kind === "cost" ? "bg-warn" : kind === "profit" ? "bg-violet" : "bg-brand";
  const barPct = plan > 0 ? Math.min(100, ((metric.hasActual ? actual : forecast) / plan) * 100) : 0;
  const fcMark = plan > 0 ? Math.min(100, (forecast / plan) * 100) : 0;

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{label}（見込み）</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-ink">{amt(forecast)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-faint">達成見込み</div>
          <div className={`text-lg font-bold tabular-nums ${ratioCls}`}>
            {ratio === null ? "—" : pct(ratio, 1)}
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-0.5 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">計画 {amt(plan)}</span>
          <span className={`tabular-nums ${diff < 0 ? "text-bad" : "text-good"}`}>
            差異 {diff < 0 ? "" : "+"}{amt(diff)}
          </span>
        </div>
        <div className="text-muted-foreground">
          {metric.hasActual ? `実績 ${amt(actual)}（週内累計）` : "週次のコスト実績なし（月次で確認）"}
        </div>
      </div>
      <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${barColor}`} style={{ width: `${barPct}%` }} />
        <div className="absolute top-[-2px] h-[12px] w-0.5 bg-ink/70" style={{ left: `${fcMark}%` }} title={`見込み ${jpy(forecast)}`} />
      </div>
    </div>
  );
}
