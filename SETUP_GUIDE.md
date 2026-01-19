# MySecretary Daily Report Copilot - セットアップガイド

このガイドでは、MySecretary Daily Report Copilotを初期セットアップして実行するための手順を説明します。

---

## 📋 前提条件

- **Node.js**: v16以上がインストールされていること
- **npm または yarn**: パッケージマネージャー
- **Azure アカウント**: Azure OpenAI Service を使用する場合
- **Microsoft 365 アカウント**: Microsoft Graph 統合を使用する場合（オプション）

---

## ⚙️ インストール手順

### 1. リポジトリのクローンと初期化

```bash
# リポジトリをクローン（または展開）
cd MySecretary

# 初期ディレクトリ構造を確認
ls -la src/backend src/frontend
```

### 2. バックエンドの環境設定

```bash
# バックエンド ディレクトリに移動
cd src/backend

# .env ファイルを作成
cp .env.example .env

# .env ファイルを編集（後述）
nano .env  # または、使用しているエディタで編集
```

**`.env` ファイルに必要な環境変数：**

```env
# サーバー設定
PORT=3001
NODE_ENV=development

# Azure OpenAI 設定（必須 - Copilot 機能を使用する場合）
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Microsoft Graph 設定（オプション - M365 統合を使用する場合）
MICROSOFT_GRAPH_TOKEN=your_graph_token_here

# 日本語ファイル設定
DAILY_REPORT_LANGUAGE=ja
```

### 3. 依存パッケージのインストール

```bash
# バックエンド依存パッケージをインストール
npm install

# フロントエンド依存パッケージもインストール
cd ../frontend
npm install

# もう一度バックエンドディレクトリに戻る（開発実行用）
cd ../backend
```

---

## 🚀 アプリケーションの起動

### Option A: 別々に実行（開発時推奨）

**ターミナル1 - バックエンドを実行:**
```bash
cd src/backend
npm run dev
```
出力:
```
MySecretary Daily Report Backend running on port 3001
Health check: http://localhost:3001/health
```

**ターミナル2 - フロントエンドを実行:**
```bash
cd src/frontend
npm start
```
ブラウザが自動で開き、http://localhost:3000 でアプリが起動します。

### Option B: Docker での実行

```bash
# Dockerfile を作成（別途ドキュメント参照）
docker-compose up
```

---

## 🔧 Azure OpenAI のセットアップ

Copilot による日報生成機能を使用するには、Azure OpenAI Service の設定が必要です。

### 手順:

1. **Azure Portal にログイン**
   - https://portal.azure.com へアクセス

2. **Azure OpenAI Service リソースを作成**
   - 「リソースの作成」 → 「Azure OpenAI」を検索
   - リソースグループを選択/作成
   - 名前を入力（例: `mysecretary-openai`）
   - 価格帯を選択（Standard 推奨）
   - 「確認と作成」をクリック

3. **デプロイメントを追加**
   - リソースが作成されたら「デプロイメント」タブへ
   - 「デプロイメントの作成」をクリック
   - モデル: `gpt-4` を選択
   - デプロイメント名: `gpt-4` または任意の名前を入力
   - 「デプロイ」をクリック

4. **API キーとエンドポイントを取得**
   - 「キーとエンドポイント」タブへ
   - キー 1、キー 2、エンドポイントをコピー
   - `.env` ファイルに以下を設定:
     ```env
     AZURE_OPENAI_API_KEY=コピーしたキー
     AZURE_OPENAI_ENDPOINT=コピーしたエンドポイント
     AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
     ```

5. **テスト**
   - バックエンドを再起動
   - http://localhost:3001/api/copilot/status にアクセス
   - `status: "configured"` が返されたら成功

---

## 📱 Microsoft Graph 統合のセットアップ（オプション）

Outlook カレンダー、Teams、メールなどから自動的に活動データを取得するには、Microsoft Graph の設定が必要です。

### 手順:

1. **Azure AD にアプリケーションを登録**
   - Azure Portal → Azure Active Directory → アプリの登録
   - 「新規登録」をクリック
   - 名前: `MySecretary Graph Integration`
   - サポートされているアカウントの種類: 「この組織のディレクトリ内のアカウントのみ」
   - 「登録」をクリック

