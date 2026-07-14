"use client";

/**
 * 業績セクション（A）: 会社の売上・コストを 日次/週次/月次・事業部別で確認。
 * 期間トグルで snapshot.performance の daily/weekly/monthly を切り替える。
 */
import { useState } from "react";
import type { Performance, Period, PeriodPerf, SeriesPoint } from "@/types";
import { Card, DeltaBadge, jpy, pct } from "@/components/ui";

const PERIOD_LABEL: Record<Period, string> = {
  daily: "日次",
  weekly: "週次",
  monthly: "月次",
};

export function BusinessPerformance({ performance }: { performance: Performance }) {
  const [period, setPeriod] = useState<Period>("monthly");
  const data = performance[period];
  const { totals } = data;
  const profit = totals.revenue - totals.cost;
  const margin = totals.revenue > 0 ? profit / totals.revenue : 0;
  const attain = totals.target > 0 ? totals.revenue / totals.target : 0;

  return (
    <section className="space-y-4">
      {/* セクション見出し + 期間トグル */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand">A / 業績</p>
          <h2 className="mt-1 text-lg font-bold text-ink">売上・コスト</h2>
          <p className="mt-0.5 text-sm text-muted">
            {PERIOD_LABEL[period]}で会社全体と事業部別の数字を確認 ・ {data.label}
            <span className="ml-1 text-xs">（{data.note}）</span>
          </p>
        </div>
        <PeriodToggle period={period} onChange={setPeriod} />
      </div>

      {/* 全社サマリー KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="売上"
          value={jpy(totals.revenue)}
          delta={totals.revenueDelta}
          trend={totals.revenueTrend}
          accent="brand"
        />
        <KpiTile label="コスト" value={jpy(totals.cost)} sub={`売上比 ${pct(totals.cost / totals.revenue, 0)}`} />
        <KpiTile
          label="営業利益"
          value={jpy(profit)}
          delta={totals.profitDelta}
          trend={totals.profitTrend}
          accent={profit >= 0 ? "good" : "bad"}
        />
        <KpiTile label="営業利益率" value={pct(margin, 1)} sub={`対目標 売上 ${pct(attain, 0)}`} />
      </div>

      {/* 推移 + 事業部別 */}
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

function PeriodToggle({ period, onChange }: { period: Period; onChange: (p: Period) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-white p-0.5">
      {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
            period === p ? "bg-brand text-white" : "text-muted hover:bg-surface hover:text-ink"
          }`}
        >
          {PERIOD_LABEL[p]}
        </button>
      ))}
    </div>
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
        <span className="text-xs font-semibold text-muted">{label}</span>
        {delta && trend && <DeltaBadge delta={delta} trend={trend} />}
      </div>
      <div className={`mt-2 text-2xl font-bold tabular-nums ${valueColor}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  );
}

/** 売上を全高、内訳をコスト(下)+営業利益(上)で積む簡易バーチャート。 */
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
                {/* 下=コスト */}
                <div
                  className="absolute bottom-0 w-full bg-slate-300"
                  style={{ height: `${Math.min(100, costRatio * 100)}%` }}
                />
                {/* 上=営業利益（赤字なら bad） */}
                {!loss && (
                  <div
                    className="absolute bottom-0 w-full bg-brand"
                    style={{ height: "100%", clipPath: `inset(0 0 ${Math.min(100, costRatio * 100)}% 0)` }}
                  />
                )}
              </div>
            </div>
            <span className="text-[10px] text-muted">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function UnitTable({ data }: { data: PeriodPerf }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            <th className="pb-2 font-medium">事業部</th>
            <th className="pb-2 text-right font-medium">売上</th>
            <th className="pb-2 text-right font-medium">営業利益</th>
            <th className="pb-2 text-right font-medium">前期比</th>
            <th className="pb-2 pl-3 font-medium">対目標進捗</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data.units.map((u) => {
            const profit = u.revenue - u.cost;
            const attain = u.target > 0 ? u.revenue / u.target : 0;
            const loss = profit < 0;
            return (
              <tr key={u.name}>
                <td className="py-2.5 pr-2 font-medium text-ink">{u.name}</td>
                <td className="py-2.5 text-right tabular-nums text-ink">{jpy(u.revenue)}</td>
                <td className={`py-2.5 text-right tabular-nums ${loss ? "text-bad" : "text-ink"}`}>{jpy(profit)}</td>
                <td className="py-2.5 text-right">
                  <DeltaBadge delta={u.delta} trend={u.trend} />
                </td>
                <td className="py-2.5 pl-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full ${attain >= 1 ? "bg-good" : "bg-brand"}`}
                        style={{ width: `${Math.min(100, attain * 100)}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs tabular-nums text-muted">{pct(attain, 0)}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
