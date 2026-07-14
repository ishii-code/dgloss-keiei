# dgloss OS 経営ダッシュボード（dgloss-keiei）

dgloss OS v2.0 の **経営ダッシュボード**（ワイヤーフレーム section 02 / 経営者視点）を実画面化したもの。
KGI・メタKPI・意思決定の権限レベル・モジュール別ステータスを1画面で俯瞰する。

デザイン参照元: https://dgloss-os-wireframe.vercel.app/ （section 02）

## 画面構成
- **KGI ①②③** — ①権限移譲(AI経営) / ②状態(AI業務実行) / ③労働力(AI労働力, 日々ドライブ)
- **メタKPI** — 自動化率 / 改善速度 / AI稼働人月（週次デルタ付き）
- **意思決定の権限レベル** — L0(人が決める)〜L5(AI全権) の分布バー。不可逆な意思決定は上限マーカーで L4 止まりを表現
- **モジュール別ステータス** — カーネル/デーモン/各業務モジュールの稼働状態

## 技術スタック
Next.js 15 (App Router) / React 19 / TypeScript / Tailwind CSS 3.4

## データ
現状は `src/data/keiei.ts` の単一スナップショット（モック）。ワイヤーフレームの数値を初期値として保持。
UI にハードコードせず一箇所に集約しており、将来 **KPIレジストリ（カーネル）/ Work Monitor / 改善デーモン** の
集計に接続して差し替える。

## 開発
```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit（0エラー）
npm run build      # next build
```

## 今後
- `/kpi` KPIレジストリ、`/issues` Issue Board は現在プレースホルダ
- 実データ接続（KPIレジストリ API）
- 権限レベルの時系列推移・ドリルダウン
