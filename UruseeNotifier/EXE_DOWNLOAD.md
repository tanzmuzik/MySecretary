# 📥 ビルド済みEXEファイルのダウンロード方法

## 最も簡単な方法（自動ビルド版）

GitHubが自動的にWindows EXEファイルをビルドしています。

### ステップ1: GitHubのActionsページにアクセス

```
https://github.com/tanzmuzik/MySecretary/actions
```

### ステップ2: 最新のビルドをクリック

- "Build Windows EXE" という名前のワークフローを探す
- 緑色のチェックマーク✅が付いている最新のものをクリック

### ステップ3: EXEファイルをダウンロード

- ページ下部の "Artifacts" セクションを探す
- **"UruseeNotifier-Windows"** をクリックしてダウンロード

### ステップ4: 解凍して実行

- ダウンロードしたZIPファイルを解凍
- 以下のいずれかを実行：
  - `UruseeNotifier Setup 1.0.0.exe` （インストーラー版）
  - `win-unpacked/UruseeNotifier.exe` （ポータブル版）

## ビルドが完了していない場合

プッシュから5〜10分待ってから、上記のページを再読み込みしてください。

## 直接リンク

現在のブランチのビルド状況：
```
https://github.com/tanzmuzik/MySecretary/actions/workflows/build-windows.yml
```

## トラブルシューティング

### Artifactsが見つからない

ビルドが完了していない可能性があります。少し待ってから再度確認してください。

### ダウンロードできない

GitHubにログインしていることを確認してください。

### すぐに使いたい

ローカルPCで以下を実行すると、自分でビルドできます：
```cmd
cd UruseeNotifier
build-windows.bat
```

---

**注意**: GitHub Actionsの無料枠を使用しているため、ビルドには5〜10分かかります。
