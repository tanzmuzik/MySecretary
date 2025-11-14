# Daily TODO Desktop App for Windows 11

Windows 11 のデスクトップ上に Notion の Daily TODO データベースを常時表示するデスクトップアプリケーションです。

## 特徴

- **Notion 連携**: Notion データベースからタスクを自動取得
- **ビジュアル重視**: 優先度とステータスを色分けで直感的に表示
- **自動更新**: 5分ごとにバックグラウンドで自動更新（設定変更可能）
- **カスタマイズ**: ダーク/ライトテーマ、透明度、常時最前面表示など
- **軽量**: Python + tkinter で Windows ネイティブ風の UI

## スクリーンショット

![Daily TODO App](screenshot.png)

## 必要要件

- Windows 11 (Windows 10 でも動作可能)
- Python 3.8 以上
- Notion アカウントと Integration Token

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/daily-todo-app.git
cd daily-todo-app/daily_todo_app
```

### 2. 依存ライブラリのインストール

```bash
pip install -r requirements.txt
```

### 3. Notion Integration の作成

1. [Notion Developers](https://www.notion.so/my-integrations) にアクセス
2. 「+ New integration」をクリック
3. Integration 名を入力（例：「Daily TODO App」）
4. 「Submit」をクリック
5. 「Internal Integration Token」をコピー

### 4. Notion データベースとの接続

1. Notion で Daily TODO データベースのページを開く
2. 右上の「...」メニューから「Add connections」を選択
3. 作成した Integration を選択

### 5. トークンの設定

#### 方法A: 環境変数ファイル（推奨）

```bash
cp .env.example .env
```

`.env` ファイルを編集して、トークンを設定：

```
NOTION_TOKEN=your_integration_token_here
```

#### 方法B: アプリから設定

アプリを起動後、「設定」ボタンから Notion Token を入力できます。

## 使用方法

### アプリの起動

```bash
python main.py
```

### 基本操作

- **更新ボタン**: 手動でタスクを更新
- **設定ボタン**: 各種設定を変更
  - Notion Token の入力/変更
  - 自動更新間隔（1〜30分）
  - 常時最前面表示のオン/オフ
  - テーマ切り替え（ダーク/ライト）
  - 透明度調整（50〜100%）

### タスクの表示

- **優先度**: カード左側の色インジケーターで表示
  - 赤 = 高優先度
  - 黄 = 中優先度
  - 緑 = 低優先度
- **ステータス**: カード全体の背景色で表示
  - グレー = 未着手
  - ライトブルー = 進行中
  - ライトグリーン = 完了
  - オレンジ = 保留

## Notion データベース構造

アプリは以下のプロパティを持つ Notion データベースに対応しています：

| プロパティ名 | 型 | 説明 |
|------------|-----|------|
| 名前 | Title | タスク名 |
| ステータス | Select | 未着手/進行中/完了/保留 |
| 優先度 | Select | 高/中/低 |
| 種類 | Text | カテゴリ（任意） |

## Windows スタートアップ登録（オプション）

PC 起動時に自動実行するには：

1. アプリのショートカットを作成
2. `Win + R` で「shell:startup」を実行
3. 開いたフォルダにショートカットをコピー

または、バッチファイルを作成：

```batch
@echo off
cd /d "C:\path\to\daily_todo_app"
pythonw main.py
```

## トラブルシューティング

### 「Notion API エラー」が表示される

- Notion Token が正しいか確認
- Notion データベースに Integration が接続されているか確認
- インターネット接続を確認

### タスクが表示されない

- Notion データベース ID が正しいか確認（`notion_client.py` の `DATABASE_ID`）
- データベースのプロパティ名が一致しているか確認

### アプリが起動しない

- Python 3.8 以上がインストールされているか確認
- 依存ライブラリがインストールされているか確認：`pip install -r requirements.txt`

## カスタマイズ

### データベース ID の変更

`notion_client.py` の `DATABASE_ID` を変更：

```python
DATABASE_ID = "your_database_id_here"
```

### 色のカスタマイズ

`notion_client.py` と `ui_components.py` の色定義を変更できます。

### 自動更新間隔のデフォルト値

`config.py` の `default_settings` を編集：

```python
"auto_update_interval": 5,  # 分
```

## ライセンス

MIT License

## 開発者向け情報

### プロジェクト構造

```
daily_todo_app/
├── main.py              # メインアプリケーション
├── notion_client.py     # Notion API クライアント
├── ui_components.py     # UI コンポーネント
├── config.py            # 設定管理
├── requirements.txt     # 依存ライブラリ
├── .env.example         # 環境変数テンプレート
├── .gitignore          # Git 無視設定
└── README.md           # このファイル
```

### 今後の拡張予定

- タスククリック時の詳細表示
- タスクステータスの更新（アプリ → Notion）
- 複数データベース対応
- 通知機能（タスク期限アラート）
- ショートカットキー対応（Win+Alt+T など）
- タスクのフィルタリング・検索機能

## お問い合わせ

バグ報告や機能リクエストは、[GitHub Issues](https://github.com/yourusername/daily-todo-app/issues) までお願いします。

## 更新履歴

### v1.0.0 (2025-11-14)
- 初回リリース
- Notion データベースからのタスク取得
- ビジュアル重視の UI
- 自動更新機能
- 設定画面
- ダーク/ライトテーマ
