# アナログ時計ウィジェット / Analog Clock Widget

Windows 11対応のデスクトップアナログ時計ウィジェットです。透明な背景で、常に最前面に表示されます。

A Windows 11-compatible desktop analog clock widget with a transparent background that stays always on top.

![Clock Widget Preview](preview.png)

## 特徴 / Features

- ✨ **透明背景** - ガラスモーフィズム効果の美しい透明背景
- 🎨 **モダンなデザイン** - Windows 11のデザイン言語に合わせたスタイル
- 📌 **常に最前面表示** - 他のウィンドウの上に常に表示
- 🖱️ **ドラッグ移動可能** - ウィジェットをドラッグして好きな位置に配置
- ⌨️ **キーボードショートカット** - テーマの切り替えなど
- 🔄 **スムーズなアニメーション** - 秒針が滑らかに動きます
- 🌓 **テーマ切り替え** - ライトテーマとダークテーマの切り替え可能

## スクリーンショット / Screenshots

### デフォルトテーマ (透明)
- 透明な背景に白い針
- グラスモーフィズム効果
- 赤い秒針

### ライトテーマ
- 白い背景
- 黒い針

## インストール / Installation

### 前提条件 / Prerequisites

- Node.js (v16以上)
- npm または yarn
- Windows 11 (Windows 10でも動作します)

### セットアップ手順 / Setup Steps

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd MySecretary/clock-widget
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
- **右クリック**: テーマの切り替え（透明 ⇔ ライト）
- **ダブルクリック**: デジタル時計表示のON/OFF

### キーボードショートカット

| キー | 機能 |
|------|------|
| `T` | ライトテーマに切り替え |
| `D` | ダークテーマに切り替え |
| `H` | デジタル時計表示のON/OFF |

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

### 時計のサイズ変更

`main.js` の `clockSize` 変数を変更:

```javascript
const clockSize = 200; // デフォルトは200px
```

### 初期位置の変更

`main.js` の `x` と `y` の計算を変更:

```javascript
// 右上角（デフォルト）
const x = width - clockSize - 20;
const y = 20;

// 左上角に変更する場合
// const x = 20;
// const y = 20;
```

### 色とスタイルの変更

`style.css` を編集して、お好みの色やスタイルに変更できます:

- `.clock-face`: 時計の文字盤
- `.hour-hand`: 時針
- `.minute-hand`: 分針
- `.second-hand`: 秒針

## プロジェクト構成 / Project Structure

```
clock-widget/
├── main.js          # Electronのメインプロセス
├── preload.js       # プリロードスクリプト
├── index.html       # 時計のHTML構造
├── style.css        # スタイルシート（透明効果含む）
├── clock.js         # 時計のロジック
├── package.json     # プロジェクト設定
└── README.md        # このファイル
```

## 技術スタック / Tech Stack

- **Electron**: デスクトップアプリケーションフレームワーク
- **HTML5 SVG**: 時計の描画
- **CSS3**: 透明効果とアニメーション
- **JavaScript**: 時計のロジック

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

### ウィジェットが動かせない

- ウィジェットの中央部分をドラッグしてください
- 針の部分ではなく、文字盤の背景をドラッグします

## ライセンス / License

ISC License

## 貢献 / Contributing

プルリクエストを歓迎します！バグ報告や機能要望はIssuesでお願いします。

## 今後の機能追加予定 / Future Features

- [ ] アラーム機能
- [ ] タイマー機能
- [ ] 複数のデザインテーマ
- [ ] 世界時計（複数のタイムゾーン）
- [ ] カスタマイズ可能なカラーパレット
- [ ] システムトレイ統合
- [ ] 自動起動オプション

## 作者 / Author

MySecretary Project

## サポート / Support

問題が発生した場合は、GitHubのIssuesで報告してください。
