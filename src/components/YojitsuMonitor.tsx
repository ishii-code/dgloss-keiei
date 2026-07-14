"use client";

/** 予実モニター表示（全社/事業部別）。データはサーバーから props で受け取る。 */
import { useState } from "react";
import { jpy, pct } from "@/lib/format";
import { Card } from "@/components/ui";
import { Button } from "@/components/shadcn/button";
import { achievement, amt, UnitYojitsuTable, YojitsuBarChart, YojitsuCard } from "@/components/yojitsu";
import type { Yojitsu, YojitsuMonitor as YM } from "@/types";

export function YojitsuMonitor({ y }: { y: YM }) {
  const [source, setSource] = useState<"社内計画" | "社外計画">("社内計画");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">対象月</span>
          <span className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink">
            {y.targetMonth}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">計画ソース</span>
          <div className="inline-flex rounded-lg border border-line bg-white p-0.5">
            {(["社外計画", "社内計画"] as const).map((s) => (
              <Button key={s} type="button" size="sm" variant={source === s ? "default" : "ghost"} onClick={() => setSource(s)}>
                {s}
              </Button>
            ))}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">計画: {y.planSource}</span>
      </div>

      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-ink">主要指標</h2>
        <span className="text-xs text-muted-foreground">
          {y.targetMonth} 計画 vs 見込み（{y.asOf}）
        </span>
        <span className="rounded-full bg-warn/10 px-2 py-0.5 text-[11px] font-bold text-warn">即時速報</span>
      </div>

      <section>
        <SectionLabel tone="brand" label="全社" note="4事業部の合計" />
        <div className="mt-2 grid gap-4 md:grid-cols-2">
          <CompanyCard label="全社 売上" y={y.company.revenue} tone="brand" />
          <CompanyCard label="全社 営業利益" y={y.company.profit} tone="violet" />
        </div>
      </section>

      <section>
        <SectionLabel tone="ink" label="事業部別" note={`${y.units.length}事業部`} />
        <div className="mb-2 mt-3 text-xs font-semibold text-faint">売上</div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {y.units.map((u) => (
            <YojitsuCard key={u.name} label={u.name} y={u.revenue} />
          ))}
        </div>
        <div className="mb-2 mt-4 text-xs font-semibold text-faint">営業利益</div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {y.units.map((u) => (
            <YojitsuCard key={u.name} label={u.name} y={u.profit} tone="violet" />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-ink">推移とブレイクダウン</h2>
          <p className="text-xs text-muted-foreground">FY26 通年・月次（計画 / 実績 / 見込）</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="全社 売上" hint="月次 計画 / 実績 / 見込">
            <YojitsuBarChart points={y.revenueSeries} />
          </Card>
          <Card title="全社 営業利益" hint="月次 計画 / 実績 / 見込">
            <YojitsuBarChart points={y.profitSeries} />
          </Card>
        </div>
        <Card title="事業部別 予実" hint="売上・営業利益の見込みと達成見込み">
          <UnitYojitsuTable units={y.units} />
        </Card>
      </section>
    </div>
  );
}

function SectionLabel({ tone, label, note }: { tone: "brand" | "ink"; label: string; note: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-4 w-1 rounded-full ${tone === "brand" ? "bg-brand" : "bg-ink/70"}`} />
      <h3 className="text-base font-bold text-ink">{label}</h3>
      <span className="text-xs text-muted-foreground">{note}</span>
    </div>
  );
}

function CompanyCard({ label, y, tone }: { label: string; y: Yojitsu; tone: "brand" | "violet" }) {
  const { ratio, diff } = achievement(y);
  const barPlan = y.plan > 0 ? Math.min(100, (y.actual / y.plan) * 100) : 0;
  const fcMark = y.plan > 0 ? Math.min(100, (y.forecast / y.plan) * 100) : 0;
  const accent = tone === "violet" ? "bg-violet" : "bg-brand";
  const ratioCls = ratio === null ? "text-muted-foreground" : ratio >= 1 ? "text-good" : ratio >= 0.9 ? "text-warn" : "text-bad";
  return (
    <div className={`rounded-2xl border-2 p-5 ${tone === "violet" ? "border-violet/20 bg-violet-light/50" : "border-brand/20 bg-brand-light/60"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-ink">{label}（見込み）</div>
          <div className="mt-1 text-4xl font-black tabular-nums text-ink">{amt(y.forecast)}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-muted-foreground">達成見込み</div>
          <div className={`text-2xl font-black tabular-nums ${ratioCls}`}>{ratio === null ? "—" : pct(ratio, 1)}</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span className="text-muted-foreground">計画 <span className="font-semibold text-ink">{amt(y.plan)}</span></span>
        <span className="text-muted-foreground">実績 <span className="font-semibold text-ink">{amt(y.actual)}</span> <span className="text-xs">（対象時点累計）</span></span>
        <span className={`font-semibold ${diff < 0 ? "text-bad" : "text-good"}`}>差異 {diff < 0 ? "" : "+"}{amt(diff)}</span>
      </div>
      <div className="relative mt-4 h-2.5 overflow-hidden rounded-full bg-white/70">
        <div className={`h-full ${accent}`} style={{ width: `${barPlan}%` }} />
        <div className="absolute top-[-3px] h-[16px] w-0.5 bg-ink/70" style={{ left: `${fcMark}%` }} title={`見込み ${amt(y.forecast)}`} />
      </div>
    </div>
  );
}
