import type { Metadata } from "next";
import "./globals.css";
import { APP_VERSION } from "@/lib/version";
import { OsNav } from "@/components/OsNav";
import { AuthStatus } from "@/components/AuthStatus";
import { getDashboardData } from "@/lib/repository/finance";

export const metadata: Metadata = {
  title: "dgloss 経営 AI OS",
  description: "dgloss 経営 AI OS — 予実モニター・現状分析・事業計画・改善ループ（経営者視点）",
};

const DATA_UPDATED = "2026-07-14 05:04";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { requests } = await getDashboardData();
  const openRequests = requests.filter((r) => r.status === "open").length;
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-line bg-white">
            <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 pt-3">
              <div className="flex items-center gap-2.5">
                <span className="bg-gradient-to-br from-brand to-violet bg-clip-text text-lg font-black tracking-tight text-transparent">
                  dgloss
                </span>
                <span className="text-sm text-faint">/</span>
                <span className="text-sm font-semibold text-ink">経営 AI OS</span>
                <span className="rounded bg-brand-light px-1.5 py-0.5 text-[11px] font-bold text-brand-dark">
                  v{APP_VERSION}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <AuthStatus />
                <span>
                  データ更新: <span className="font-medium text-ink">{DATA_UPDATED}</span>
                </span>
              </div>
            </div>
            <OsNav openRequests={openRequests} />
          </header>
          <main className="mx-auto max-w-[1400px] px-6 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
