"use client";

/**
 * 改善リクエスト（A5）。ステータス別タブで集約・チェック。
 */
import { useMemo, useState } from "react";
import { snapshot } from "@/data/keiei";
import type { ImprovementRequest, RequestStatus } from "@/types";

type Filter = "all" | RequestStatus;

const STATUS_META: Record<RequestStatus, { label: string; cls: string }> = {
  open: { label: "未対応", cls: "bg-bad/10 text-bad" },
  in_progress: { label: "対応中", cls: "bg-warn/10 text-warn" },
  done: { label: "完了", cls: "bg-good/10 text-good" },
};

export default function Page() {
  const reqs = snapshot.requests;
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(
    () => ({
      all: reqs.length,
      open: reqs.filter((r) => r.status === "open").length,
      in_progress: reqs.filter((r) => r.status === "in_progress").length,
      done: reqs.filter((r) => r.status === "done").length,
    }),
    [reqs],
  );

  const shown = filter === "all" ? reqs : reqs.filter((r) => r.status === filter);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "すべて" },
    { key: "open", label: "未対応" },
    { key: "in_progress", label: "対応中" },
    { key: "done", label: "完了" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-wide text-brand">改善リクエスト</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">改善リクエスト</h1>
        <p className="mt-0.5 text-sm text-muted">各事業部・院内アプリからの改善要望をステータス別に集約・チェック</p>
      </div>

      {/* タブ */}
      <div className="flex flex-wrap gap-1 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key)}
            className={`flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-sm font-semibold transition ${
              filter === t.key ? "border-b-2 border-brand text-brand" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
            <span className="rounded-full bg-surface px-1.5 text-[11px] tabular-nums text-muted">
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* 一覧 */}
      <ul className="space-y-2">
        {shown.map((r) => (
          <RequestRow key={r.id} req={r} />
        ))}
        {shown.length === 0 && (
          <li className="rounded-2xl border border-line bg-white p-8 text-center text-sm text-muted">
            該当するリクエストはありません。
          </li>
        )}
      </ul>
    </div>
  );
}

function RequestRow({ req }: { req: ImprovementRequest }) {
  const s = STATUS_META[req.status];
  return (
    <li className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 shadow-sm">
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>{s.label}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-ink">{req.title}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
          <span className="tabular-nums text-faint">{req.id}</span>
          <span>{req.source}</span>
          <span className="rounded bg-surface px-1.5 py-0.5">{req.category}</span>
          <span className="tabular-nums">{req.date}</span>
        </div>
      </div>
    </li>
  );
}
