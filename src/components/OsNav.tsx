"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { snapshot } from "@/data/keiei";

const OPEN_REQUESTS = snapshot.requests.filter((r) => r.status === "open").length;

const TABS = [
  { href: "/", label: "予実モニター", freq: "毎日更新" },
  { href: "/weekly", label: "週次予実", freq: "毎日更新", beta: true },
  { href: "/analysis", label: "今月:現状分析", freq: "月次更新" },
  { href: "/planning", label: "事業計画", freq: "手動更新" },
  { href: "/releases", label: "リリースノート", freq: "都度更新" },
  { href: "/requests", label: "改善リクエスト", freq: "都度更新", badge: OPEN_REQUESTS },
];

export function OsNav() {
  const path = usePathname();
  return (
    <nav className="mx-auto flex max-w-[1400px] items-end gap-1 overflow-x-auto px-4">
      {TABS.map((t) => {
        const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`group relative flex shrink-0 flex-col items-start gap-0.5 rounded-t-lg px-3 py-2 transition ${
              active ? "text-brand" : "text-ink hover:bg-surface"
            }`}
          >
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              {t.label}
              {t.beta && <span className="rounded bg-violet-light px-1 text-[9px] font-bold text-violet">β</span>}
              {t.badge && (
                <span className="rounded-full bg-bad px-1.5 text-[10px] font-bold text-white">{t.badge}</span>
              )}
            </span>
            <span className="text-[10px] text-faint">{t.freq}</span>
            <span
              className={`absolute inset-x-1 bottom-0 h-0.5 rounded-full ${active ? "bg-brand" : "bg-transparent"}`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
