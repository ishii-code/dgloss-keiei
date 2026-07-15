"use client";

/**
 * ログイン（メールOTP／マジックリンク）。Google OAuth不要。
 * メール宛にログインリンクを送信 → /auth/callback で code 交換。
 * 社内ドメイン制限はサーバー側（callback/middleware の isAllowedEmail）で強制。
 */
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ALLOWED_EMAIL_DOMAINS } from "@/lib/supabase/config";
import { Button } from "@/components/shadcn/button";

function LoginInner() {
  const next = useSearchParams().get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo } });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-20 max-w-sm rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
      <div className="mb-1 bg-gradient-to-br from-brand to-violet bg-clip-text text-2xl font-black tracking-tight text-transparent">
        dgloss
      </div>
      <div className="text-sm font-semibold text-ink">経営 AI OS</div>

      {sent ? (
        <div className="mt-6 rounded-lg bg-brand-light px-4 py-6 text-sm text-brand-dark">
          <div className="font-bold">ログインリンクを送信しました</div>
          <div className="mt-1 text-xs text-muted-foreground">{email} のメールを開き、リンクをクリックしてください。</div>
        </div>
      ) : (
        <form onSubmit={sendLink} className="mt-6 space-y-3 text-left">
          <label className="block text-xs font-semibold text-muted-foreground">社内メールアドレス</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@dgloss.co.jp"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink outline-none focus:border-brand"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "送信中…" : "ログインリンクを送る"}
          </Button>
          {ALLOWED_EMAIL_DOMAINS.length > 0 && (
            <p className="text-center text-xs text-faint">許可ドメイン: {ALLOWED_EMAIL_DOMAINS.join(" / ")}</p>
          )}
          {error && <p className="text-center text-xs text-bad">{error}</p>}
        </form>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
