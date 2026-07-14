"use client";

/**
 * 事業計画（A4）。FY2026 を基準に、FY2027〜2030 は成長倍率で算出（読み取り専用）。
 * 左＝全社/事業部サマリー、右＝事業部×(売上/コスト/営業利益)×(年間＋月次) 表。
 */
import { useMemo, useState } from "react";
import { snapshot } from "@/data/keiei";
import { jpy } from "@/lib/format";
import type { Fiscal } from "@/types";

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

export default function Page() {
  const { months, fiscals, base, growth } = snapshot.plan;
  const [fy, setFy] = useState<Fiscal>("FY2026");

  // 選択年度の実数（倍率適用）。
  const rows = useMemo(() => {
    const g = growth[fy];
    return base.map((r) => {
      const revenue = r.revenue.map((v) => Math.round(v * g));
      const cost = r.cost.map((v) => Math.round(v * g));
      const profit = revenue.map((v, i) => v - cost[i]);
      return { unit: r.unit, revenue, cost, profit };
    });
  }, [fy, base, growth]);

  const company = useMemo(() => {
    const rev = sum(rows.map((r) => sum(r.revenue)));
    const cost = sum(rows.map((r) => sum(r.cost)));
    return { rev, cost, profit: rev - cost };
  }, [rows]);

  return (
    <div className="space-y-5">
      {/* FY トグル */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand">事業計画</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">最終アウトプット / {fy} 計画（試算）</h1>
          <p className="mt-0.5 text-xs text-muted">単位: 円（万/億表示） ・ FY2026基準 ×{growth[fy].toFixed(1)}</p>
        </div>
        <div className="inline-flex rounded-lg border border-line bg-white p-0.5">
          {fiscals.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFy(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                fy === f ? "bg-brand text-white" : "text-muted hover:text-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* 左：サマリー */}
        <aside className="space-y-3">
          <div className="rounded-2xl border-2 border-brand/20 bg-brand-light/60 p-4">
            <div className="text-sm font-bold text-ink">全社合計</div>
            <dl className="mt-2 space-y-1 text-sm">
              <SummaryRow label="売上高" value={jpy(company.rev)} />
              <SummaryRow label="営業利益" value={jpy(company.profit)} accent={company.profit < 0 ? "bad" : "ink"} />
            </dl>
          </div>
          {rows.map((r) => {
            const rev = sum(r.revenue);
            const profit = sum(r.profit);
            return (
              <div key={r.unit} className="rounded-xl border border-line bg-white p-4">
                <div className="text-sm font-semibold text-ink">{r.unit}</div>
                <dl className="mt-2 space-y-1 text-sm">
                  <SummaryRow label="売上高" value={jpy(rev)} />
                  <SummaryRow label="営業利益" value={jpy(profit)} accent={profit < 0 ? "bad" : "ink"} />
                </dl>
              </div>
            );
          })}
        </aside>

        {/* 右：月次テーブル */}
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[900px] text-right text-xs">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="sticky left-0 bg-white px-3 py-2 text-left font-medium">事業部</th>
                <th className="px-2 py-2 font-medium">項目</th>
                <th className="bg-surface px-2 py-2 font-semibold text-ink">年間</th>
                {months.map((m) => (
                  <th key={m} className="px-2 py-2 font-medium">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <UnitRows key={r.unit} unit={r.unit} revenue={r.revenue} cost={r.cost} profit={r.profit} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted">
        ※ 読み取り専用（試算モック）。FY2026 を実数、FY2027〜2030 は成長倍率で算出。将来は事業計画マスタ（編集・保存）に接続。
      </p>
    </div>
  );
}

function SummaryRow({ label, value, accent = "ink" }: { label: string; value: string; accent?: "ink" | "bad" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={`font-bold tabular-nums ${accent === "bad" ? "text-bad" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

function UnitRows({
  unit,
  revenue,
  cost,
  profit,
}: {
  unit: string;
  revenue: number[];
  cost: number[];
  profit: number[];
}) {
  const man = (n: number) => Math.round(n / 10_000).toLocaleString("ja-JP");
  const Line = ({ label, arr, strong }: { label: string; arr: number[]; strong?: boolean }) => (
    <tr className={`border-b border-line/60 ${strong ? "" : "text-muted"}`}>
      <td className="sticky left-0 bg-white px-3 py-1.5 text-left">{label === "売上" ? <span className="font-semibold text-ink">{unit}</span> : ""}</td>
      <td className={`px-2 py-1.5 text-left ${strong ? "font-semibold text-ink" : ""}`}>{label}</td>
      <td className="bg-surface px-2 py-1.5 font-semibold tabular-nums text-ink">{man(arr.reduce((a, b) => a + b, 0))}</td>
      {arr.map((v, i) => (
        <td key={i} className="px-2 py-1.5 tabular-nums">{man(v)}</td>
      ))}
    </tr>
  );
  return (
    <>
      <Line label="売上" arr={revenue} strong />
      <Line label="コスト" arr={cost} />
      <Line label="営業利益" arr={profit} strong />
    </>
  );
}
