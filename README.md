# MySecretary

Windows 11専用の高速タスク管理アプリケーション。Notionとシームレスに統合し、デスクトップアプリケーションとして動作します。

## 🌟 特徴

- **Notionベースのタスク管理**: Notion APIを使用してタスクを直接管理
- **Electronスタンドアロンアプリ**: Windows 11ネイティブアプリケーション
- **リアルタイム更新**: タスクの変更をリアルタイムで同期
- **モダンなUI**: レスポンシブで直感的なインターフェース
- **タスク優先度管理**: 低・中・高の優先度レベル
- **ステータス追跡**: 未開始・実施中・完了の状態管理
- **統計情報**: タスク進捗の一目での把握

## 📋 プロジェクト構造

```
MySecretary/
├── public/
│   ├── electron.js        # Electronメインプロセス
│   ├── preload.js         # セキュアなプリロード
│   └── assets/           # アプリケーションアセット
├── frontend/             # Reactアプリケーション
│   ├── src/             # ソースコード
│   ├── public/          # 静的アセット
│   └── package.json     # フロントエンド依存関係
├── backend/             # Express APIサーバー（Electronに統合）
│   └── package.json     # バックエンド依存関係
├── package.json         # ルートパッケージ設定
├── .env.example         # 環境変数テンプレート
└── README.md           # このファイル
```

## 🚀 セットアップガイド

### 前提条件

- Node.js v16以上
- npm または yarn
- Notion APIキー
- Notionのタスク管理用データベース

### インストール手順

1. **リポジトリをクローン:**
   ```bash
   git clone <repository-url>
   cd MySecretary
   ```

2. **依存関係をインストール:**
   ```bash
   npm install
   ```

3. **環境変数を設定:**
   ```bash
   cp .env.example .env
   ```

   `.env`ファイルを編集して、Notion認証情報を追加:
   ```env
   NOTION_API_KEY=your_notion_api_key
   NOTION_DATABASE_ID=your_database_id
   BACKEND_PORT=3001
   ```

### Notion APIキーの取得

1. [Notion Developers](https://developers.notion.com/)にアクセス
2. 「新しいインテグレーション」を作成
3. APIキーをコピーして`.env`に貼り付け
4. Notionデータベースを作成（以下の構造を使用）:

**Notionデータベーススキーマ:**
- Title (テキスト)
- Status (ステータス: Not started, In Progress, Done)
- Priority (セレクト: Low, Normal, High)
- Due Date (日付)

5. データベースIDを`.env`に追加

### 開発環境での実行

```bash
npm run dev
```

このコマンドは以下を同時に実行します:
- React開発サーバー (http://localhost:3000)
- Electronアプリケーション
- Express APIサーバー (http://localhost:3001)

### ビルド

スタンドアロンのWindows実行ファイルを作成:

```bash
npm run build
```

インストーラーと実行可能ファイルは `dist/` フォルダに生成されます。

## 📱 API エンドポイント

### タスク管理

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/api/tasks` | すべてのタスクを取得 |
| POST | `/api/tasks` | 新しいタスクを作成 |
| PUT | `/api/tasks/:id` | タスクを更新 |
| DELETE | `/api/tasks/:id` | タスクを削除（アーカイブ） |

### ヘルスチェック

- `GET /health` - バックエンドの状態確認

## 🛠 技術スタック

| カテゴリ | 技術 |
|---------|------|
| **フロントエンド** | React 18, TypeScript, CSS3 |
| **デスクトップ** | Electron, Electron Builder |
| **バックエンド** | Node.js, Express.js |
| **データベース** | Notion API |
| **開発ツール** | Concurrently, Wait-on |

## 💻 使用方法

### タスク追加
1. テキストフィールドにタスク名を入力
2. 優先度（低・中・高）を選択
3. 初期ステータスを選択
4. 「追加」ボタンをクリック

### タスク編集
- タスクタイトルをダブルクリックして編集
- EnterキーまたはTab、またはクリック外で保存

### ステータス変更
- ステータスドロップダウンから変更可能
- 自動的にNotionに同期

### 優先度確認
- 各タスクの優先度が色別で表示
- 赤: 高, 黄: 中, 緑: 低

## 📊 統計情報

ダッシュボード下部に以下の統計が表示されます:
- 総タスク数
- 完了したタスク数
- 実施中のタスク数
- 未開始のタスク数

## 🔐 セキュリティ

- Electronのコンテキスト分離を有効化
- IPC通信による安全なプロセス間通信
- 環境変数による認証情報の管理

## 🐛 トラブルシューティング

### Notion APIエラーが出る
- APIキーが正しく設定されているか確認
- データベースIDが正しいか確認
- Notionの接続権限を確認

### アプリが起動しない
- Node.js バージョンを確認（v16以上）
- `npm install` で依存関係が正しくインストールされたか確認
- ポート3000, 3001が使用可能か確認

## 📝 ライセンス

ISC

## 🤝 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を説明してください。