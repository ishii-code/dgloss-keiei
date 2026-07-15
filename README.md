# dgloss 経営 AI OS（dgloss-keiei）

dgloss の **経営ダッシュボード**。予実（計画 vs 実績 vs 見込み）を全社・事業部別で俯瞰し、
週次予実・事業計画・改善リクエスト・現状分析（改善エンジン）をタブで束ねる「経営 AI OS」。

デザイン参照: dgloss OS ワイヤーフレーム（section 02）／経営 AI OS の予実モニター。

## タブ構成
- **予実モニター**（`/`）— 全社サマリー＋事業部別（4事業部）の 計画/実績/見込み・達成見込み%・推移
- **週次予実**（`/weekly`）— 木〜水サイクルの売上/コスト/営業利益（売上=週次実績、コスト/営利=計画・見込のみ）
- **今月:現状分析**（`/analysis`）— 改善エンジン（KGI/権限レベル/モジュール）＋日次/週次/月次の実績内訳
- **事業計画**（`/planning`）— FY2026〜2030・事業部×月次（売上/コスト/営業利益）
- **リリースノート**（`/releases`）— 版数と機能履歴
- **改善リクエスト**（`/requests`）— ステータス別（未対応/対応中/完了）集約

## 事業部（4）
パートナー事業部 / CRM事業部 / AIテレアポ事業部 / カスタマーグロース部（全社 = 4事業部の合計）

## 技術スタック
Next.js 15 (App Router) / React 19 / TypeScript / Tailwind CSS + **shadcn/ui** /
**Supabase Auth**（Google・社内ドメイン制限）/ **Prisma + Supabase(PostgreSQL)** /
semantic-release（版数自動）/ Vitest。パッケージは **pnpm**。

## 開発
```bash
pnpm install
pnpm dev          # http://localhost:3010
pnpm typecheck    # 0 エラー
pnpm test         # Vitest
pnpm build
```

## データソース（段階構成）
数値の出所は `src/data/keiei.ts`（モック）に集約。UI にはハードコードしない。
- **DATABASE_URL 未設定** → モック表示（開発モード）。鍵なしでそのまま動く。
- **DATABASE_URL 設定** → 財務（売上/コスト/計画）は会計/請求由来の DB（`MonthlyFinancial`）から表示。
  非財務（KGI・週次・改善リクエスト等）は当面モック。
- 取得は `src/lib/repository/finance.ts` の `getDashboardData()`（DB→モックのフォールバック）に一本化。

### 会計/請求データ接続（④）
1. Supabase（org `dnzmjxsqduwxgoafckxt`・東京）にツール専用プロジェクトを作成し、`.env` に `DATABASE_URL` を設定
2. スキーマ反映と初期投入:
   ```bash
   pnpm db:migrate     # prisma migrate（テーブル作成）
   pnpm db:seed        # snapshot の計画/当月実績を投入
   ```
3. 実データ取込（会計/請求）: CSV を POST する
   ```bash
   curl -X POST http://localhost:3010/api/import/finance \
     -H 'Content-Type: text/csv' --data-binary @finance.csv
   # ヘッダ: unit_code,fiscal_year,month,plan_revenue,plan_cost,actual_revenue,actual_cost[,source]
   # unit_code: tel / cg / crm / partner
   ```
   freee / バクラク等の API 連携も、正規化して同じ upsert（`/api/import/finance` 相当）に流す形で追加可能。
4. 見込み（forecast）はリポジトリで算出（実績 + 残計画の按分）。

### 請求書システム（Google スプレッドシート）連携 — 請求売上の自動同期
請求管理は GAS 製「ディグロス請求書システム」（スプレッドシート: `master`/`invoices`/`items`）で運用。
その `invoices`（`clientCode`/`subtotal`/`targetMonthStr`）を **Google Sheets API（サービスアカウント）** で読み、
**請求先コード→事業部** で集計して `MonthlyFinancial.actualRevenue`（請求売上）へ同期する。
```
1) 請求先コード→事業部 を src/lib/config/clientUnitMap.ts に定義（tel/cg/crm/partner）
2) サービスアカウントを作成し、スプレッドシートを「閲覧」で共有
3) .env に GOOGLE_SHEETS_SPREADSHEET_ID / GOOGLE_SERVICE_ACCOUNT_KEY（JSON or base64）
4) 同期実行: curl -X POST http://localhost:3010/api/sync/billing
   → invoices を集計し actualRevenue を upsert（本番は Vercel Cron で定期実行）
```
- 供給するのは **請求売上（actualRevenue）** のみ。コスト＝会計（freee/バクラク）、計画＝事業計画。
- 入金/資金繰り（`paidDate`/`status`）は請求システム側の「資金予測ダッシュボード」が既存。将来この OS へ統合可。

## 認証
`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 設定で有効化。
`ALLOWED_EMAIL_DOMAINS` で社内ドメイン制限。未設定なら開発モード（認証オフ・ヘッダに警告）。

## バージョン
semantic-release が `main` マージで自動発行。`CHANGELOG.md` / `package.json` version は手編集しない。
機能ログは `src/lib/releases.ts`（`/releases` タブ）に追記する。
