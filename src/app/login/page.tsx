"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ALLOWED_EMAIL_DOMAINS } from "@/lib/supabase/config";
import { Button } from "@/components/shadcn/button";

function LoginInner() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, queryParams: { prompt: "select_account" } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-20 max-w-sm rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
      <div className="mb-1 bg-gradient-to-br from-brand to-violet bg-clip-text text-2xl font-black tracking-tight text-transparent">
        dgloss
      </div>
      <div className="text-sm font-semibold text-ink">経営 AI OS</div>
      <p className="mt-4 text-sm text-muted-foreground">社内アカウント（Google）でログインしてください。</p>

      <Button
        type="button"
        variant="outline"
        onClick={signInWithGoogle}
        disabled={loading}
        className="mt-6 w-full"
      >
        <span className="text-base font-bold">G</span>
        {loading ? "リダイレクト中…" : "Google でログイン"}
      </Button>

      {ALLOWED_EMAIL_DOMAINS.length > 0 && (
        <p className="mt-3 text-xs text-faint">許可ドメイン: {ALLOWED_EMAIL_DOMAINS.join(" / ")}</p>
      )}
      {error && <p className="mt-3 text-xs text-bad">{error}</p>}
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
