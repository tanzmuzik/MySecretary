"""
QRコード配置PDF生成アプリケーション
マンション入居者向けテンプレートPDFにQRコードを自動配置
"""

import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import os
import sys
from pathlib import Path
from typing import Optional, List
import threading

from pdf_processor import PDFProcessor, split_rooms_into_batches


class QRPDFGeneratorApp:
    """GUIアプリケーションメインクラス"""

    WINDOW_WIDTH = 600
    WINDOW_HEIGHT = 500
    PADDING = 10

    def __init__(self, root: tk.Tk):
        """
        Args:
            root: Tkinterルートウィンドウ
        """
        self.root = root
        self.root.title("QRコード配置 PDF 生成アプリ")
        self.root.geometry(f"{self.WINDOW_WIDTH}x{self.WINDOW_HEIGHT}")
        self.root.resizable(False, False)

        # 状態管理
        self.template_pdf_path: Optional[str] = None
        self.qr_folder_path: Optional[str] = None
        self.output_folder_path: Optional[str] = None

        # UI構築
        self._create_widgets()

    def _create_widgets(self):
        """UIウィジェットを作成"""
        # メインフレーム
        main_frame = ttk.Frame(self.root, padding=self.PADDING)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # タイトル
        title = ttk.Label(
            main_frame,
            text="QRコード配置 PDF 生成アプリ",
            font=("Helvetica", 16, "bold")
        )
        title.pack(pady=(0, 20))

        # 1. テンプレートPDF選択
        template_frame = ttk.LabelFrame(main_frame, text="1. テンプレートPDF", padding=10)
        template_frame.pack(fill=tk.X, pady=10)

        self.template_label = ttk.Label(template_frame, text="選択されていません", foreground="gray")
        self.template_label.pack(side=tk.LEFT, fill=tk.X, expand=True)

        ttk.Button(
            template_frame,
            text="参照...",
            command=self._select_template_pdf
        ).pack(side=tk.RIGHT, padx=5)

        # 2. QRコードフォルダ選択
        qr_frame = ttk.LabelFrame(main_frame, text="2. QRコードフォルダ", padding=10)
        qr_frame.pack(fill=tk.X, pady=10)

        self.qr_label = ttk.Label(qr_frame, text="選択されていません", foreground="gray")
        self.qr_label.pack(side=tk.LEFT, fill=tk.X, expand=True)

        ttk.Button(
            qr_frame,
            text="参照...",
            command=self._select_qr_folder
        ).pack(side=tk.RIGHT, padx=5)

        # 3. 部屋番号指定
        room_frame = ttk.LabelFrame(main_frame, text="3. 部屋番号指定", padding=10)
        room_frame.pack(fill=tk.X, pady=10)

        range_inner_frame = ttk.Frame(room_frame)
        range_inner_frame.pack(fill=tk.X)

        ttk.Label(range_inner_frame, text="開始番号:").pack(side=tk.LEFT, padx=5)
        self.start_room_var = tk.StringVar(value="101")
        ttk.Entry(range_inner_frame, textvariable=self.start_room_var, width=10).pack(side=tk.LEFT, padx=5)

        ttk.Label(range_inner_frame, text="終了番号:").pack(side=tk.LEFT, padx=5)
        self.end_room_var = tk.StringVar(value="136")
        ttk.Entry(range_inner_frame, textvariable=self.end_room_var, width=10).pack(side=tk.LEFT, padx=5)

        # 4. 出力フォルダ選択
        output_frame = ttk.LabelFrame(main_frame, text="4. 出力フォルダ", padding=10)
        output_frame.pack(fill=tk.X, pady=10)

        self.output_label = ttk.Label(output_frame, text="選択されていません", foreground="gray")
        self.output_label.pack(side=tk.LEFT, fill=tk.X, expand=True)

        ttk.Button(
            output_frame,
            text="参照...",
            command=self._select_output_folder
        ).pack(side=tk.RIGHT, padx=5)

        # 5. 実行ボタン
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=20)

        self.execute_btn = ttk.Button(
            button_frame,
            text="実行",
            command=self._execute
        )
        self.execute_btn.pack(side=tk.LEFT, padx=5)

        # ステータス表示
        self.status_var = tk.StringVar(value="準備完了")
        status_label = ttk.Label(main_frame, textvariable=self.status_var, foreground="blue")
        status_label.pack(fill=tk.X, pady=10)

    def _select_template_pdf(self):
        """テンプレートPDF選択ダイアログ"""
        path = filedialog.askopenfilename(
            title="テンプレートPDFを選択",
            filetypes=[("PDF files", "*.pdf"), ("All files", "*.*")]
        )
        if path:
            self.template_pdf_path = path
            filename = os.path.basename(path)
            self.template_label.config(text=filename, foreground="black")

    def _select_qr_folder(self):
        """QRコードフォルダ選択ダイアログ"""
        path = filedialog.askdirectory(title="QRコードフォルダを選択")
        if path:
            self.qr_folder_path = path
            foldername = os.path.basename(path)
            self.qr_label.config(text=foldername, foreground="black")

    def _select_output_folder(self):
        """出力フォルダ選択ダイアログ"""
        path = filedialog.askdirectory(title="出力フォルダを選択")
        if path:
            self.output_folder_path = path
            foldername = os.path.basename(path)
            self.output_label.config(text=foldername, foreground="black")

    def _validate_inputs(self) -> bool:
        """入力値の検証"""
        if not self.template_pdf_path:
            messagebox.showerror("エラー", "テンプレートPDFを選択してください")
            return False

        if not self.qr_folder_path:
            messagebox.showerror("エラー", "QRコードフォルダを選択してください")
            return False

        if not self.output_folder_path:
            messagebox.showerror("エラー", "出力フォルダを選択してください")
            return False

        try:
            start_room = int(self.start_room_var.get())
            end_room = int(self.end_room_var.get())
            if start_room > end_room:
                messagebox.showerror("エラー", "開始番号は終了番号以下である必要があります")
                return False
            if (end_room - start_room + 1) > 1000:
                messagebox.showerror("エラー", "最大1000室までサポートしています")
                return False
        except ValueError:
            messagebox.showerror("エラー", "部屋番号は整数で入力してください")
            return False

        return True

    def _execute(self):
        """実行処理（スレッド内）"""
        if not self._validate_inputs():
            return

        # UIを無効化
        self.execute_btn.config(state=tk.DISABLED)
        self.status_var.set("処理中...")

        # スレッドで処理を実行
        thread = threading.Thread(target=self._execute_thread)
        thread.start()

    def _execute_thread(self):
        """実行処理（スレッド）"""
        try:
            start_room = int(self.start_room_var.get())
            end_room = int(self.end_room_var.get())

            # PDFプロセッサを初期化
            processor = PDFProcessor(self.template_pdf_path)

            # 部屋番号をバッチに分割
            batches = split_rooms_into_batches(start_room, end_room, batch_size=10)

            # 各バッチごとにPDFを生成
            for batch_idx, (batch_start, batch_end) in enumerate(batches, 1):
                # QRコード画像と部屋番号を取得
                qr_images = []
                room_numbers = []

                for room_num in range(batch_start, batch_end + 1):
                    qr_filename = f"qr_{room_num}.png"
                    qr_path = os.path.join(self.qr_folder_path, qr_filename)

                    if not os.path.exists(qr_path):
                        raise FileNotFoundError(f"QR code image not found: {qr_filename}")

                    qr_images.append(qr_path)
                    room_numbers.append(str(room_num))

                # PDFを出力
                output_filename = f"output_{batch_idx}.pdf"
                output_path = os.path.join(self.output_folder_path, output_filename)

                processor.create_output_pdf(qr_images, room_numbers, output_path)

                # ステータス更新
                progress_msg = f"処理中... {batch_idx}/{len(batches)}"
                self.root.after(0, lambda msg=progress_msg: self.status_var.set(msg))

            # 成功メッセージ
            success_msg = f"完了！ {len(batches)}個のPDFファイルを生成しました"
            self.root.after(
                0,
                lambda msg=success_msg: (
                    messagebox.showinfo("成功", msg),
                    self.status_var.set("完了！")
                )
            )

        except FileNotFoundError as e:
            self.root.after(
                0,
                lambda err=str(e): (
                    messagebox.showerror("ファイルエラー", f"ファイルが見つかりません\n{err}"),
                    self.status_var.set("エラーが発生しました")
                )
            )
        except ValueError as e:
            self.root.after(
                0,
                lambda err=str(e): (
                    messagebox.showerror("入力エラー", f"入力値が無効です\n{err}"),
                    self.status_var.set("エラーが発生しました")
                )
            )
        except Exception as e:
            self.root.after(
                0,
                lambda err=str(e): (
                    messagebox.showerror("予期しないエラー", f"エラーが発生しました\n{err}"),
                    self.status_var.set("エラーが発生しました")
                )
            )
        finally:
            # UIを有効化
            self.root.after(0, lambda: self.execute_btn.config(state=tk.NORMAL))


def main():
    """メイン関数"""
    root = tk.Tk()
    app = QRPDFGeneratorApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
