# Ceed Growth LP フォーム連携 — 作業引き継ぎドキュメント

作成日: 2026-07-21 / 引き継ぎ元: 駿冴のローカルMac の Claude Code セッション

このドキュメントだけ読めば、駿冴と本プロジェクトに関する会話・作業をそのまま継続できるよう、前提・背景・意思決定・現在状態・残タスクを自己完結で記載する。**作業内容を更新するたびに、このファイルも都度更新すること。**

## ★ 現在の全体像（新規セッションはまずここを読む）

**ビジネス背景**: Ceed の AI グロース支援 LP（`Ceed Growth LP v2.dc.html`、チームメイトが実装・保有。まだ現物は未共有）に「資料請求」フォームがあり、送信時に①送信者へ資料メール ②社内（`yusaku.takahashi@ceed.cloud`）へ通知メールを自動送信する必要がある。チームメイトから「残りの作業（バックエンド）」を引き継いだタスク。

**採用方式**: Gmail API + OAuth2（ドメイン全体委任）。送信元 `noreply@ceed.cloud`。ホスティングは Vercel（Serverless Functions）。Mac miniは可用性懸念のため不採用（駿冴判断）。

**現状（2026-07-22更新）**: **本体タスクは完了**。DOC_URLも設定済み・最終E2E確認済み。残るのはメール文面の微調整のみ（チームメイト側に引き継ぎ済み、任意タイミング）。

**リポジトリ**:
- バックエンド: `/Users/shungo/Programming/ceed-form-endpoint`（GitHub: https://github.com/Ceed-dev/ceed-form-endpoint 、Public、Vercelと連携しpush時自動デプロイ）
- LP: `/Users/shungo/Programming/ceed-growth-lp`（GitHub: https://github.com/Ceed-dev/ceed-growth-lp 、Public、Vercelと連携）

**本番URL**:
- LP: `https://lp.ceed.cloud`（公開済み・稼働中）
- フォームAPI: `https://ceed-form-endpoint.vercel.app/api/submit`（LPの`FORM_ENDPOINT`に設定済み）
- 資料PDF（DOC_URL）: `https://lp.ceed.cloud/assets/ceed-guide.pdf`（設定済み・動作確認済み）

## 1. 残タスク

**本質的なタスクは全て完了。** 残っているのは以下のみ、いずれも非ブロッキング：
- メール文面の微調整（チームメイト側のClaude Codeセッションに引き継ぎ済み。`lib/mailer.js`のsubject/text）
- スマホでのLP表示・送信確認（駿冴判断で保留中、必要になったら実施）

**完了した最終確認（2026-07-22）**:
1. PPTX資料（`~/Downloads/株式会社Ceed サービスご説明資料.pdf`、4.8MB）を受領 → `ceed-growth-lp/assets/ceed-guide.pdf`に配置
2. `DOC_URL=https://lp.ceed.cloud/assets/ceed-guide.pdf`を`ceed-form-endpoint`のVercel環境変数に設定 → 再デプロイ
3. 実際にフォーム送信 → 資料メールに正しいDOC_URLが記載され、PDFが正常に開くことを確認
4. 通知メール（`yusaku.takahashi@ceed.cloud`宛）到達も確認

**もし今後DOC_URLを差し替える場合**: `ceed-growth-lp/assets/`のPDFを置き換えてpush（自動デプロイ）。ファイル名を変える場合は`ceed-form-endpoint`側で`vercel env add DOC_URL production`を再実行し、再デプロイが必要。

## 1.5 解決済みの経緯（後から見て「あれ？」とならないための記録）

