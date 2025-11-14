# アセットファイルについて

このディレクトリには、UruseeNotifierアプリで使用するアセットファイルを配置します。

## 必要なファイル

### 1. アイコン (icon.png)

タスクトレイに表示されるアイコンです。

**仕様:**
- サイズ: 256x256ピクセル（推奨）
- フォーマット: PNG（透過背景推奨）
- デザイン: シンプルで視認性の高いデザイン
- 推奨カラー: 赤、オレンジなど「うるせぇ！」を表現する色

**作成方法:**
- オンラインアイコンジェネレーターを使用
- フリー素材サイトからダウンロード
- 自分でデザインツールで作成

**簡易アイコンの作成スクリプト（参考）:**
以下のPythonスクリプトで簡単なアイコンを作成できます：

```python
from PIL import Image, ImageDraw, ImageFont

# 256x256の画像を作成
img = Image.new('RGBA', (256, 256), (255, 107, 107, 255))
draw = ImageDraw.Draw(img)

# 白い円を描画
draw.ellipse([20, 20, 236, 236], fill='white', outline=(255, 255, 255, 255), width=5)

# テキストを追加（日本語フォントが必要）
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
    draw.text((128, 128), "💢", font=font, fill='red', anchor='mm')
except:
    pass

img.save('icon.png')
```

### 2. 効果音 (sounds/paan.mp3)

メッセージ受信時に再生される効果音です。

**仕様:**
- フォーマット: MP3またはWAV
- 長さ: 0.5〜1秒程度
- 音量: 適度な大きさ（アプリ内で調整可能）
- 音質: 「パーン！」という軽い打撃音

**作成方法:**
1. フリー効果音サイトからダウンロード
   - https://soundeffect-lab.info/
   - https://freesound.org/

2. オンライン効果音ジェネレーターを使用
   - https://sfxr.me/

3. DAWソフトで自作

**推奨効果音:**
- 手を叩く音
- 机を叩く音
- ポップ音
- ベル音

## プレースホルダーファイル

開発時には、以下のコマンドで仮のファイルを作成できます：

```bash
# 仮のアイコンを作成（赤い四角）
convert -size 256x256 xc:red assets/icon.png

# または、ImageMagickがない場合は、任意の画像ファイルをコピー
```

効果音については、アプリ起動時に音声ファイルが見つからない場合は、
デフォルトでビープ音が再生されるようになっています。
