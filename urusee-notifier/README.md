# UruseeNotifier（うるせぇ通知）

Windows向けの軽量デスクトップ通知アプリ

## 概要

「うるせぇ！」を共有するためのシンプルなデスクトップアプリです。タスクトレイに常駐し、クリックするだけで同じネットワーク内の全ユーザーに通知を送信できます。

## 主な機能

- **タスクトレイ常駐**: 起動後はタスクトレイのみに表示
- **ワンクリック送信**: トレイアイコンをクリックするだけで「うるせぇ！」を送信
- **リアルタイム通知**: WebSocketを使用した即座の通知表示
- **ランダム表示**: 画面上のランダムな位置に吹き出しを表示
- **効果音**: クリック音と受信音（ON/OFF可能）
- **ログ記録**: 送信履歴をローカルに保存

## 技術スタック

- **フレームワーク**: Tauri v1.5
- **フロントエンド**: React 18 + TypeScript
- **バックエンド**: Rust
- **通信**: WebSocket (ポート: 5555)
- **ビルドツール**: Vite

## プロジェクト構造

```
urusee-notifier/
├── src/                    # React フロントエンド
│   ├── main.tsx           # エントリーポイント
│   ├── App.tsx            # メインアプリ
│   ├── styles.css         # スタイル
│   └── components/        # コンポーネント
│       ├── Notification.tsx
│       └── Settings.tsx
├── src-tauri/             # Rust バックエンド
│   ├── src/
│   │   ├── main.rs        # メインロジック
│   │   └── websocket.rs   # WebSocketサーバー
│   ├── Cargo.toml         # Rust依存関係
│   ├── tauri.conf.json    # Tauri設定
│   └── icons/             # アプリアイコン
├── public/
│   └── sounds/            # 効果音ファイル
├── package.json           # npm依存関係
└── vite.config.ts         # Vite設定
```

## セットアップ

### 必要な環境

- Node.js 18以上
- Rust 1.70以上
- Windows 10/11

### インストール手順

1. 依存関係をインストール:
   ```bash
   npm install
   ```

2. 効果音とアイコンを準備:
   - `public/sounds/click.mp3` - クリック音
   - `public/sounds/receive.mp3` - 受信音
   - `src-tauri/icons/*.png` - アイコンファイル

   詳細は各ディレクトリのREADMEを参照してください。

## 開発

### 開発モードで実行

```bash
npm run tauri:dev
```

### ビルド（本番用）

```bash
npm run tauri:build
```

ビルドが成功すると、`src-tauri/target/release/bundle/nsis/` に実行可能なインストーラーが生成されます。

## 使い方

1. アプリを起動するとタスクトレイに常駐
2. トレイアイコンを左クリックで「うるせぇ！」を送信
3. 右クリックで設定パネルを表示
4. 設定パネルから以下を操作:
   - 手動送信
   - 効果音のON/OFF
   - 今日の送信履歴を確認
   - アプリを終了

## ネットワーク設定

- デフォルトポート: 5555
- 同じネットワーク内のすべてのクライアントが自動的に接続されます
- ファイアウォールでポート5555を許可する必要がある場合があります

## ログファイルの場所

- Windows: `%APPDATA%/urusee-notifier/logs.json`

## カスタマイズ

### 絵文字を変更

`src/App.tsx` の `EMOJIS` 配列を編集:

```typescript
const EMOJIS = ["🔥", "💢", "💥", "😡", "👊"];
```

### 通知表示時間を変更

`src/App.tsx` の `setTimeout` の値を変更（ミリ秒）:

```typescript
setTimeout(() => {
  setNotifications((prev) => prev.filter((n) => n.id !== id));
}, 3000); // 3秒
```

### WebSocketポートを変更

`src-tauri/src/websocket.rs` の `addr` を変更:

```rust
let addr = "0.0.0.0:5555"; // お好みのポートに変更
```

## トラブルシューティング

### ビルドエラー

- Rustがインストールされているか確認: `cargo --version`
- Node.jsのバージョンを確認: `node --version`
- 依存関係を再インストール: `npm install && cargo clean`

### 通知が届かない

- ファイアウォール設定を確認
- 同じネットワークに接続されているか確認
- ポート5555が他のアプリケーションで使用されていないか確認

### アイコンが表示されない

- `src-tauri/icons/` に必要なアイコンファイルが存在するか確認
- プレースホルダーファイルを実際の画像に置き換える

## ライセンス

このプロジェクトはオープンソースです。

## 貢献

プルリクエストを歓迎します！

## 作者

あなたの名前
