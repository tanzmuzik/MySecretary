#!/usr/bin/env python3
"""
UruseeNotifier用のアイコンを作成するスクリプト
256x256ピクセルのPNGアイコンを生成します
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("Error: Pillowがインストールされていません。")
    print("以下のコマンドでインストールしてください:")
    print("  pip install pillow")
    exit(1)

def create_icon():
    # 256x256の画像を作成（赤い背景）
    size = 256
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # グラデーション風の背景
    for i in range(size):
        alpha = int(255 * (1 - i / size))
        color = (255, int(107 + i * 0.3), int(107 + i * 0.3), 255)
        draw.rectangle([0, i, size, i+1], fill=color)

    # 白い円を描画
    margin = 20
    draw.ellipse(
        [margin, margin, size-margin, size-margin],
        fill='white',
        outline=(255, 255, 255, 255),
        width=5
    )

    # 中心に赤い円
    center_size = 120
    center_margin = (size - center_size) // 2
    draw.ellipse(
        [center_margin, center_margin, center_margin + center_size, center_margin + center_size],
        fill=(255, 107, 107, 255),
        outline=(200, 50, 50, 255),
        width=3
    )

    # テキストを追加
    try:
        # システムフォントを試す（Windows）
        font_paths = [
            "C:\\Windows\\Fonts\\msgothic.ttc",  # MS Gothic
            "C:\\Windows\\Fonts\\meiryo.ttc",    # Meiryo
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",  # Linux
            "/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc",  # Mac
        ]

        font = None
        for font_path in font_paths:
            if os.path.exists(font_path):
                try:
                    font = ImageFont.truetype(font_path, 100)
                    break
                except:
                    continue

        if font:
            # 絵文字を追加
            emoji = "💢"
            bbox = draw.textbbox((0, 0), emoji, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            text_x = (size - text_width) // 2
            text_y = (size - text_height) // 2 - 10

            draw.text((text_x, text_y), emoji, font=font, fill=(200, 0, 0, 255))
        else:
            # フォントが見つからない場合は、感嘆符を描画
            draw.text((size//2 - 20, size//2 - 40), "!",
                     font=ImageFont.load_default(), fill=(200, 0, 0, 255))

    except Exception as e:
        print(f"テキスト描画エラー（無視されます）: {e}")

    # アイコンを保存
    output_path = os.path.join("assets", "icon.png")
    os.makedirs("assets", exist_ok=True)
    img.save(output_path)
    print(f"✓ アイコンを作成しました: {output_path}")
    print(f"  サイズ: {size}x{size}ピクセル")

    # プレビュー情報
    print("\nアイコンが気に入らない場合は、以下のサイトで作成できます:")
    print("  - https://www.iconfinder.com/")
    print("  - https://icons8.com/")
    print("  - https://www.flaticon.com/")

if __name__ == "__main__":
    print("UruseeNotifier アイコン作成スクリプト")
    print("=" * 50)
    create_icon()
    print("\n完了！次のステップ:")
    print("  1. npm install")
    print("  2. npm run build")
    print("  3. npm run build:win")