- **メール文面の仮案**: チームメイトにSlackで提示・確認依頼中（下記「メール文面」参照）。特に指摘なければこのままで確定として良い。
- **通知先アドレス**: 当初`official@ceed.cloud`指定だったが、駿冴の指示で`yusaku.takahashi@ceed.cloud`に変更・確定（チームメイトの最新handoff資料でも`official@ceed.cloud`と書かれているが、これは古い情報。**`yusaku.takahashi@ceed.cloud`が正**）。
- **通知メールの受信確認**: 当初「テストメールが来てない」と報告があったが、原因は**確認場所の誤り**。`ceed.cloud`のMXは`ceed.sakura.ne.jp`（Sakura）を向いているため、`yusaku.takahashi@ceed.cloud`宛メールはSakura側に配送される。Sakuraのwebmail（`secure.sakura.ad.jp`）で確認したところ、テスト送信した通知メールは**全て正常に届いていた**（2026-07-21確認）。**通知メール機能自体は完全に正常動作**。
- **「Gmailで見たい」という追加要望への対応**: yusakuさんはGmail（`yusaku.takahashi@ceed.cloud`のWorkspaceアカウント）で確認したいと希望したが、以下の理由で**断念しMailアプリ（Sakura）に統一する方針で確定**（駿冴決定、2026-07-21）:
  - 転送では実現不可（宛先が送信元と同一アドレスになりループする）
  - Gmail の「他のアカウントのメールを確認（POP3）」機能は、Googleが新しいWorkspaceアカウントへの提供を廃止しており、UIにセクションごと表示されない（`pochi@0xqube.xyz`・`yusaku.takahashi@ceed.cloud`の両方で確認済み、管理者設定でも復活不可）
  - 会社の他のメンバー（`official@`, `shungo.kimura@`）も同じ理由（Sakura側の仕様変更）でMailアプリに移行済み。yusakuさんも同じ運用に合わせる方針
  - **今後、通知メールは`yusaku.takahashi@ceed.cloud`のMailアプリ（またはSakura webmail）で確認する。追加の実装・設定は不要。**
  - **2026-07-21最終確認**: Sakuraのヘルプ記事（macOS Mail設定手順）を元にmacOSの「メール」アプリに`yusaku.takahashi@ceed.cloud`をIMAP設定（サーバー`ceed.sakura.ne.jp`、IMAPポート993/SMTPポート587、いずれもSSL）で追加し、駿冴が本人に確認 → **通知メール受信を確認完了**。この件は完全にクローズ。

## 2. アーキテクチャ・実装

```
api/submit.js     — POST受付。CORS判定・レート制限・バリデーション・メール送信の呼び出し
lib/validate.js   — 入力バリデーション（company/name/email必須、phone任意）
lib/rateLimit.js  — IPベースのレート制限（Upstash Redis, 5回/10分）
lib/mailer.js     — Gmail API送信（サービスアカウント + ドメイン全体委任）
```

- リクエスト仕様: `POST { company, name, email, phone? }` → 成功時 `{ok:true}` (200)
- Node.js v22 / ESM / Vercel Functions（Node runtime、フレームワーク検出なし）

## 3. メール文面（現状・仮）

**①資料メール**（送信者宛、件名: `【Ceed】資料をお送りします`）
```
{会社名} {氏名} 様

お問い合わせいただきありがとうございます。
下記URLより資料をダウンロードいただけます。

{DOC_URL}

何かご不明点がございましたら本メールに返信ください。
```

**②通知メール**（`yusaku.takahashi@ceed.cloud` 宛、件名: `【LP】資料請求フォーム通知`、Reply-To=送信者）
```
資料請求フォームから送信がありました。

会社名: {会社名}
氏名: {氏名}
メール: {メール}
電話: {電話番号（未入力時は「(未入力)」）}
```

チームメイト確認待ち。変更指示が来たら`lib/mailer.js`を直接編集する。

## 4. インフラ・認証情報（重要な意思決定と落とし穴）

### Google Workspace / ドメイン構成
- **Workspaceの契約は `0xqube.xyz`**。`ceed.cloud` はセカンダリドメインとして追加されている（駿冴確認済み）。
- 管理者アカウント: `pochi@0xqube.xyz`（駿冴自身）
- `ceed.cloud` の MX は **`ceed.sakura.ne.jp`**（Sakuraのメールサーバー）を向いている。Google Workspace経由ではない。`yusaku.takahashi@ceed.cloud` は実在しSakura側で運用中（駿冴確認済み、問題なし。Gmail APIでの送信はSMTP配送なのでSakura宛でも支障ない）。
- `official@ceed.cloud` という既存のSend As設定（SMTP経由・ceed.sakura.ne.jp）が既にあった。**これは触っていない・無関係**。

### GCP
- プロジェクト: `ceed-form-endpoint`（`pochi@0xqube.xyz` で作成）
- Gmail API有効化済み
- サービスアカウント: `ceed-form-mailer@ceed-form-endpoint.iam.gserviceaccount.com`
- キーファイル: `sa-key.json`（**ローカルのみ、gitignore対象。GitHubにはpushされていない**。別マシンで作業する場合はこのファイルを安全な方法で移動するか、`gcloud iam service-accounts keys create`で新規キーを発行する必要がある）
- ドメイン全体の委任: admin.google.com → セキュリティ → API制御 → ドメイン全体の委任 に **クライアントID `110536984423551484683`、スコープ `https://www.googleapis.com/auth/gmail.send`** を登録済み（確認済み・動作済み）

