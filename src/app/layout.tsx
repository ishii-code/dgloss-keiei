import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { APP_VERSION } from "@/lib/version";

export const metadata: Metadata = {
  title: "経営ダッシュボード | dgloss OS",
  description: "dgloss OS v2.0 — KGI・メタKPI・権限レベルの俯瞰（経営者視点）",
};

const NAV = [
  { href: "/", label: "経営ダッシュボード" },
  { href: "/kpi", label: "KPIレジストリ" },
  { href: "/issues", label: "Issue Board" },
  { href: "/releases", label: "リリース" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen">
          <header className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="rounded-lg bg-brand px-2 py-1 text-sm font-black tracking-tight text-white">
                  dgloss
                </span>
                <span className="text-sm font-semibold text-ink">OS 経営ダッシュボード</span>
                <span className="rounded bg-surface px-1.5 py-0.5 text-[11px] font-medium text-muted">v{APP_VERSION}</span>
              </Link>
              <nav className="flex items-center gap-1 text-sm">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="rounded-lg px-3 py-1.5 text-muted transition hover:bg-surface hover:text-ink"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
