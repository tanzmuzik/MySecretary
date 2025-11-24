# 月めくりカレンダーウィジェット / Monthly Calendar Widget

Windows 11対応のデスクトップ月めくりカレンダーウィジェットです。透明な背景で、常に最前面に表示されます。

A Windows 11-compatible desktop monthly calendar widget with a transparent background that stays always on top.

## 特徴 / Features

- ✨ **透明背景** - ガラスモーフィズム効果の美しい透明背景
- 📅 **月めくりカレンダー** - 月単位でカレンダーを表示
- 🗓️ **月曜日始まり** - 週の始まりが月曜日（日本標準）
- 🎯 **今日を強調表示** - 今日の日付が色付きで目立つように表示
- 🎨 **モダンなデザイン** - Windows 11のデザイン言語に合わせたスタイル
- 📌 **常に最前面表示** - 他のウィンドウの上に常に表示
- 🖱️ **ドラッグ移動可能** - ウィジェットをドラッグして好きな位置に配置
- ⌨️ **キーボードショートカット** - 素早く操作可能
- 🌓 **テーマ切り替え** - ライトテーマとダークテーマの切り替え可能
- 🔄 **自動更新** - 日付が変わると自動的に今日を更新

## スクリーンショット / Screenshots

### デフォルトテーマ (透明)
- 透明な背景に白文字
- グラスモーフィズム効果
- 今日の日付は青色でハイライト

### ライトテーマ
- 白い背景
- 黒文字
- 見やすいコントラスト

## インストール / Installation

### 前提条件 / Prerequisites

- Node.js (v16以上)
- npm または yarn
- Windows 11 (Windows 10でも動作します)

### セットアップ手順 / Setup Steps

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd MySecretary/calendar-widget
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **アプリケーションの起動**
   ```bash
   npm start
   ```

## 使い方 / Usage

### 起動方法

```bash
# 開発モード（ログ有効）
npm run dev

# 通常起動
npm start
```

### ウィジェットの操作

- **移動**: ウィジェットをドラッグして移動
- **月の切り替え**: 左右の矢印ボタンをクリック
- **日付選択**: 日付をクリックして選択
- **右クリック**: テーマの切り替え（透明 ⇔ ライト）
- **ダブルクリック**: 今月に戻る

### キーボードショートカット

| キー | 機能 |
|------|------|
| `T` | ライトテーマに切り替え |
| `H` | 今月（今日）に戻る |

### カレンダーの見方

- **月〜金**: 通常の平日（白色）
- **土日**: 週末（赤みがかった色）
- **今日**: 青色でハイライト、光るアニメーション効果
- **他の月の日付**: 薄いグレー表示

## ビルド / Build

### Windows用実行ファイルの作成

```bash
# インストーラー付き実行ファイル (.exe)
npm run build:win

# ポータブル実行ファイル
npm run build:portable
```

ビルドされたファイルは `dist` フォルダに作成されます。

### ビルドオプション

- **NSIS Installer**: 通常のインストーラー形式
- **Portable**: インストール不要の実行ファイル

## カスタマイズ / Customization

### カレンダーのサイズ変更

`main.js` の `calendarWidth` と `calendarHeight` 変数を変更:

```javascript
const calendarWidth = 300;  // デフォルトは300px
const calendarHeight = 350; // デフォルトは350px
```

### 初期位置の変更

`main.js` の `x` と `y` の計算を変更:

```javascript
// 右上角（デフォルト）
const x = width - calendarWidth - 20;
const y = 20;

// 左上角に変更する場合
// const x = 20;
// const y = 20;
```

### 色とスタイルの変更

`style.css` を編集して、お好みの色やスタイルに変更できます:

- `.calendar-container`: カレンダー全体の背景
- `.calendar-day.today`: 今日の日付のスタイル
- `.calendar-day.weekend`: 週末のスタイル
- `.nav-btn`: ナビゲーションボタンのスタイル

### 週の始まりを日曜日に変更

`calendar.js` の `getFirstDayOfMonth` 関数と weekdays の順序を変更することで、
週の始まりを日曜日にカスタマイズできます。

## プロジェクト構成 / Project Structure

```
calendar-widget/
├── main.js          # Electronのメインプロセス
├── preload.js       # プリロードスクリプト
├── index.html       # カレンダーのHTML構造
├── style.css        # スタイルシート（透明効果含む）
├── calendar.js      # カレンダーのロジック
├── package.json     # プロジェクト設定
└── README.md        # このファイル
```

## 技術スタック / Tech Stack

- **Electron**: デスクトップアプリケーションフレームワーク
- **HTML5**: カレンダーの構造
- **CSS3**: 透明効果とアニメーション
- **JavaScript**: カレンダーのロジック（月曜日始まり、今日の強調表示）

## カレンダーの機能詳細

### 月曜日始まり
日本の一般的なカレンダー形式に合わせて、週の始まりを月曜日にしています。

### 今日の表示
- 青色の背景でハイライト
- 光るパルスアニメーション
- 太字で表示
- 自動的に午前0時に更新

### 月の切り替え
- 左矢印：前月
- 右矢印：翌月
- キーボードの `H` キーまたはダブルクリック：今月に戻る

## トラブルシューティング / Troubleshooting

### ウィジェットが表示されない

1. Electronが正しくインストールされているか確認
   ```bash
   npm install electron
   ```

2. ログを確認
   ```bash
   npm run dev
   ```

### 透明背景が機能しない

- Windows 11/10でデスクトップコンポジションが有効になっているか確認
- グラフィックドライバーが最新か確認

### 今日の日付が正しく表示されない

- システムの日付と時刻が正しく設定されているか確認
- タイムゾーンが正しく設定されているか確認

## 時計ウィジェットとの併用

同じリポジトリ内の `clock-widget` と一緒に使用できます。
両方のウィジェットを同時に起動して、デスクトップに時計とカレンダーを表示できます。

## ライセンス / License

ISC License

## 貢献 / Contributing

プルリクエストを歓迎します！バグ報告や機能要望はIssuesでお願いします。

## 今後の機能追加予定 / Future Features

- [ ] 祝日の表示（日本の祝日）
- [ ] イベント・予定の登録機能
- [ ] Google カレンダー連携
- [ ] リマインダー機能
- [ ] 複数月表示
- [ ] カスタマイズ可能なカラーテーマ
- [ ] システムトレイ統合
- [ ] 自動起動オプション
- [ ] 週番号の表示

## 作者 / Author

MySecretary Project

## サポート / Support

問題が発生した場合は、GitHubのIssuesで報告してください。
