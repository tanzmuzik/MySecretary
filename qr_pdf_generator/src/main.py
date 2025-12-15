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
import queue


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

        # 3. 出力フォルダ選択
        output_frame = ttk.LabelFrame(main_frame, text="3. 出力フォルダ", padding=10)
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
        """テンプレートPDF選択ダイアログ（バックグラウンドスレッド）"""
        self.template_label.config(text="読み込み中...", foreground="blue")
        self.root.update()

        def thread_func():
            path = filedialog.askopenfilename(
                title="テンプレートPDFを選択",
                filetypes=[("PDF files", "*.pdf"), ("All files", "*.*")]
            )
            self.root.after(0, lambda: self._update_template_label(path))

        thread = threading.Thread(target=thread_func, daemon=True)
        thread.start()

    def _update_template_label(self, path: Optional[str]):
        """テンプレートPDFラベルを更新"""
        if path:
            self.template_pdf_path = path
            filename = os.path.basename(path)
            self.template_label.config(text=filename, foreground="black")
        else:
            self.template_label.config(text="選択されていません", foreground="gray")

    def _select_qr_folder(self):
        """QRコードフォルダ選択ダイアログ（バックグラウンドスレッド）"""
        self.qr_label.config(text="読み込み中...", foreground="blue")
        self.root.update()

        def thread_func():
            path = filedialog.askdirectory(title="QRコードフォルダを選択")
            self.root.after(0, lambda: self._update_qr_label(path))

        thread = threading.Thread(target=thread_func, daemon=True)
        thread.start()

    def _update_qr_label(self, path: Optional[str]):
        """QRコードラベルを更新"""
        if path:
            self.qr_folder_path = path
            foldername = os.path.basename(path)
            self.qr_label.config(text=foldername, foreground="black")
        else:
            self.qr_label.config(text="選択されていません", foreground="gray")

    def _select_output_folder(self):
        """出力フォルダ選択ダイアログ（バックグラウンドスレッド）"""
        self.output_label.config(text="読み込み中...", foreground="blue")
        self.root.update()

        def thread_func():
            path = filedialog.askdirectory(title="出力フォルダを選択")
            self.root.after(0, lambda: self._update_output_label(path))

        thread = threading.Thread(target=thread_func, daemon=True)
        thread.start()

    def _update_output_label(self, path: Optional[str]):
        """出力フォルダラベルを更新"""
        if path:
            self.output_folder_path = path
            foldername = os.path.basename(path)
            self.output_label.config(text=foldername, foreground="black")
        else:
            self.output_label.config(text="選択されていません", foreground="gray")

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
            # 必要な時だけモジュールをインポート（遅延ロード）
            from pdf_processor import PDFProcessor, auto_detect_qr_images, split_into_batches

            # PDFプロセッサを初期化
            processor = PDFProcessor(self.template_pdf_path)

            # QRコード画像を自動検出
            all_qr_images, all_room_numbers = auto_detect_qr_images(self.qr_folder_path)

            # QRコード画像をバッチに分割
            qr_batches = split_into_batches(list(zip(all_qr_images, all_room_numbers)), batch_size=10)

            # 各バッチごとにPDFを生成
            for batch_idx, qr_pairs in enumerate(qr_batches, 1):
                qr_images = [pair[0] for pair in qr_pairs]
                room_numbers = [pair[1] for pair in qr_pairs]

                # PDFを出力
                output_filename = f"output_{batch_idx}.pdf"
                output_path = os.path.join(self.output_folder_path, output_filename)

                processor.create_output_pdf(qr_images, room_numbers, output_path)

                # ステータス更新
                progress_msg = f"処理中... {batch_idx}/{len(qr_batches)}"
                self.root.after(0, lambda msg=progress_msg: self.status_var.set(msg))

            # 成功メッセージ
            success_msg = f"完了！ {len(qr_batches)}個のPDFファイルを生成しました"
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
