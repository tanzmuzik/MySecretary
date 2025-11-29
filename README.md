# MySecretary

Notion統合のシンプルなWebベースのタスク管理アプリケーション。React + Express + Notion APIで構築されています。

## 🌟 特徴

- **Notionベースのタスク管理**: Notion APIを使用してタスクを直接管理
- **モダンなWebUI**: React + TypeScriptで実装したレスポンシブなインターフェース
- **リアルタイム同期**: Notion側の変更をアプリに反映
- **簡単セットアップ**: フロントエンド・バックエンド分離で構成がシンプル
- **タスク優先度管理**: 低・中・高の優先度レベル
- **ステータス追跡**: 未開始・実施中・完了の状態管理
- **統計ダッシュボード**: タスク進捗の一目での把握

## 📋 プロジェクト構造

```
MySecretary/
├── server.js               # Express APIサーバー
├── package.json            # バックエンド依存関係
├── .env.example           # 環境変数テンプレート
├── frontend/              # React Webアプリケーション
│   ├── src/
│   │   ├── App.tsx        # メインアプリコンポーネント
│   │   ├── App.css        # スタイル
│   │   └── index.tsx      # エントリーポイント
│   ├── public/
│   │   └── index.html
│   └── package.json       # フロントエンド依存関係
└── README.md             # このファイル
```

## 🚀 クイックスタート

### 前提条件

- Node.js v16以上
- npm または yarn
- Notion APIキー
- Notionのタスク管理用データベース

### 1. Notion APIキーの取得

1. [Notion Developers](https://developers.notion.com/)にアクセス
2. 「新しいインテグレーション」を作成
3. APIキーをコピー（後で使用）
4. Notionで以下のスキーマのデータベースを作成:
   - **Title** (テキスト)
   - **Status** (ステータス: Not started, In Progress, Done)
   - **Priority** (セレクト: Low, Normal, High)
   - **Due Date** (日付、オプション)

5. データベースIDをコピー

### 2. 環境変数を設定

```bash
cp .env.example .env
```

`.env`ファイルを編集:

```env
NOTION_API_KEY=your_api_key_here
NOTION_DATABASE_ID=your_database_id_here
PORT=3001
```

### 3. 依存関係をインストール

```bash
# バックエンド
npm install

# フロントエンド
cd frontend
npm install
cd ..
```

### 4. アプリを実行

**ターミナル1 - バックエンドサーバー:**
```bash
npm run dev
```
APIサーバーが http://localhost:3001 で起動します

**ターミナル2 - フロントエンドアプリ:**
```bash
cd frontend
npm start
```
Webアプリが http://localhost:3000 で起動します

## 📱 API エンドポイント

### ヘルスチェック
- `GET /health` - サーバーの状態確認

### タスク管理

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/api/tasks` | すべてのタスクを取得 |
| POST | `/api/tasks` | 新しいタスクを作成 |
| PUT | `/api/tasks/:id` | タスクを更新 |
| DELETE | `/api/tasks/:id` | タスクを削除（アーカイブ） |

### リクエスト例

**新規タスク作成:**
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "買い物をする",
    "status": "Not started",
    "priority": "Normal"
  }'
```

## 🛠 技術スタック

| カテゴリ | 技術 |
|---------|------|
| **フロントエンド** | React 18, TypeScript, CSS3 |
| **バックエンド** | Node.js, Express.js |
| **データベース** | Notion API |
| **開発ツール** | nodemon |

## 💻 使用方法

### タスク追加
1. テキストフィールドにタスク名を入力
2. 優先度（低・中・高）を選択
3. 初期ステータスを選択
4. 「追加」ボタンをクリック

### タスク編集
- タスクタイトルをダブルクリックして編集
- Enter キーで保存

### ステータス変更
- ステータスドロップダウンから変更可能
- 自動的にNotionに同期

### タスク削除
- 「削除」ボタンをクリック
- Notionで自動的にアーカイブ

## 📊 ダッシュボード統計

- 総タスク数
- 完了したタスク数
- 実施中のタスク数
- 未開始のタスク数

## 🔐 セキュリティ

- 環境変数で認証情報を管理
- CORSで安全なクロスオリジンリクエストを処理
- APIキーはサーバー側のみで使用

## 🐛 トラブルシューティング

### Notion API エラー
```
Error: Failed to fetch tasks
```
**解決策:**
- APIキーが正しいか確認
- データベースIDが正しいか確認
- NotionでAPIキーに適切な権限があるか確認

### ポート使用中エラー
```
Error: listen EADDRINUSE: address already in use :::3001
```
**解決策:**
- ポート3001が使用可能か確認: `netstat -ano | findstr :3001`
- 別のポートを使用: `PORT=3002 npm run dev`

### フロントエンドがバックエンドに接続できない
- バックエンドサーバーが起動しているか確認
- `http://localhost:3001/health` にアクセス可能か確認

## 📝 ライセンス

ISC

## 🤝 貢献

問題報告やプルリクエストを歓迎します！
