import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isAllowedEmail } from "@/lib/supabase/config";

/**
 * ログインのコールバック。2形式に対応:
 *  - PKCE: ?code=...        （signInWithOtp/OAuth）→ exchangeCodeForSession
 *  - メールOTP: ?token_hash=&type=  （メールリンク/管理API発行リンク）→ verifyOtp
 * いずれも社内ドメインのみ通す。
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  let authError: string | null = null;
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    authError = error?.message ?? null;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error?.message ?? null;
  } else {
    return NextResponse.redirect(`${origin}/login`);
  }

  if (authError) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(authError)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAllowedEmail(user?.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/denied`);
  }

  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/"}`);
}
