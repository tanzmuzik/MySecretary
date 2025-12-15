"""
QRコード配置PDF生成アプリケーション
マンション入居者向けテンプレートPDFにQRコードを自動配置
"""

import wx
import os
import threading
from pathlib import Path
from typing import Optional


class QRPDFGeneratorFrame(wx.Frame):
    """wxPython ベースの GUI アプリケーション"""

    def __init__(self):
        super().__init__(None, title="QRコード配置 PDF 生成アプリ", size=(600, 500))

        # ウィンドウの中央配置
        self.Centre()

        # 状態管理
        self.template_pdf_path: Optional[str] = None
        self.qr_folder_path: Optional[str] = None
        self.output_folder_path: Optional[str] = None

        # UI構築
        self._create_widgets()

    def _create_widgets(self):
        """UIウィジェットを作成"""
        panel = wx.Panel(self)
        sizer = wx.BoxSizer(wx.VERTICAL)

        # タイトル
        title = wx.StaticText(panel, label="QRコード配置 PDF 生成アプリ")
        font = title.GetFont()
        font.PointSize += 4
        font = font.Bold()
        title.SetFont(font)
        sizer.Add(title, 0, wx.ALL | wx.CENTER, 20)

        # 1. テンプレートPDF選択
        template_box = wx.StaticBoxSizer(wx.VERTICAL, panel, "1. テンプレートPDF")
        template_sizer = wx.BoxSizer(wx.HORIZONTAL)
        self.template_label = wx.StaticText(panel, label="選択されていません")
        self.template_label.SetForegroundColour(wx.Colour(128, 128, 128))
        template_sizer.Add(self.template_label, 1, wx.ALIGN_CENTER_VERTICAL | wx.ALL, 5)
        template_btn = wx.Button(panel, label="参照...")
        template_btn.Bind(wx.EVT_BUTTON, self._on_select_template_pdf)
        template_sizer.Add(template_btn, 0, wx.ALL, 5)
        template_box.Add(template_sizer, 1, wx.EXPAND)
        sizer.Add(template_box, 0, wx.EXPAND | wx.ALL, 10)

        # 2. QRコードフォルダ選択
        qr_box = wx.StaticBoxSizer(wx.VERTICAL, panel, "2. QRコードフォルダ")
        qr_sizer = wx.BoxSizer(wx.HORIZONTAL)
        self.qr_label = wx.StaticText(panel, label="選択されていません")
        self.qr_label.SetForegroundColour(wx.Colour(128, 128, 128))
        qr_sizer.Add(self.qr_label, 1, wx.ALIGN_CENTER_VERTICAL | wx.ALL, 5)
        qr_btn = wx.Button(panel, label="参照...")
        qr_btn.Bind(wx.EVT_BUTTON, self._on_select_qr_folder)
        qr_sizer.Add(qr_btn, 0, wx.ALL, 5)
        qr_box.Add(qr_sizer, 1, wx.EXPAND)
        sizer.Add(qr_box, 0, wx.EXPAND | wx.ALL, 10)

        # 3. 出力フォルダ選択
        output_box = wx.StaticBoxSizer(wx.VERTICAL, panel, "3. 出力フォルダ")
        output_sizer = wx.BoxSizer(wx.HORIZONTAL)
        self.output_label = wx.StaticText(panel, label="選択されていません")
        self.output_label.SetForegroundColour(wx.Colour(128, 128, 128))
        output_sizer.Add(self.output_label, 1, wx.ALIGN_CENTER_VERTICAL | wx.ALL, 5)
        output_btn = wx.Button(panel, label="参照...")
        output_btn.Bind(wx.EVT_BUTTON, self._on_select_output_folder)
        output_sizer.Add(output_btn, 0, wx.ALL, 5)
        output_box.Add(output_sizer, 1, wx.EXPAND)
        sizer.Add(output_box, 0, wx.EXPAND | wx.ALL, 10)

        # 実行ボタン
        button_sizer = wx.BoxSizer(wx.HORIZONTAL)
        self.execute_btn = wx.Button(panel, label="実行")
        self.execute_btn.Bind(wx.EVT_BUTTON, self._on_execute)
        button_sizer.Add(self.execute_btn, 0, wx.ALL, 5)
        sizer.Add(button_sizer, 0, wx.EXPAND | wx.ALL, 10)

        # ステータス表示
        self.status_text = wx.StaticText(panel, label="準備完了")
        self.status_text.SetForegroundColour(wx.Colour(0, 0, 255))
        sizer.Add(self.status_text, 0, wx.EXPAND | wx.ALL, 10)

        panel.SetSizer(sizer)

    def _on_select_template_pdf(self, event):
        """テンプレートPDF選択ダイアログ"""
        dlg = wx.FileDialog(
            self,
            "テンプレートPDFを選択",
            wildcard="PDF files (*.pdf)|*.pdf|All files (*.*)|*.*",
            style=wx.FD_OPEN | wx.FD_FILE_MUST_EXIST
        )

        if dlg.ShowModal() == wx.ID_OK:
            self.template_pdf_path = dlg.GetPath()
            filename = os.path.basename(self.template_pdf_path)
            self.template_label.SetLabel(filename)
            self.template_label.SetForegroundColour(wx.BLACK)
        dlg.Destroy()

    def _on_select_qr_folder(self, event):
        """QRコードフォルダ選択ダイアログ"""
        dlg = wx.DirDialog(
            self,
            "QRコードフォルダを選択",
            style=wx.DD_DEFAULT_STYLE
        )

        if dlg.ShowModal() == wx.ID_OK:
            self.qr_folder_path = dlg.GetPath()
            foldername = os.path.basename(self.qr_folder_path)
            self.qr_label.SetLabel(foldername)
            self.qr_label.SetForegroundColour(wx.BLACK)
        dlg.Destroy()

    def _on_select_output_folder(self, event):
        """出力フォルダ選択ダイアログ"""
        dlg = wx.DirDialog(
            self,
            "出力フォルダを選択",
            style=wx.DD_DEFAULT_STYLE
        )

        if dlg.ShowModal() == wx.ID_OK:
            self.output_folder_path = dlg.GetPath()
            foldername = os.path.basename(self.output_folder_path)
            self.output_label.SetLabel(foldername)
            self.output_label.SetForegroundColour(wx.BLACK)
        dlg.Destroy()

    def _validate_inputs(self) -> bool:
        """入力値の検証"""
        if not self.template_pdf_path:
            wx.MessageBox("テンプレートPDFを選択してください", "エラー", wx.OK | wx.ICON_ERROR)
            return False

        if not self.qr_folder_path:
            wx.MessageBox("QRコードフォルダを選択してください", "エラー", wx.OK | wx.ICON_ERROR)
            return False

        if not self.output_folder_path:
            wx.MessageBox("出力フォルダを選択してください", "エラー", wx.OK | wx.ICON_ERROR)
            return False

        return True

    def _on_execute(self, event):
        """実行処理"""
        if not self._validate_inputs():
            return

        # UIを無効化
        self.execute_btn.Enable(False)
        self.status_text.SetLabel("処理中...")

        # スレッドで処理を実行
        thread = threading.Thread(target=self._execute_thread)
        thread.daemon = True
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
                wx.CallAfter(self.status_text.SetLabel, progress_msg)

            # 成功メッセージ
            success_msg = f"完了！ {len(qr_batches)}個のPDFファイルを生成しました"
            wx.CallAfter(self._show_success, success_msg)

        except FileNotFoundError as e:
            wx.CallAfter(self._show_error, "ファイルエラー", f"ファイルが見つかりません\n{str(e)}")
        except ValueError as e:
            wx.CallAfter(self._show_error, "入力エラー", f"入力値が無効です\n{str(e)}")
        except Exception as e:
            wx.CallAfter(self._show_error, "予期しないエラー", f"エラーが発生しました\n{str(e)}")
        finally:
            # UIを有効化
            wx.CallAfter(self.execute_btn.Enable, True)

    def _show_success(self, message: str):
        """成功メッセージを表示"""
        wx.MessageBox(message, "成功", wx.OK | wx.ICON_INFORMATION)
        self.status_text.SetLabel("完了！")

    def _show_error(self, title: str, message: str):
        """エラーメッセージを表示"""
        wx.MessageBox(message, title, wx.OK | wx.ICON_ERROR)
        self.status_text.SetLabel("エラーが発生しました")


class QRPDFGeneratorApp(wx.App):
    """wxPython アプリケーション"""

    def OnInit(self):
        self.frame = QRPDFGeneratorFrame()
        self.frame.Show()
        return True


def main():
    """メイン関数"""
    app = QRPDFGeneratorApp()
    app.MainLoop()


if __name__ == "__main__":
    main()
