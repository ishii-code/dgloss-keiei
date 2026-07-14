/**
 * 予実モニター用UI（計画 vs 実績 vs 見込み）。dgloss ブランド色・shadcn Table 土台。
 */
import type { UnitYojitsu, Yojitsu, YojitsuPoint } from "@/types";
import { jpy, pct } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table";

/** 達成見込み% と差異。計画が0以下（赤字計画等）のときは率を出さない。 */
export function achievement(y: Yojitsu): { ratio: number | null; diff: number } {
  const diff = y.forecast - y.plan;
  const ratio = y.plan > 0 ? y.forecast / y.plan : null;
  return { ratio, diff };
}

/** ▲付き金額（負値は ▲、正は素直に）。 */
export function amt(n: number): string {
  return n < 0 ? `▲${jpy(Math.abs(n))}` : jpy(n);
}

function ratioColor(ratio: number | null): string {
  if (ratio === null) return "text-muted-foreground";
  if (ratio >= 1) return "text-good";
  if (ratio >= 0.9) return "text-warn";
  return "text-bad";
}

/** 予実KPIカード（全社／事業部の 売上 or 営業利益）。 */
export function YojitsuCard({
  label,
  y,
  tone = "brand",
}: {
  label: string;
  y: Yojitsu;
  tone?: "brand" | "violet";
}) {
  const { ratio, diff } = achievement(y);
  const barPlan = y.plan > 0 ? Math.min(100, (y.actual / y.plan) * 100) : 0;
  const fcMark = y.plan > 0 ? Math.min(100, (y.forecast / y.plan) * 100) : 0;
  const barColor = tone === "violet" ? "bg-violet" : "bg-brand";

  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-ink">{amt(y.forecast)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-faint">達成見込み</div>
          <div className={`text-lg font-bold tabular-nums ${ratioColor(ratio)}`}>
            {ratio === null ? "—" : pct(ratio, 1)}
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-0.5 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">計画 {amt(y.plan)}</span>
          <span className={`tabular-nums ${diff < 0 ? "text-bad" : "text-good"}`}>
            差異 {diff < 0 ? "" : "+"}
            {amt(diff)}
          </span>
        </div>
        <div className="text-muted-foreground">実績 {amt(y.actual)}（対象時点累計）</div>
      </div>

      <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${barColor}`} style={{ width: `${barPlan}%` }} />
        <div className="absolute top-[-2px] h-[12px] w-0.5 bg-ink/70" style={{ left: `${fcMark}%` }} title={`見込み ${amt(y.forecast)}`} />
      </div>
    </div>
  );
}

/** 計画/実績/見込み のグループ棒グラフ（月次推移）。 */
export function YojitsuBarChart({ points }: { points: YojitsuPoint[] }) {
  const max = Math.max(...points.map((p) => Math.max(p.plan, p.actual ?? 0, p.forecast ?? 0)), 1);
  const h = (v: number) => `${(v / max) * 100}%`;
  return (
    <div>
      <Legend />
      <div className="mt-2 flex items-end justify-between gap-1.5">
        {points.map((p) => (
          <div key={p.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-end justify-center gap-[2px]" style={{ height: 160 }}>
              <Bar cls="bg-line" height={h(p.plan)} title={`計画 ${jpy(p.plan)}`} />
              {p.actual !== null && <Bar cls="bg-brand" height={h(p.actual)} title={`実績 ${jpy(p.actual)}`} />}
              {p.forecast !== null && <Bar cls="bg-warn" height={h(p.forecast)} title={`見込 ${jpy(p.forecast)}`} />}
            </div>
            <span className="text-[10px] text-muted-foreground">{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bar({ cls, height, title }: { cls: string; height: string; title: string }) {
  return <div className={`w-2 rounded-t-sm ${cls}`} style={{ height }} title={title} />;
}

function Legend() {
  const items = [
    { c: "bg-line", l: "計画" },
    { c: "bg-brand", l: "実績" },
    { c: "bg-warn", l: "見込" },
  ];
  return (
    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
      {items.map((i) => (
        <span key={i.l} className="inline-flex items-center gap-1">
          <span className={`h-2 w-3 rounded-sm ${i.c}`} />
          {i.l}
        </span>
      ))}
    </div>
  );
}

/** 事業部別 予実テーブル（shadcn Table）。 */
export function UnitYojitsuTable({ units }: { units: UnitYojitsu[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="px-0 text-xs">事業部</TableHead>
          <TableHead className="text-right text-xs">売上 見込</TableHead>
          <TableHead className="text-right text-xs">売上 達成</TableHead>
          <TableHead className="text-right text-xs">営業利益 見込</TableHead>
          <TableHead className="text-right text-xs">営利 達成</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {units.map((u) => {
          const rev = achievement(u.revenue);
          const prof = achievement(u.profit);
          return (
            <TableRow key={u.name} className="hover:bg-transparent">
              <TableCell className="px-0 font-medium text-ink">{u.name}</TableCell>
              <TableCell className="text-right tabular-nums text-ink">{amt(u.revenue.forecast)}</TableCell>
              <TableCell className={`text-right tabular-nums ${ratioColor(rev.ratio)}`}>
                {rev.ratio === null ? "—" : pct(rev.ratio, 0)}
              </TableCell>
              <TableCell className={`text-right tabular-nums ${u.profit.forecast < 0 ? "text-bad" : "text-ink"}`}>
                {amt(u.profit.forecast)}
              </TableCell>
              <TableCell className={`text-right tabular-nums ${ratioColor(prof.ratio)}`}>
                {prof.ratio === null ? "—" : pct(prof.ratio, 0)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
