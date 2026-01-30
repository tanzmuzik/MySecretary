# Premiere Pro Subtitle Auto-Placer プラグイン

Vrew で生成した SRT 形式の字幕ファイルを、Premiere Pro に自動で配置するプラグインです。

## 機能

- **SRT字幕の自動読み込み** - Vrew で生成した字幕ファイルを直接読み込み
- **タイムコード同期** - 字幕の開始・終了時間を正確に同期
- **テンプレート設定** - フォント、色、サイズ、背景、位置を自動的に適用
- **バッチ処理** - 複数の字幕を一度に配置

## 対応環境

- **Adobe Premiere Pro**: CC 2018 以降
- **OS**: Windows / macOS
- **Node.js**: 12.0 以上（開発環境）

## インストール

### 1. 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd premiere-pro-subtitle-plugin

# 依存関係をインストール
npm install
```

### 2. ビルド

```bash
# 本番用ビルド
npm run build

# 開発用ビルド（ウォッチモード）
npm run dev
```

### 3. Premiere Pro にプラグインをインストール

**Windows:**
```
C:\Users\[ユーザー名]\AppData\Roaming\Adobe\CEP\extensions\
```
に `premiere-pro-subtitle-plugin` フォルダをコピー

**macOS:**
```
~/Library/Application Support/Adobe/CEP/extensions/
```
に `premiere-pro-subtitle-plugin` フォルダをコピー

### 4. デバッグモードの有効化

1. Premiere Pro を起動
2. Window → Extensions → Subtitle Auto-Placer を選択
3. プラグインパネルが表示されます

## 使用方法

### 基本的なワークフロー

1. **動画を編集する**
   - Vrew で動画を読み込み

2. **字幕を生成する**
   - Vrew で AI 字幕生成

3. **字幕をエクスポート**
   - Vrew から SRT 形式でエクスポート

4. **Premiere Pro に配置**
   - プラグインパネルを開く
   - SRT ファイルを選択
   - テンプレート設定を調整（必要に応じて）
   - 「字幕を配置する」をクリック

### テンプレート設定

プラグインパネルで以下の設定が可能です：

| 設定項目 | デフォルト値 | 説明 |
|---------|-----------|------|
| フォント | Arial | 使用するフォント |
| フォントサイズ | 48 | テキストサイズ（ポイント） |
| テキストカラー | 白 (#FFFFFF) | 字幕の文字色 |
| 背景色 | 黒 (#000000) | 背景の色 |
| 透明度 | 80% | 背景の透明度 |
| 垂直位置 | 下部 | 字幕の表示位置（上部/中央/下部） |
| 背景を追加 | ✓ | 背景を表示するか |
| シャドウを追加 | ✓ | テキストシャドウを追加するか |

## プロジェクト構成

```
premiere-pro-subtitle-plugin/
├── src/
│   ├── panel/               # CEP パネル（UI）
│   │   ├── index.html      # ユーザーインターフェース
│   │   ├── styles.css      # スタイルシート
│   │   └── script.js       # UI ロジック
│   ├── jsx/                # ExtendScript（Premiere Pro 処理）
│   │   └── main.jsx        # Premiere Pro API 統合
│   └── lib/
│       └── srtParser.js    # SRT ファイルパーサー
├── CSXS/
│   └── manifest.xml        # Adobe CEP 設定ファイル
├── package.json
├── webpack.config.js       # ビルド設定
└── README.md
```

## SRT ファイル形式

プラグインは標準的な SRT ファイル形式に対応しています：

```
1
00:00:01,000 --> 00:00:05,000
最初の字幕

2
00:00:06,000 --> 00:00:10,000
2番目の字幕

3
00:00:11,000 --> 00:00:15,000
3番目の字幕
```

## トラブルシューティング

### プラグインが表示されない

1. Premiere Pro を再起動
2. Adobe CEP の拡張機能を再度インストール
3. ログファイルを確認：`~/subtitle-plugin.log`

### 字幕が配置されない

1. SRT ファイルのフォーマットを確認
2. Premiere Pro でシーケンスが選択されているか確認
3. ビデオトラックが存在するか確認

### パフォーマンス問題

- 字幕数が多い場合（100+）は、複数のシーケンスに分割することをお勧めします
- テンプレート設定を簡略化することでレンダリング速度が向上します

## 開発ガイド

### 新機能の追加

1. 機能を実装
2. `npm run build` でビルド
3. Premiere Pro を再起動
4. テストを実施

### デバッグ

- ExtendScript のログ：`~/subtitle-plugin.log`
- ブラウザの開発者ツール：`Window → Extensions → Subtitle Auto-Placer` で F12

## 今後の改善予定

- [ ] 複数言語対応
- [ ] カスタムテンプレートの保存/読み込み
- [ ] プリセット機能
- [ ] ドラッグ&ドロップ対応
- [ ] リアルタイムプレビュー
- [ ] 字幕の個別編集機能
- [ ] エフェクト自動適用（フェードイン/アウト）

## ライセンス

MIT License

## サポート

問題や機能要望は GitHub Issues でお知らせください。

## 参考資料

- [Adobe CEP Documentation](https://github.com/Adobe-CEP/CEP-Resources)
- [Premiere Pro ExtendScript Guide](https://ppro.adobeprojectpath.com/docs/ExtendScript/)
- [SRT 字幕形式](https://ja.wikipedia.org/wiki/SubRip)
