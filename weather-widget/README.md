# 天気予報ウィジェット / Weather Forecast Widget

Windows 11対応のデスクトップ天気予報ウィジェットです。透明な背景で、常に最前面に表示されます。

A Windows 11-compatible desktop weather forecast widget with a transparent background that stays always on top.

## 特徴 / Features

- ✨ **透明背景** - ガラスモーフィズム効果の美しい透明背景
- 🌤️ **現在の天気** - 気温、体感温度、湿度、風速を表示
- 📅 **週間天気予報** - 5日間の天気予報を表示
- 🏙️ **複数都市対応** - 日本の主要都市を選択可能
- 📌 **常に最前面表示** - 他のウィンドウの上に常に表示
- 🖱️ **ドラッグ移動可能** - ウィジェットをドラッグして好きな位置に配置
- 🔄 **自動更新** - 10分ごとに自動的に天気情報を更新
- 🌓 **テーマ切り替え** - ライトテーマとダークテーマの切り替え可能
- 🎨 **モダンなデザイン** - Windows 11のデザイン言語に合わせたスタイル

## 🚀 セットアップ / Setup

### 前提条件 / Prerequisites

1. **Node.js** (v16以上)
2. **npm** または yarn
3. **OpenWeatherMap APIキー** (無料)

### APIキーの取得方法

このウィジェットは**OpenWeatherMap API**を使用します。以下の手順でAPIキーを取得してください:

#### ステップ1: アカウント作成

1. https://openweathermap.org/ にアクセス
2. 右上の「Sign In」→「Create an Account」をクリック
3. メールアドレス、ユーザー名、パスワードを入力
4. 利用規約に同意してアカウントを作成
5. 確認メールが届くので、リンクをクリックして認証

#### ステップ2: APIキーを取得

1. ログイン後、右上のユーザー名をクリック
2. 「My API keys」を選択
3. デフォルトのAPIキーが表示されます（または「Create Key」で新規作成）
4. APIキーをコピー（例: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`）

**注意**: 無料プラン（Free）で十分です！

### インストール手順

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd MySecretary/weather-widget
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **APIキーの設定**

   `weather.js` ファイルを開いて、APIキーを設定:

   ```javascript
   // weather.js の5行目あたり
   const API_KEY = 'YOUR_API_KEY_HERE'; // ← ここにコピーしたAPIキーを貼り付け
   ```

   例:
   ```javascript
   const API_KEY = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
   ```

4. **アプリケーションの起動**
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
- **都市変更**: ドロップダウンから都市を選択
- **更新**: 🔄ボタンをクリックで即座に更新
- **右クリック**: テーマの切り替え（透明 ⇔ ライト）

### キーボードショートカット

| キー | 機能 |
|------|------|
| `T` | ライトテーマに切り替え |

### 対応都市

デフォルトで以下の都市に対応:
- 東京
- 大阪
- 京都
- 福岡
- 札幌
- 名古屋
- 横浜
- 神戸

## ビルド / Build

### Windows用実行ファイルの作成

```bash
# インストーラー付き実行ファイル (.exe)
npm run build:win

# ポータブル実行ファイル
npm run build:portable
```

**重要**: exeファイルをビルドする前に、必ず`weather.js`にAPIキーを設定してください！

ビルドされたファイルは `dist` フォルダに作成されます。

## カスタマイズ / Customization

### 都市を追加

`index.html` の `location-select` に都市を追加:

```html
<option value="Sapporo,JP">札幌</option>
<option value="Sendai,JP">仙台</option>  <!-- 追加 -->
```

### 更新間隔の変更

`weather.js` の最後の方:

```javascript
// Auto-update every 10 minutes
setInterval(updateWeather, 10 * 60 * 1000); // 10分ごと

// 30分ごとに変更する場合
setInterval(updateWeather, 30 * 60 * 1000); // 30分ごと
```

### サイズの変更

`main.js` の `weatherWidth` と `weatherHeight` を変更:

```javascript
const weatherWidth = 350;  // デフォルトは350px
const weatherHeight = 450; // デフォルトは450px
```

## プロジェクト構成 / Project Structure

```
weather-widget/
├── main.js          # Electronのメインプロセス
├── preload.js       # プリロードスクリプト
├── index.html       # 天気表示のHTML構造
├── style.css        # スタイルシート（透明効果含む）
├── weather.js       # 天気APIのロジック
├── package.json     # プロジェクト設定
└── README.md        # このファイル
```

## 技術スタック / Tech Stack

- **Electron**: デスクトップアプリケーションフレームワーク
- **OpenWeatherMap API**: 天気情報API
- **HTML5**: ウィジェットの構造
- **CSS3**: 透明効果とアニメーション
- **JavaScript**: 天気データの取得と表示

## トラブルシューティング / Troubleshooting

### 天気情報が表示されない

1. **APIキーが正しく設定されているか確認**
   ```javascript
   // weather.js を確認
   const API_KEY = 'YOUR_API_KEY_HERE'; // ← 実際のAPIキーが入っているか？
   ```

2. **APIキーが有効か確認**
   - OpenWeatherMapにログインして、APIキーのステータスを確認
   - 新しく作成したAPIキーは、有効になるまで数時間かかることがあります

3. **インターネット接続を確認**
   - ウィジェットはインターネット接続が必要です

4. **開発者ツールでエラーを確認**
   ```bash
   npm run dev
   ```
   コンソールにエラーメッセージが表示されます

### 「APIキーが設定されていません」エラー

`weather.js` の5行目を確認:
```javascript
const API_KEY = 'YOUR_API_KEY_HERE'; // ← これを実際のAPIキーに変更
```

### 透明背景が機能しない

- Windows 11/10でデスクトップコンポジションが有効になっているか確認
- グラフィックドライバーが最新か確認

## API利用制限 / API Limits

OpenWeatherMapの無料プラン:
- **1分間に60回**のリクエストまで
- **1日に1,000,000回**のリクエストまで

このウィジェットは10分ごとに1回しか更新しないため、無料プランで十分です。

## 他のウィジェットとの併用

同じリポジトリ内の `clock-widget` と `calendar-widget` と一緒に使用できます。
3つのウィジェットを同時に起動して、デスクトップに時計、カレンダー、天気を表示できます！

## ライセンス / License

ISC License

## 貢献 / Contributing

プルリクエストを歓迎します！バグ報告や機能要望はIssuesでお願いします。

## 今後の機能追加予定 / Future Features

- [ ] 時間ごとの天気予報
- [ ] 天気アラート・警報
- [ ] 降水確率の表示
- [ ] UV指数の表示
- [ ] 複数地点の同時表示
- [ ] カスタマイズ可能なカラーテーマ
- [ ] 他の天気APIのサポート
- [ ] 自動位置検出

## 作者 / Author

MySecretary Project

## サポート / Support

問題が発生した場合は、GitHubのIssuesで報告してください。

---

**重要**: このウィジェットを使用するには、OpenWeatherMapの無料APIキーが必要です。
APIキーの取得は簡単で、数分で完了します！ 🌤️
