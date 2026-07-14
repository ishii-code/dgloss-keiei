import { Button } from "@/components/shadcn/button";

export default function Page() {
  return (
    <div className="mx-auto mt-20 max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
      <h1 className="text-lg font-bold text-ink">アクセスできません</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        このアカウントは経営 AI OS の許可ドメインに含まれていません。社内アカウントでログインし直してください。
      </p>
      <Button asChild className="mt-5">
        <a href="/login">ログインへ戻る</a>
      </Button>
    </div>
  );
}