2. **API 権限を追加**
   - 登録したアプリを開く
   - 「API の権限」 → 「権限を追加」
   - 「Microsoft Graph」を選択
   - 以下の権限を探して追加:
     - `Calendar.Read` - カレンダーの読み取り
     - `Mail.Read` - メールの読み取り
     - `TeamSettings.Read` - Teams の読み取り
   - 「管理者の同意を与える」をクリック

3. **アクセストークンを取得**
   - OAuth 2.0 エンドポイント: `https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token`
   - または、Azure CLI を使用:
     ```bash
     az account get-access-token --resource https://graph.microsoft.com
     ```

4. **`.env` ファイルに設定**
   ```env
   MICROSOFT_GRAPH_TOKEN=取得したトークン
   ```

---

## ✅ セットアップの確認

### 1. API ヘルスチェック

```bash
# ターミナルで実行
curl http://localhost:3001/health

# 期待される応答:
# {"status":"OK","timestamp":"2026-01-19T...","service":"Daily Report Copilot"}
```

### 2. Copilot 統合の確認

```bash
curl http://localhost:3001/api/copilot/status

# 期待される応答:
# {"service":"Copilot Integration","status":"configured",...}
```

### 3. フロントエンドのアクセス

ブラウザで http://localhost:3000 にアクセスし、以下が表示されることを確認:
- ナビゲーションバーに 3 つのタブ: 📝 日報生成、📋 活動ログ、📊 プロジェクト
- API Status が `connected` または `checking` の表示

---

## 🎯 初期使用方法

### 1. 最初の日報を生成

1. フロントエンドで「📝 日報生成」タブをクリック
2. 日付を選択
3. 「活動を追加」をクリックして活動をログに追加
   - 時間、タスク名、プロジェクトを入力
4. 「🤖 Copilotで日報生成」をクリック
5. 生成された日報を確認・編集
6. 「💾 ダウンロード」で保存

### 2. 活動ログを管理

1. 「📋 活動ログ」タブで新しい活動を追加
2. 過去のログを表示・削除
3. 日付でフィルター

### 3. プロジェクトを管理

1. 「📊 プロジェクト」タブで新しいプロジェクトを作成
2. プロジェクトのステータスを更新
3. プロジェクトを削除

---

## 🐛 トラブルシューティング

### エラー: "Cannot GET /health"
- **原因**: バックエンドが起動していない
- **解決**: `cd src/backend && npm run dev` を実行

### エラー: "Failed to generate report"
- **原因 1**: Azure OpenAI API キーが設定されていない
  - **解決**: `.env` ファイルで `AZURE_OPENAI_API_KEY` を設定
- **原因 2**: API キーが無効
  - **解決**: Azure Portal で有効性を確認
- **原因 3**: 活動ログが空
  - **解決**: 活動をログに追加してから再試行

### エラー: "Module not found: express"
- **原因**: 依存パッケージがインストールされていない
- **解決**: `npm install` を実行

### フロントエンドが起動しない
- **原因**: ポート 3000 が使用中
- **解決**: `npm start -- --port 3001` で別のポートで起動

---

## 📚 次のステップ

- カスタムプロンプトを作成（`copilot-integration.js` を編集）
- Microsoft Graph を完全に統合（アクセストークンを取得）
- データベース（PostgreSQL、MongoDB など）を設定
- Docker でデプロイ
- CI/CD パイプラインを設定（GitHub Actions など）

---

## 📞 サポート

問題が発生した場合:
1. `.env` ファイルを確認
2. バックエンド/フロントエンドのログを確認
3. ブラウザの開発者ツール（F12）でコンソールエラーを確認
4. GitHub Issues で報告

---

## 📄 関連ドキュメント

- [README.md](./README.md) - プロジェクト概要
- [DAILY_REPORT_TEMPLATE.md](./DAILY_REPORT_TEMPLATE.md) - 日報テンプレート
- [API Endpoints](./README.md#api-endpoints) - API ドキュメント

---

**セットアップ完了！🎉 MySecretary Daily Report Copilot を使用開始できます！**
