# UruseeNotifier - クイックスタート

## Windows EXEファイルを作成する（最短手順）

### 方法1: バッチファイル使用（推奨・最も簡単）

1. UruseeNotifier.zipを解凍
2. `build-windows.bat` をダブルクリック
3. 画面の指示に従う
4. 完了！ `dist` フォルダにEXEファイルが生成されます

### 方法2: コマンドライン使用

```cmd
cd C:\path\to\UruseeNotifier
npm install
npm run build
npm run build:win
```

## アイコンを作成する

### Pythonを使う場合

```cmd
pip install pillow
python create_icon.py
```

### 自分で用意する場合

`assets/icon.png` に256x256ピクセルのPNG画像を配置

## 開発モードで試す

EXEファイルを作成せずに、すぐに試したい場合：

```cmd
npm install
npm run dev
```

ブラウザが開き、アプリが表示されます。

## よくある質問

**Q: ビルドに失敗します**
A: `node --version` が16以上か確認してください。古い場合は https://nodejs.org/ から最新版をインストール。

**Q: ビルドが遅い**
A: 初回は10〜15分かかります。2回目以降は速くなります。

**Q: EXEファイルはどこ？**
A: `dist` フォルダ内の `UruseeNotifier Setup 1.0.0.exe` がインストーラー、`win-unpacked/UruseeNotifier.exe` がポータブル版です。

**Q: アイコンは必須？**
A: いいえ。なくてもビルドできますが、デフォルトのElectronアイコンになります。

## トラブルシューティング

### "npm install" でエラー

管理者権限でコマンドプロンプトを開いて再実行してください。

### ビルドが途中で止まる

Ctrl+Cで中止して、以下を実行：

```cmd
rmdir /s /q node_modules
rmdir /s /q build
rmdir /s /q dist
npm install
build-windows.bat
```

### ウイルス対策ソフトが警告

Electronアプリは時々誤検知されます。問題ありません。

## 次のステップ

詳細なビルド手順は `BUILD_INSTRUCTIONS.md` を参照してください。
