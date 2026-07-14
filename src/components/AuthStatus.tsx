/**
 * ヘッダ右の認証状態表示。
 * - 認証オフ（鍵未設定）: 「認証未設定（開発モード）」の警告チップ
 * - 認証オン: ユーザーメール＋サインアウト（未ログインは「ログイン」）
 */
import { AUTH_ENABLED } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/shadcn/button";

export async function AuthStatus() {
  if (!AUTH_ENABLED) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full border border-warn/30 bg-warn/10 px-2 py-1 text-warn"
        title="NEXT_PUBLIC_SUPABASE_URL / ANON_KEY を設定すると認証が有効化されます"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-warn" />認証未設定（開発モード）
      </span>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className="h-7 rounded-full">
        <a href="/login">ログイン</a>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-good" />
        {user.email}
      </span>
      <form action="/auth/signout" method="post">
        <Button type="submit" variant="ghost" size="sm" className="h-7 rounded-full text-muted-foreground">
          サインアウト
        </Button>
      </form>
    </div>
  );
}
