# 宿曜道 運気鑑定アプリ

生年月日を入力することで、宿曜道による詳細な運気鑑定が瞬時に行えるアプリケーションです。

## 機能

- **本日の運気**: 生年月日から算出した宿星と本日の宿星に基づいた運気鑑定
- **週間運気**: 今週の日ごとの運気推移を表示
- **月間運気**: 選択した月の日ごとの運気の詳細分析
- **年間運気**: 1年間の月ごとの運気推移を表示
- **宿星情報**: 生年月日から算出した宿星の詳細情報と特性
- **運気スコア**: 0～100点で運気を数値化して表示
- **ビジュアル表現**: ゲージやチャートで直感的に理解できる表現

## 宿曜道について

宿曜道（しゅくようどう）は、古代インドの占星術を基にした日本の占いシステムです。

- **27の宿星**: 月の軌道を27分割し、各分割を異なる宿星と対応させています
- **運気の周期**: 宿星ごとに独特の性質と運気の周期があります
- **相性判定**: 2人の生年月日から相性を判定することもできます

## プロジェクト構成

```
shukuyodo-app/
├── backend/
│   ├── src/
│   │   ├── index.js           # Express サーバーのエントリーポイント
│   │   ├── shukuyodo.js       # 宿曜道計算エンジン
│   │   └── routes/
│   │       └── shukuyodo.js   # API ルート定義
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── index.tsx          # React エントリーポイント
│   │   ├── App.tsx            # ルートコンポーネント
│   │   ├── components/        # 各種コンポーネント
│   │   └── pages/             # ページコンポーネント
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## セットアップ

### 前提条件

- Node.js v16 以上
- npm または yarn

### インストール

1. **バックエンドの依存関係をインストール**

```bash
cd shukuyodo-app/backend
npm install
```

2. **フロントエンドの依存関係をインストール**

```bash
cd ../frontend
npm install
```

## 実行方法

### バックエンドサーバーの起動

```bash
cd backend
npm run dev
```

バックエンドサーバーは `http://localhost:3001` で起動します。

### フロントエンド開発サーバーの起動

別のターミナルで以下を実行します：

```bash
cd frontend
npm start
```

フロントエンドアプリケーションは `http://localhost:3000` で起動します。

## API エンドポイント

### 1. 生年月日情報の取得

**POST** `/api/shukuyodo/birthday-info`

リクエスト：
```json
{
  "birthDate": "1990-05-15"
}
```

レスポンス：
```json
{
  "birthDate": "1990-05-15",
  "birthStar": {
    "id": 1,
    "name": "虚",
    "reading": "きょ",
    "element": "水",
    "natureType": "怪"
  },
  "description": "あなたの宿星は虚宿（きょ）です。"
}
```

### 2. 本日の運気取得

**POST** `/api/shukuyodo/today-fortune`

リクエスト：
```json
{
  "birthDate": "1990-05-15"
}
```

レスポンス：
```json
{
  "date": "2026-01-20",
  "birthStar": { /* ... */ },
  "dayStar": { /* ... */ },
  "score": 75,
  "level": {
    "score": 75,
    "label": "吉",
    "description": "良好な運気です"
  },
  "advice": [ /* ... */ ]
}
```

### 3. 週間運気取得

**POST** `/api/shukuyodo/weekly-fortune`

リクエスト：
```json
{
  "birthDate": "1990-05-15",
  "startDate": "2026-01-19"
}
```

### 4. 月間運気取得

**POST** `/api/shukuyodo/monthly-fortune`

リクエスト：
```json
{
  "birthDate": "1990-05-15",
  "year": 2026,
  "month": 1
}
```

### 5. 年間運気取得

**POST** `/api/shukuyodo/yearly-fortune`

リクエスト：
```json
{
  "birthDate": "1990-05-15",
  "year": 2026
}
```

### 6. 相性判定

**POST** `/api/shukuyodo/compatibility`

リクエスト：
```json
{
  "birthDate1": "1990-05-15",
  "birthDate2": "1992-08-20"
}
```

## 技術スタック

### バックエンド
- Node.js
- Express.js
- JavaScript

### フロントエンド
- React 18
- TypeScript
- CSS3
- Chart.js (グラフ表示用)

## ビルド

フロントエンドの本番用ビルド：

```bash
cd frontend
npm run build
```

ビルドされたファイルは `frontend/build/` に出力されます。

## 開発ガイド

### 新しい機能の追加

1. バックエンドで新しいロジックを `src/shukuyodo.js` に追加
2. 新しい API ルートを `src/routes/shukuyodo.js` に追加
3. フロントエンドで新しいコンポーネントを `src/components/` に作成
4. 必要に応じて CSS ファイルを作成

### コンポーネント開発時の注意点

- TypeScript を使用して型安全性を確保
- コンポーネントは再利用可能なサイズで設計
- CSS モジュールを使用して スタイルの競合を回避
- API 呼び出しは `useEffect` で実行

## ライセンス

ISC

## 今後の拡張予定

- [ ] ユーザーアカウント機能
- [ ] 複数ユーザーの相性比較ツール
- [ ] 運気予測カレンダー
- [ ] 月間の詳細な吉日・凶日一覧
- [ ] プッシュ通知による運気アラート
- [ ] データベースへの履歴保存機能
