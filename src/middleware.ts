import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ALLOWED_EMAIL_DOMAINS, AUTH_ENABLED, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

/** 認証を要求しないパス。 */
const PUBLIC_PATHS = ["/login", "/auth/callback", "/auth/signout", "/denied"];

function isAllowed(email: string | undefined): boolean {
  if (!email) return false;
  if (ALLOWED_EMAIL_DOMAINS.length === 0) return true;
  return ALLOWED_EMAIL_DOMAINS.includes(email.split("@")[1]?.toLowerCase() ?? "");
}

export async function middleware(request: NextRequest) {
  // 認証オフ（鍵未設定）＝開発モード：素通し。
  if (!AUTH_ENABLED) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isPublic) return response;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 社内ドメイン外はサインアウトさせて拒否画面へ。
  if (!isAllowed(user.email ?? undefined)) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/denied";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // 静的アセットと画像以外に適用。
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
