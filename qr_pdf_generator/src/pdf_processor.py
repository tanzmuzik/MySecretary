"""
QRコード配置PDF生成 - PDF処理モジュール
テンプレートPDFへのQRコード画像配置とテキスト追記を処理
"""

import os
import sys
import platform
from pathlib import Path
from typing import List, Tuple, Optional
from PyPDF2 import PdfWriter, PdfReader
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image
import io


def find_japanese_font() -> str:
    """
    システムで利用可能な日本語フォントを自動検出

    Windows: Yu Gothic, Meiryo など
    macOS/Linux: Noto Sans CJK など

    Returns:
        フォント名またはデフォルトフォント
    """
    system = platform.system()

    # Windows の場合
    if system == "Windows":
        windows_fonts = [
            "C:\\Windows\\Fonts\\yugothic.ttf",      # Yu Gothic
            "C:\\Windows\\Fonts\\meiryo.ttc",        # Meiryo
            "C:\\Windows\\Fonts\\msmincho.ttc",      # MS 明朝
            "C:\\Windows\\Fonts\\msgothic.ttc",      # MS ゴシック
        ]

        for font_path in windows_fonts:
            if os.path.exists(font_path):
                try:
                    pdfmetrics.registerFont(TTFont('Japanese', font_path))
                    return 'Japanese'
                except Exception as e:
                    print(f"Warning: Failed to register font {font_path}: {e}")
                    continue

    # Linux/macOS の場合
    else:
        other_fonts = [
            '/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc',
            '/System/Library/Fonts/Hiragino Sans GB.ttc',  # macOS
            '/usr/share/fonts/truetype/noto/NotoSerifCJK-Regular.ttc',
        ]

        for font_path in other_fonts:
            if os.path.exists(font_path):
                try:
                    pdfmetrics.registerFont(TTFont('Japanese', font_path))
                    return 'Japanese'
                except Exception as e:
                    print(f"Warning: Failed to register font {font_path}: {e}")
                    continue

    # フォントが見つからない場合はデフォルト
    print("Warning: Japanese font not found. Using default font.")
    return 'Helvetica'


class SlotCoordinate:
    """スロット座標定義クラス"""
    # A4サイズ：210mm × 297mm
    # スロット配置：2行×5列

    # スロット座標（mm単位）
    # 各スロット：幅約40mm、高さ約40mm
    SLOTS = [
        # 1行目（Y: 約20-60mm）
        {"row": 1, "col": 1, "x": 20, "y": 240, "width": 40, "height": 40},   # slot 1
        {"row": 1, "col": 2, "x": 70, "y": 240, "width": 40, "height": 40},   # slot 2
        {"row": 1, "col": 3, "x": 120, "y": 240, "width": 40, "height": 40},  # slot 3
        {"row": 1, "col": 4, "x": 170, "y": 240, "width": 40, "height": 40},  # slot 4
        {"row": 1, "col": 5, "x": 220, "y": 240, "width": 40, "height": 40},  # slot 5

        # 2行目（Y: 約110-150mm）
        {"row": 2, "col": 1, "x": 20, "y": 170, "width": 40, "height": 40},   # slot 6
        {"row": 2, "col": 2, "x": 70, "y": 170, "width": 40, "height": 40},   # slot 7
        {"row": 2, "col": 3, "x": 120, "y": 170, "width": 40, "height": 40},  # slot 8
        {"row": 2, "col": 4, "x": 170, "y": 170, "width": 40, "height": 40},  # slot 9
        {"row": 2, "col": 5, "x": 220, "y": 170, "width": 40, "height": 40},  # slot 10
    ]

    QRCODE_SIZE = 30  # QRコード画像サイズ（mm）
    TEXT_BELOW_MARGIN = 8  # QRコードの下にテキストを配置するためのマージン


