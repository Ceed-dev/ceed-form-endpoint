# ceed-form-endpoint

Ceed Growth LPの「資料請求」フォームを受け、Gmail API経由で
①送信者へ資料メール ②yusaku.takahashi@ceed.cloudへ通知メール
を送るVercel Functionsエンドポイント。

## 構成

- `api/submit.js` — POST受付・CORS・バリデーション・レート制限・メール送信
- `lib/validate.js` — 入力バリデーション
- `lib/rateLimit.js` — IPベースのレート制限（Upstash Redis、未設定時はスキップ）
- `lib/mailer.js` — Gmail API送信（ドメイン全体委任）

## 環境変数

`.env.example` 参照。Vercelのプロジェクト設定 → Environment Variablesに登録する。

| 変数 | 用途 |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | サービスアカウントのメールアドレス |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | サービスアカウントの秘密鍵（`\n`はエスケープしたまま貼り付け） |
| `GMAIL_SENDER` | 送信元（`noreply@ceed.cloud`、Workspaceでエイリアス作成が必要） |
| `NOTIFY_TO` | 通知先（`yusaku.takahashi@ceed.cloud`） |
| `DOC_URL` | 資料DLリンク（要確認） |
| `ALLOWED_ORIGIN` | LP公開先オリジン（要確認、CORS許可用） |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | レート制限用（任意、Vercel Marketplace経由でUpstash追加時に自動設定） |

## セットアップ手順

### 1. GCPプロジェクト + Gmail API

```
gcloud auth login   # ceed.cloudの管理者アカウントでログイン
gcloud projects create ceed-form-endpoint --name="Ceed Form Endpoint"
gcloud config set project ceed-form-endpoint
gcloud services enable gmail.googleapis.com
gcloud iam service-accounts create ceed-form-mailer --display-name="Ceed Form Mailer"
gcloud iam service-accounts keys create sa-key.json \
  --iam-account=ceed-form-mailer@ceed-form-endpoint.iam.gserviceaccount.com
```

`sa-key.json`の`client_email`と`private_key`を環境変数に設定する（キー自体はコミットしない）。

### 2. Workspace側の設定（admin.google.com）

1. **エイリアス作成**: メイン管理コンソール → ユーザー → 送信用アカウント（例: 自分のアカウント）に`noreply@ceed.cloud`をエイリアス追加
2. **ドメイン全体委任**: セキュリティ → API制御 → ドメイン全体の委任 → 新規追加
   - クライアントID: サービスアカウントの「一意のID」（数字）
   - スコープ: `https://www.googleapis.com/auth/gmail.send`
3. **Send Mail As登録（重要）**: 上記1のエイリアスを追加しただけではFromヘッダーが主アドレスに差し戻される。
   送信用アカウントのGmail設定 → アカウントとインポート → 「名前を含むメールの送信」→ `noreply@ceed.cloud`を追加（同ドメインのため確認不要で即時反映）

### 3. DKIM/SPF/DMARC（Vercelのドメイン管理でDNSレコード追加）

1. admin.google.com → アプリ → Google Workspace → Gmail → メールの認証 でDKIM鍵を生成
2. 発行されたDKIM TXTレコードをVercelのDNS設定に追加
3. SPF: `TXT @ "v=spf1 include:_spf.google.com ~all"`
4. DMARC: `TXT _dmarc "v=DMARC1; p=none; rua=mailto:yusaku.takahashi@ceed.cloud"`（まずp=noneで様子見し、問題なければp=quarantineへ）

### 4. デプロイ

```
npm install
vercel login
vercel link
vercel env add DOC_URL
vercel env add ALLOWED_ORIGIN
# ...他の環境変数も同様
vercel --prod
```

## 動作確認

```
curl -i -X POST https://<endpoint>/api/submit \
  -H "Content-Type: application/json" \
  -H "Origin: https://<LP本番オリジン>" \
  -d '{"company":"テスト株式会社","name":"テスト太郎","email":"test@example.com","phone":"090-0000-0000"}'
```

## 未確定事項

- `DOC_URL`（資料DLリンク）
- `ALLOWED_ORIGIN`（LP公開先URL）

両方とも判明次第、Vercelの環境変数に設定するだけで反映される。
