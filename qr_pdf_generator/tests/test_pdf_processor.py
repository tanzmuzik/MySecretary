"""
QRコードPDF生成アプリケーション - テストモジュール
"""

import unittest
import os
import sys
import tempfile
from pathlib import Path

# srcモジュールをインポート可能に
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from pdf_processor import PDFProcessor, SlotCoordinate, auto_detect_qr_images, split_into_batches


class TestSlotCoordinate(unittest.TestCase):
    """スロット座標テスト"""

    def test_slots_count(self):
        """スロット数が10個であることを確認"""
        self.assertEqual(len(SlotCoordinate.SLOTS), 10)

    def test_slot_layout(self):
        """スロット配置が正しいことを確認"""
        # 1行目（5個）
        row1_slots = [s for s in SlotCoordinate.SLOTS if s['row'] == 1]
        self.assertEqual(len(row1_slots), 5)

        # 2行目（5個）
        row2_slots = [s for s in SlotCoordinate.SLOTS if s['row'] == 2]
        self.assertEqual(len(row2_slots), 5)

    def test_slot_positions(self):
        """スロット位置が正しいことを確認"""
        # X座標が昇順であることを確認
        for row in [1, 2]:
            row_slots = sorted([s for s in SlotCoordinate.SLOTS if s['row'] == row], key=lambda x: x['col'])
            x_coords = [s['x'] for s in row_slots]
            self.assertEqual(x_coords, sorted(x_coords))


class TestSplitBatches(unittest.TestCase):
    """バッチ分割テスト"""

    def test_split_exact_batch(self):
        """正確に分割される場合"""
        items = list(range(10))
        batches = split_into_batches(items, batch_size=10)
        self.assertEqual(len(batches), 1)
        self.assertEqual(batches[0], items)

    def test_split_multiple_batches(self):
        """複数バッチに分割される場合"""
        items = list(range(36))
        batches = split_into_batches(items, batch_size=10)
        self.assertEqual(len(batches), 4)
        self.assertEqual(len(batches[0]), 10)
        self.assertEqual(len(batches[1]), 10)
        self.assertEqual(len(batches[2]), 10)
        self.assertEqual(len(batches[3]), 6)

    def test_split_partial_batch(self):
        """不完全なバッチ"""
        items = list(range(15))
        batches = split_into_batches(items, batch_size=10)
        self.assertEqual(len(batches), 2)
        self.assertEqual(len(batches[0]), 10)
        self.assertEqual(len(batches[1]), 5)


class TestAutoDetectQRImages(unittest.TestCase):
    """QRコード自動検出テスト"""

    def setUp(self):
        """テストの初期化"""
        self.temp_dir = tempfile.mkdtemp()

    def test_no_folder(self):
        """フォルダが見つからない場合"""
        with self.assertRaises(FileNotFoundError):
            auto_detect_qr_images("/non/existent/folder")

    def test_no_qr_files(self):
        """QRコードファイルが無い場合"""
        with self.assertRaises(ValueError):
            auto_detect_qr_images(self.temp_dir)

    def test_auto_detect_qr_files(self):
        """QRコードファイルを自動検出"""
        # テンポラリQRコードファイルを作成
        qr_files = ["qr_101.png", "qr_102.png", "qr_A201.png"]
        for qr_file in qr_files:
            path = os.path.join(self.temp_dir, qr_file)
            with open(path, 'w') as f:
                f.write("dummy")

        qr_images, room_numbers = auto_detect_qr_images(self.temp_dir)
        self.assertEqual(len(qr_images), 3)
        self.assertEqual(len(room_numbers), 3)
        self.assertEqual(room_numbers, ["101", "102", "A201"])

    def tearDown(self):
        """テストの終了処理"""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)


class TestPDFProcessor(unittest.TestCase):
    """PDFプロセッサテスト"""

    def setUp(self):
        """テストの初期化"""
        # テンポラリディレクトリを作成
        self.temp_dir = tempfile.mkdtemp()

    def test_template_not_found(self):
        """テンプレートPDFが見つからない場合"""
        with self.assertRaises(FileNotFoundError):
            PDFProcessor("/non/existent/path.pdf")

    def test_invalid_file_format(self):
        """無効なファイル形式"""
        # テンポラリ.txtファイルを作成
        temp_file = os.path.join(self.temp_dir, "test.txt")
        with open(temp_file, 'w') as f:
            f.write("test")

        with self.assertRaises(ValueError):
            PDFProcessor(temp_file)

    def tearDown(self):
        """テストの終了処理"""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)


if __name__ == '__main__':
    unittest.main()
