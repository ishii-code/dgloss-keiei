/**
 * Supabase 認証の設定（環境変数駆動）。
 * 鍵が未設定なら認証オフ（開発モード）＝ローカルで鍵無しでも動く。
 * 鍵が設定されていれば認証を強制し、社内ドメインのみ許可する。
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** 認証が有効か（URL と anon key が揃っているとき）。 */
export const AUTH_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * ログインを許可するメールドメイン（カンマ区切り env）。
 * 例: ALLOWED_EMAIL_DOMAINS="dgloss.jp,peco-japan.com"
 * 未設定なら「ドメイン制限なし（ログイン済みなら誰でも）」。
 */
export const ALLOWED_EMAIL_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS ?? "")
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

/** メールが許可ドメインか判定（制限なしなら常に true）。 */
export function isAllowedEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  if (ALLOWED_EMAIL_DOMAINS.length === 0) return true;
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
}
