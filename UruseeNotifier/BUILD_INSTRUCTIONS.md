# UruseeNotifier - Windows EXE ビルド手順

このガイドに従って、UruseeNotifierをWindows用のEXEファイル（インストーラー）にビルドできます。

## 前提条件

- Windows 10/11
- Node.js 16.x 以上（https://nodejs.org/ からダウンロード）
- npm（Node.jsに同梱）

## ステップ1: プロジェクトの準備

1. UruseeNotifier.zipを解凍
2. コマンドプロンプトまたはPowerShellを開く
3. UruseeNotifierフォルダに移動

```cmd
cd C:\path\to\UruseeNotifier
```

## ステップ2: アイコンファイルの準備（重要）

`assets/icon.png` に256x256ピクセルのアイコン画像を配置してください。

### 簡易アイコンの作成方法

Pythonがインストールされている場合：

```bash
pip install pillow
python create_icon.py
```

または、以下のサイトで無料アイコンをダウンロード：
- https://www.iconfinder.com/
- https://icons8.com/

**アイコンがない場合でもビルドは可能ですが、デフォルトのElectronアイコンになります。**

## ステップ3: 依存関係のインストール

```cmd
npm install
```

初回は5〜10分かかる場合があります。

## ステップ4: Reactアプリのビルド

```cmd
npm run build
```

このコマンドで `build/` フォルダにReactアプリがビルドされます。

## ステップ5: Windows EXE/インストーラーの作成

```cmd
npm run build:win
```

このコマンドで以下が生成されます：
- `dist/UruseeNotifier Setup [バージョン].exe` - インストーラー
- `dist/win-unpacked/` - ポータブル版

## ステップ6: 実行ファイルの確認

ビルド完了後、`dist` フォルダ内に以下のファイルが生成されます：

```
dist/
├── UruseeNotifier Setup 1.0.0.exe  (インストーラー)
└── win-unpacked/
    └── UruseeNotifier.exe          (ポータブル実行ファイル)
```

## トラブルシューティング

### エラー: "electron-builder not found"

```cmd
npm install electron-builder --save-dev
npm run build:win
```

### エラー: "Application entry file not found"

まず `npm run build` を実行してからビルドしてください。

### ビルドが遅い場合

初回ビルドは10〜15分かかることがあります。コーヒーブレイクを取りましょう！

### アイコンが表示されない

`assets/icon.png` が正しく配置されているか確認してください。
256x256ピクセルのPNG形式である必要があります。

## クリーンビルド（問題が発生した場合）

```cmd
rmdir /s /q node_modules
rmdir /s /q build
rmdir /s /q dist
npm install
npm run build
npm run build:win
```

## ポータブル版の作成のみ

インストーラーなしで、単一のEXEファイルだけが欲しい場合：

`package.json` の `build.win.target` を以下のように変更：

```json
"win": {
  "target": "portable",
  "icon": "assets/icon.png"
}
```

その後、`npm run build:win` を実行すると、`dist/UruseeNotifier.exe` が生成されます。

## 配布方法

### インストーラー版
`UruseeNotifier Setup 1.0.0.exe` を配布してください。
ユーザーはダブルクリックでインストールできます。

### ポータブル版
`win-unpacked` フォルダ全体をZIP圧縮して配布してください。
ユーザーは解凍後、`UruseeNotifier.exe` を実行できます。

## ビルドサイズ

- インストーラー: 約70〜100MB
- ポータブル版: 約150〜200MB（解凍後）

Electronアプリは、ChromiumとNode.jsを含むため、サイズが大きくなります。

## 自動更新機能（オプション）

自動更新を追加したい場合は、electron-updaterを設定してください。
詳細: https://www.electron.build/auto-update

## よくある質問

**Q: ビルドにどのくらい時間がかかりますか？**
A: 初回は10〜15分、2回目以降は3〜5分程度です。

**Q: 他のPCでも動きますか？**
A: はい。Windows 10/11であれば、Node.jsがインストールされていなくても動作します。

**Q: ウイルス対策ソフトが警告を出します**
A: Electronアプリは時々誤検知されます。Windows Defenderの除外リストに追加するか、コード署名証明書を購入してください。

**Q: 32bit版Windowsに対応できますか？**
A: `package.json` の `build.win.target` に `"nsis:ia32"` を追加してください。

## サポート

問題が発生した場合は、以下を確認してください：
- Node.jsのバージョン: `node --version` (16.x以上)
- npmのバージョン: `npm --version` (8.x以上)
- ログファイル: ビルド時のエラーメッセージ
