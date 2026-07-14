export default function Page() {
  return (
    <div className="mx-auto mt-20 max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
      <h1 className="text-lg font-bold text-ink">アクセスできません</h1>
      <p className="mt-2 text-sm text-muted">
        このアカウントは経営 AI OS の許可ドメインに含まれていません。社内アカウントでログインし直してください。
      </p>
      <a
        href="/login"
        className="mt-5 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        ログインへ戻る
      </a>
    </div>
  );
}