class PDFProcessor:
    """PDF処理クラス"""

    def __init__(self, template_pdf_path: str):
        """
        Args:
            template_pdf_path: テンプレートPDFのパス
        """
        self.template_pdf_path = template_pdf_path
        self._verify_template_exists()

    def _verify_template_exists(self):
        """テンプレートPDFが存在するか確認"""
        if not os.path.exists(self.template_pdf_path):
            raise FileNotFoundError(f"Template PDF not found: {self.template_pdf_path}")
        if not self.template_pdf_path.lower().endswith('.pdf'):
            raise ValueError(f"Invalid file format. PDF required: {self.template_pdf_path}")

    def create_output_pdf(
        self,
        qr_images: List[str],
        room_numbers: List[str],
        output_path: str
    ) -> None:
        """
        QRコードと部屋番号をテンプレートPDFに配置して出力

        Args:
            qr_images: QRコード画像ファイルのパスリスト
            room_numbers: 部屋番号のリスト
            output_path: 出力PDFのパス
        """
        if len(qr_images) != len(room_numbers):
            raise ValueError("QR images and room numbers count mismatch")

        if len(qr_images) > 10:
            raise ValueError("Maximum 10 QR codes per page (2 rows × 5 columns)")

        # テンプレートPDFを読み込み
        reader = PdfReader(self.template_pdf_path)
        page = reader.pages[0]
        page_width = float(page.mediabox.width)
        page_height = float(page.mediabox.height)

        # QRコードと部屋番号を配置したPDFを作成
        overlay_pdf = self._create_overlay_pdf(qr_images, room_numbers, page_width, page_height)

        # テンプレートにオーバーレイを合成
        overlay_reader = PdfReader(overlay_pdf)
        overlay_page = overlay_reader.pages[0]
        page.merge_page(overlay_page)

        # 出力
        writer = PdfWriter()
        writer.add_page(page)
        with open(output_path, 'wb') as f:
            writer.write(f)

    def _create_overlay_pdf(
        self,
        qr_images: List[str],
        room_numbers: List[str],
        page_width: float,
        page_height: float
    ) -> io.BytesIO:
        """
        QRコードと部屋番号を配置したオーバーレイPDFを作成

        Args:
            qr_images: QRコード画像ファイルのパスリスト
            room_numbers: 部屋番号のリスト
            page_width: ページ幅（ポイント）
            page_height: ページ高さ（ポイント）

        Returns:
            BytesIOバッファ（PDF形式）
        """
        pdf_buffer = io.BytesIO()
        c = canvas.Canvas(pdf_buffer, pagesize=(page_width, page_height))

        # 日本語フォントを自動検出して登録
        font_name = find_japanese_font()

        # 各スロットにQRコードと部屋番号を配置
        for idx, (qr_image_path, room_number) in enumerate(zip(qr_images, room_numbers)):
            if idx >= 10:
                break

            slot = SlotCoordinate.SLOTS[idx]

            # QRコード画像を配置
            x_mm = slot['x']
            y_mm = slot['y']

            # mm をポイント（72 DPI）に変換
            x_pt = x_mm * 72 / 25.4
            y_pt = y_mm * 72 / 25.4
            qr_size_pt = SlotCoordinate.QRCODE_SIZE * 72 / 25.4

            # 画像の Y座標は PDF座標系（下から上）に調整
            y_pdf = page_height - y_pt - qr_size_pt

            # QRコード画像を描画
            try:
                c.drawImage(
                    qr_image_path,
                    x_pt,
                    y_pdf,
                    width=qr_size_pt,
                    height=qr_size_pt,
                    preserveAspectRatio=True
                )
            except Exception as e:
                print(f"Warning: Failed to load QR image {qr_image_path}: {e}")
                continue

            # 部屋番号をテキストで追記
            text_y_mm = y_mm - SlotCoordinate.TEXT_BELOW_MARGIN
            text_y_pt = text_y_mm * 72 / 25.4
            text_y_pdf = page_height - text_y_pt
            text_x_pt = x_pt + qr_size_pt / 2  # 中央配置

            c.setFont(font_name, 12)
            c.drawCentredString(text_x_pt, text_y_pdf, str(room_number))

        c.save()
        pdf_buffer.seek(0)
        return pdf_buffer


def split_rooms_into_batches(start_room: int, end_room: int, batch_size: int = 10) -> List[Tuple[int, int]]:
    """
    部屋番号をバッチに分割

    Args:
        start_room: 開始部屋番号
        end_room: 終了部屋番号
        batch_size: バッチあたりの件数（デフォルト10）

    Returns:
        (開始番号, 終了番号) のタプルリスト
    """
    batches = []
    current = start_room

    while current <= end_room:
        batch_end = min(current + batch_size - 1, end_room)
        batches.append((current, batch_end))
        current = batch_end + 1

    return batches
