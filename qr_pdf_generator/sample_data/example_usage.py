"""
QRコードPDF生成アプリケーション - 使用例（プログラマティック実行）
"""

import sys
import os
from pathlib import Path

# srcモジュールをインポート
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from pdf_processor import PDFProcessor, split_rooms_into_batches


def example_basic_usage():
    """基本的な使用例"""
    print("=" * 60)
    print("QRコード配置PDF生成 - 基本的な使用例")
    print("=" * 60)

    # テンプレートPDFのパス
    template_pdf = "/path/to/template.pdf"

    # QRコード画像フォルダ
    qr_folder = "/path/to/qr_images"

    # 出力フォルダ
    output_folder = "/path/to/output"

    # 部屋番号の範囲
    start_room = 101
    end_room = 136

    # PDFプロセッサを初期化
    try:
        processor = PDFProcessor(template_pdf)
        print(f"✓ テンプレートPDF読み込み成功: {template_pdf}")
    except FileNotFoundError as e:
        print(f"✗ エラー: {e}")
        return

    # 部屋番号をバッチに分割
    batches = split_rooms_into_batches(start_room, end_room, batch_size=10)
    print(f"✓ {len(batches)}個のバッチに分割しました")

    # 各バッチごとにPDFを生成
    for batch_idx, (batch_start, batch_end) in enumerate(batches, 1):
        print(f"\n【バッチ{batch_idx}】 部屋番号 {batch_start}～{batch_end}")

        # QRコード画像と部屋番号を取得
        qr_images = []
        room_numbers = []

        for room_num in range(batch_start, batch_end + 1):
            qr_filename = f"qr_{room_num}.png"
            qr_path = os.path.join(qr_folder, qr_filename)

            if not os.path.exists(qr_path):
                print(f"  ✗ QRコード画像が見つかりません: {qr_filename}")
                continue

            qr_images.append(qr_path)
            room_numbers.append(str(room_num))

        if len(qr_images) == 0:
            print(f"  ✗ このバッチにはQRコード画像がありません")
            continue

        # PDFを出力
        output_filename = f"output_{batch_idx}.pdf"
        output_path = os.path.join(output_folder, output_filename)

        try:
            processor.create_output_pdf(qr_images, room_numbers, output_path)
            print(f"  ✓ PDF生成成功: {output_filename}")
            print(f"    → {output_path}")
        except Exception as e:
            print(f"  ✗ PDF生成失敗: {e}")

    print("\n" + "=" * 60)
    print("処理完了")
    print("=" * 60)


def example_single_batch():
    """単一バッチの処理例"""
    print("=" * 60)
    print("QRコード配置PDF生成 - 単一バッチ処理例")
    print("=" * 60)

    # テンプレートPDFのパス
    template_pdf = "/path/to/template.pdf"

    # QRコード画像フォルダ
    qr_folder = "/path/to/qr_images"

    # 出力フォルダ
    output_folder = "/path/to/output"

    # PDFプロセッサを初期化
    processor = PDFProcessor(template_pdf)

    # 5つのQRコード画像を指定
    qr_images = [
        os.path.join(qr_folder, "qr_101.png"),
        os.path.join(qr_folder, "qr_102.png"),
        os.path.join(qr_folder, "qr_103.png"),
        os.path.join(qr_folder, "qr_104.png"),
        os.path.join(qr_folder, "qr_105.png"),
    ]

    room_numbers = ["101", "102", "103", "104", "105"]

    # PDFを出力
    output_path = os.path.join(output_folder, "output_sample.pdf")
    processor.create_output_pdf(qr_images, room_numbers, output_path)

    print(f"✓ PDF生成成功: {output_path}")


def example_batch_calculation():
    """バッチ分割の計算例"""
    print("=" * 60)
    print("QRコード配置PDF生成 - バッチ分割計算例")
    print("=" * 60)

    test_cases = [
        (101, 110),      # 正確に10個
        (101, 136),      # 複数バッチ
        (101, 115),      # 不完全なバッチ
        (1, 50),         # 多くのバッチ
    ]

    for start, end in test_cases:
        batches = split_rooms_into_batches(start, end, batch_size=10)
        total_rooms = end - start + 1
        print(f"\n部屋番号 {start}～{end} ({total_rooms}室)")
        print(f"  → {len(batches)}個のバッチに分割")
        for idx, (b_start, b_end) in enumerate(batches, 1):
            count = b_end - b_start + 1
            print(f"    バッチ{idx}: 部屋{b_start}～{b_end} ({count}室)")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="QRコード配置PDF生成 - 使用例")
    parser.add_argument(
        "--example",
        choices=["basic", "single", "batch"],
        default="batch",
        help="実行する例を選択 (default: batch)"
    )

    args = parser.parse_args()

    if args.example == "basic":
        example_basic_usage()
    elif args.example == "single":
        example_single_batch()
    elif args.example == "batch":
        example_batch_calculation()
