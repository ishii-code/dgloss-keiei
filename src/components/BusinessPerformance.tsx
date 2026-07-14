"use client";

/**
 * 業績セクション（実績・日次/週次/月次）。期間トグル=shadcn Button、内訳表=shadcn Table。
 */
import { useState } from "react";
import type { Performance, Period, PeriodPerf, SeriesPoint } from "@/types";
import { Card, DeltaBadge, jpy, pct } from "@/components/ui";
import { Button } from "@/components/shadcn/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table";

const PERIOD_LABEL: Record<Period, string> = { daily: "日次", weekly: "週次", monthly: "月次" };

export function BusinessPerformance({ performance }: { performance: Performance }) {
  const [period, setPeriod] = useState<Period>("monthly");
  const data = performance[period];
  const { totals } = data;
  const profit = totals.revenue - totals.cost;
  const margin = totals.revenue > 0 ? profit / totals.revenue : 0;
  const attain = totals.target > 0 ? totals.revenue / totals.target : 0;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand">A / 業績</p>
          <h2 className="mt-1 text-lg font-bold text-ink">売上・コスト</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {PERIOD_LABEL[period]}で会社全体と事業部別の数字を確認 ・ {data.label}
            <span className="ml-1 text-xs">（{data.note}）</span>
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-line bg-white p-0.5">
          {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
            <Button
              key={p}
              type="button"
              size="sm"
              variant={period === p ? "default" : "ghost"}
              onClick={() => setPeriod(p)}
            >
              {PERIOD_LABEL[p]}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile label="売上" value={jpy(totals.revenue)} delta={totals.revenueDelta} trend={totals.revenueTrend} accent="brand" />
        <KpiTile label="コスト" value={jpy(totals.cost)} sub={`売上比 ${pct(totals.cost / totals.revenue, 0)}`} />
        <KpiTile label="営業利益" value={jpy(profit)} delta={totals.profitDelta} trend={totals.profitTrend} accent={profit >= 0 ? "good" : "bad"} />
        <KpiTile label="営業利益率" value={pct(margin, 1)} sub={`対目標 売上 ${pct(attain, 0)}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card title="売上・コスト推移" hint="バー=売上（下:コスト / 上:営業利益）">
            <TrendChart series={data.series} />
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card title="事業部別の数字進捗" hint="売上 / 営業利益 / 対目標進捗">
            <UnitTable data={data} />
          </Card>
        </div>
      </div>
    </section>
  );
}

function KpiTile({
  label,
  value,
  delta,
  trend,
  sub,
  accent = "ink",
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  sub?: string;
  accent?: "brand" | "good" | "bad" | "ink";
}) {
  const valueColor =
    accent === "brand" ? "text-brand-dark" : accent === "good" ? "text-good" : accent === "bad" ? "text-bad" : "text-ink";
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        {delta && trend && <DeltaBadge delta={delta} trend={trend} />}
      </div>
      <div className={`mt-2 text-2xl font-bold tabular-nums ${valueColor}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function TrendChart({ series }: { series: SeriesPoint[] }) {
  const max = Math.max(...series.map((s) => s.revenue), 1);
  return (
    <div className="flex h-48 items-end justify-between gap-2">
      {series.map((s) => {
        const h = (s.revenue / max) * 100;
        const profit = s.revenue - s.cost;
        const costRatio = s.revenue > 0 ? s.cost / s.revenue : 0;
        const loss = profit < 0;
        return (
          <div key={s.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-col justify-end" style={{ height: "160px" }}>
              <div
                className="relative w-full overflow-hidden rounded-md bg-slate-100"
                style={{ height: `${h}%` }}
                title={`売上 ${jpy(s.revenue)} / コスト ${jpy(s.cost)} / 利益 ${jpy(profit)}`}
              >
                <div className="absolute bottom-0 w-full bg-slate-300" style={{ height: `${Math.min(100, costRatio * 100)}%` }} />
                {!loss && (
                  <div className="absolute bottom-0 w-full bg-brand" style={{ height: "100%", clipPath: `inset(0 0 ${Math.min(100, costRatio * 100)}% 0)` }} />
                )}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function UnitTable({ data }: { data: PeriodPerf }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="px-0 text-xs">事業部</TableHead>
          <TableHead className="text-right text-xs">売上</TableHead>
          <TableHead className="text-right text-xs">営業利益</TableHead>
          <TableHead className="text-right text-xs">前期比</TableHead>
          <TableHead className="pl-3 text-xs">対目標進捗</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.units.map((u) => {
          const profit = u.revenue - u.cost;
          const attain = u.target > 0 ? u.revenue / u.target : 0;
          const loss = profit < 0;
          return (
            <TableRow key={u.name} className="hover:bg-transparent">
              <TableCell className="px-0 font-medium text-ink">{u.name}</TableCell>
              <TableCell className="text-right tabular-nums text-ink">{jpy(u.revenue)}</TableCell>
              <TableCell className={`text-right tabular-nums ${loss ? "text-bad" : "text-ink"}`}>{jpy(profit)}</TableCell>
              <TableCell className="text-right">
                <DeltaBadge delta={u.delta} trend={u.trend} />
              </TableCell>
              <TableCell className="pl-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full ${attain >= 1 ? "bg-good" : "bg-brand"}`} style={{ width: `${Math.min(100, attain * 100)}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{pct(attain, 0)}</span>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