### Gmail送信元エイリアス（★ハマりポイント）
- `pochi@0xqube.xyz`（Shungo Kimura）ユーザーに `noreply@ceed.cloud` を**エイリアスとして追加**（admin.google.com → Directory → Users → 対象ユーザー → Alternate emails）
- **これだけでは不十分**。Gmail側で送信すると From ヘッダーが主アドレス（`pochi@0xqube.xyz`）に差し戻される現象が発生した。
- **解決策**: 送信アカウント本人のGmail設定 → 設定 → アカウントとインポート → 「名前を含むメールの送信」→ **Add another email address** で `noreply@ceed.cloud` を追加（同ドメインのため確認コード不要・即時反映）。これで実際に外部アドレス（`kimura.shungo@gmail.com`）宛にテストし、`From: noreply@ceed.cloud` かつ `signed-by: ceed.cloud`（DKIM）を確認済み。

### DKIM/SPF/DMARC
- 調査時点で**既に設定済み**だった（誰か/何かが事前に設定していた形跡、6日前作成のレコードあり）。追加作業は不要だった。
- DMARCの`rua`は既に`yusaku.takahashi@ceed.cloud`宛になっていた。

### コードの不具合修正（googleapisライブラリの破壊的変更）
- `googleapis`パッケージ（v173系にアップグレード、npm audit脆弱性解消のため）で`google.auth.JWT`のコンストラクタが**位置引数からオプションオブジェクトに変更**されていた。旧形式のまま呼ぶと`invalid_client`エラーになる。
- 修正済み: `lib/mailer.js`で`new google.auth.JWT({ email, key, scopes, subject })`形式に変更済み。

### Vercel
- チーム: `ceed`（`pochiudon`アカウントでログイン、`ceed.cloud`ドメインもこのチームで管理）
- プロジェクト: `ceed-form-endpoint`（GitHub連携済み、push→自動デプロイ）
- **GitHub連携の落とし穴**: CeedチームはHobbyプランのため、Organization所有の**Privateリポジトリ**とはネイティブ連携できない（Proプラン限定の制約）。解決策として**リポジトリをPublicに変更**して連携（駿冴合意済み。機密情報はコード内に含まれていないため問題なしと判断）。
- レート制限用Redis: Vercel Marketplace経由で **Upstash for Redis（Freeプラン）** を追加・プロジェクトに接続済み。環境変数名は`UPSTASH_REDIS_REST_URL/TOKEN`ではなく**`KV_REST_API_URL` / `KV_REST_API_TOKEN`**（Vercel側の命名）。`lib/rateLimit.js`はこの命名に対応済み。

### 環境変数（Vercel Production、設定済み）
| 変数 | 値/状態 |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | 設定済み |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | 設定済み |
| `GMAIL_SENDER` | `noreply@ceed.cloud` |
| `NOTIFY_TO` | `yusaku.takahashi@ceed.cloud` |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | 設定済み（Upstash自動連携） |
| `DOC_URL` | **未設定（チームメイト回答待ち、唯一の残タスク）** |
| `ALLOWED_ORIGIN` | `https://lp.ceed.cloud`（設定済み） |

## 5. 動作確認済みの内容

- ローカル単体テスト: バリデーション6パターン、CORS/メソッド分岐5パターン、全PASS
- `npm audit`: 脆弱性0件
- 本番エンドポイントへのcurlテスト: バリデーション400、成功200を確認
- Gmail実送信テスト: `pochi@0xqube.xyz`宛・外部`kimura.shungo@gmail.com`宛の両方で資料メール到達確認（受信トレイ直行、迷惑メール行きなし、DKIM署名確認）
- 通知メール送信テスト: `yusaku.takahashi@ceed.cloud`（Sakura→Mailアプリ経由）で受信確認完了
- レート制限: 同一IPから6回連続送信し、6回目で`429`を確認
- 実LP（`https://lp.ceed.cloud`）からの実際のフォーム送信テスト: 完了・資料メール到達確認済み
- CORS: `https://lp.ceed.cloud`からのプリフライトで`access-control-allow-origin`が正しく返ることを確認済み

## 6. 各アカウントのログイン状態（このマシン上）

- `gcloud`: `pochi@0xqube.xyz`がアクティブ
- `vercel`: `pochiudon`（Ceedチーム）でログイン済み
- `gh`(GitHub CLI): `shungo0222`でログイン、`Ceed-dev`組織へのアクセス権あり

## 7. 参考ドキュメント

- セットアップ手順の詳細は [README.md](./README.md) を参照（GCP/Workspace/DNS/Vercelの具体的なコマンド・手順）

### 2026-07-22 — 代表コメント差し替え＋注記削除（ceed-growth-lp/index.html）
- Memberセクションの代表プロフィール文を正式版に変更。
- 「※ 写真・プロフィール文は差し替えてください。」の仮注記を削除（内容確定のため）。
