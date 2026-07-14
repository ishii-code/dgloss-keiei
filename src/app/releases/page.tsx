/** リリース履歴（社内向け）。RELEASE.md §5 の /releases 標準。 */
import { APP_VERSION } from "@/lib/version";
import { SYSTEM, releases } from "@/lib/releases";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wide text-brand">リリース</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">リリース履歴</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {SYSTEM} ・ 現在バージョン v{APP_VERSION}（版数・履歴は Conventional Commits から自動更新）
        </p>
      </div>

      <ol className="space-y-4">
        {releases.map((r) => (
          <li key={r.version} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-baseline gap-3">
              <span className="rounded-md bg-brand-light px-2 py-0.5 text-sm font-bold text-brand-dark">
                v{r.version}
              </span>
              <span className="text-xs text-muted-foreground">{r.date}</span>
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink">
              {r.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
