# アイコンファイル

このディレクトリには以下のアイコンファイルが必要です：

- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS用 - 不要)
- `icon.ico` (Windows用)
- `icon.png` (システムトレイ用)

## アイコンの準備方法

1. アイコン画像を作成（シンプルな通知マークなど）
2. オンラインツールで各サイズに変換
   - 推奨ツール: https://www.favicon-generator.org/
3. 各ファイルをこのディレクトリに配置

または、Tauriのデフォルトアイコンを使用することもできます。

## 簡易的な作成方法

以下のコマンドでプレースホルダーアイコンを生成できます：

```bash
# ImageMagickがインストールされている場合
convert -size 32x32 xc:red 32x32.png
convert -size 128x128 xc:red 128x128.png
convert -size 256x256 xc:red 128x128@2x.png
convert -size 256x256 xc:red icon.png
convert icon.png icon.ico
```
