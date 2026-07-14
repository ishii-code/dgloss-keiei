"use client";

/**
 * 予実モニター（メイン）。計画 vs 実績 vs 見込みを 全社＋事業部別で俯瞰。
 * リファレンス「経営 AI OS」の予実モニターに準拠（dgloss データ）。
 */
import { useState } from "react";
import { snapshot } from "@/data/keiei";
import { Card } from "@/components/ui";
import {
  UnitYojitsuTable,
  YojitsuBarChart,
  YojitsuCard,
} from "@/components/yojitsu";

export default function Page() {
  const y = snapshot.yojitsu;
  const [source, setSource] = useState<"社内計画" | "社外計画">("社内計画");

  return (
    <div className="space-y-6">
      {/* コントロール行 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">対象月</span>
            <span className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink">
              {y.targetMonth}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">計画ソース</span>
            <div className="inline-flex rounded-lg border border-line bg-white p-0.5">
              {(["社外計画", "社内計画"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={`rounded-md px-3 py-1 text-sm font-semibold transition ${
                    source === s ? "bg-brand text-white" : "text-muted hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs text-muted">計画: {y.planSource}</span>
        </div>
      </div>

      {/* 主要指標 */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-bold text-ink">主要指標</h2>
          <span className="text-xs text-muted">{y.targetMonth} 計画 vs 見込み（{y.asOf}）</span>
          <span className="rounded-full bg-warn/10 px-2 py-0.5 text-[11px] font-bold text-warn">即時速報</span>
        </div>

        {/* 売上 */}
        <div className="mb-2 text-xs font-semibold text-faint">売上</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <YojitsuCard label="全社 売上（見込み）" y={y.company.revenue} />
          {y.units.map((u) => (
            <YojitsuCard key={u.name} label={`${u.name} 売上`} y={u.revenue} />
          ))}
        </div>

        {/* 営業利益 */}
        <div className="mb-2 mt-4 text-xs font-semibold text-faint">営業利益</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <YojitsuCard label="全社 営業利益（見込み）" y={y.company.profit} tone="violet" />
          {y.units.map((u) => (
            <YojitsuCard key={u.name} label={`${u.name} 営利`} y={u.profit} tone="violet" />
          ))}
        </div>
      </section>

      {/* 推移とブレイクダウン */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-ink">推移とブレイクダウン</h2>
          <p className="text-xs text-muted">FY26 通年・月次（計画 / 実績 / 見込）</p>
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
