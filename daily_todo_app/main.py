"""
Daily TODO Desktop App for Windows 11
メインアプリケーション
"""
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import threading
from datetime import datetime
from typing import Optional, List

from notion_client import NotionClient, Task, load_token_from_env
from config import Config
from ui_components import TaskCard, SettingsDialog, ThemeManager


class DailyTodoApp:
    """Daily TODO デスクトップアプリケーション"""

    def __init__(self, root: tk.Tk):
        self.root = root
        self.config = Config()
        self.theme_manager = ThemeManager(self.config.theme)
        self.notion_client: Optional[NotionClient] = None
        self.tasks: List[Task] = []
        self.last_update: Optional[datetime] = None
        self.auto_update_timer: Optional[str] = None

        self._setup_window()
        self._create_ui()
        self._initialize_notion_client()

        # 初回データ取得
        self.refresh_tasks()

        # 自動更新開始
        self._start_auto_update()

    def _setup_window(self):
        """ウィンドウの基本設定"""
        self.root.title("Daily TODO - Notion")

        # ウィンドウサイズ
        width, height = self.config.window_size
        self.root.geometry(f"{width}x{height}")

        # 常時最前面
        if self.config.always_on_top:
            self.root.attributes("-topmost", True)

        # 透明度
        transparency = self.config.transparency / 100.0
        self.root.attributes("-alpha", transparency)

        # テーマカラー適用
        bg_color = self.theme_manager.get_color("bg")
        self.root.configure(bg=bg_color)

        # 閉じる時の処理
        self.root.protocol("WM_DELETE_WINDOW", self._on_closing)

    def _create_ui(self):
        """UI コンポーネントの作成"""
        # ヘッダーフレーム
        self._create_header()

        # メインコンテンツエリア（タスクリスト）
        self._create_task_list()

        # フッターフレーム
        self._create_footer()

    def _create_header(self):
        """ヘッダーの作成"""
        header_frame = tk.Frame(
            self.root,
            bg=self.theme_manager.get_color("header_bg"),
            height=60
        )
        header_frame.pack(fill=tk.X, padx=0, pady=0)
        header_frame.pack_propagate(False)

        # タイトル
        title_label = tk.Label(
            header_frame,
            text="📋 Daily TODO",
            font=("Segoe UI", 18, "bold"),
            bg=self.theme_manager.get_color("header_bg"),
            fg=self.theme_manager.get_color("fg")
        )
        title_label.pack(side=tk.LEFT, padx=20, pady=15)

        # 最終更新時刻
        self.last_update_label = tk.Label(
            header_frame,
            text="最終更新: --:--",
            font=("Segoe UI", 10),
            bg=self.theme_manager.get_color("header_bg"),
            fg=self.theme_manager.get_color("fg_secondary")
        )
        self.last_update_label.pack(side=tk.RIGHT, padx=20, pady=15)

    def _create_task_list(self):
        """タスクリストの作成"""
        # スクロール可能なキャンバス
        canvas_frame = tk.Frame(self.root, bg=self.theme_manager.get_color("bg"))
        canvas_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # キャンバスとスクロールバー
        self.canvas = tk.Canvas(
            canvas_frame,
            bg=self.theme_manager.get_color("bg"),
            highlightthickness=0
        )
        scrollbar = ttk.Scrollbar(
            canvas_frame,
            orient=tk.VERTICAL,
            command=self.canvas.yview
        )

        self.scrollable_frame = tk.Frame(
            self.canvas,
            bg=self.theme_manager.get_color("bg")
        )

        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )

        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=scrollbar.set)

        self.canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        # マウスホイールでスクロール
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)

    def _create_footer(self):
        """フッターの作成"""
        footer_frame = tk.Frame(
            self.root,
            bg=self.theme_manager.get_color("footer_bg"),
            height=50
        )
        footer_frame.pack(fill=tk.X, padx=0, pady=0)
        footer_frame.pack_propagate(False)

        # 更新ボタン
        refresh_btn = tk.Button(
            footer_frame,
            text="🔄 更新",
            font=("Segoe UI", 11),
            bg=self.theme_manager.get_color("button_bg"),
            fg=self.theme_manager.get_color("button_fg"),
            activebackground=self.theme_manager.get_color("button_active"),
            relief=tk.FLAT,
            padx=20,
            pady=8,
            cursor="hand2",
            command=self.refresh_tasks
        )
        refresh_btn.pack(side=tk.LEFT, padx=15, pady=10)

        # 設定ボタン
        settings_btn = tk.Button(
            footer_frame,
            text="⚙️ 設定",
            font=("Segoe UI", 11),
            bg=self.theme_manager.get_color("button_bg"),
            fg=self.theme_manager.get_color("button_fg"),
            activebackground=self.theme_manager.get_color("button_active"),
            relief=tk.FLAT,
            padx=20,
            pady=8,
            cursor="hand2",
            command=self._open_settings
        )
        settings_btn.pack(side=tk.LEFT, padx=5, pady=10)

    def _initialize_notion_client(self):
        """Notion クライアントの初期化"""
        token = self.config.notion_token or load_token_from_env()

        if token:
            self.notion_client = NotionClient(token)
        else:
            # トークンが無い場合は設定画面を開く
            messagebox.showwarning(
                "設定が必要",
                "Notion Integration Token が設定されていません。\n設定画面から入力してください。"
            )
            self._open_settings()

    def refresh_tasks(self):
        """タスクを更新"""
        if not self.notion_client:
            messagebox.showerror("エラー", "Notion Token が設定されていません")
            return

        # バックグラウンドで取得
        threading.Thread(target=self._fetch_tasks, daemon=True).start()

    def _fetch_tasks(self):
        """バックグラウンドでタスクを取得"""
        tasks, error = self.notion_client.get_tasks()

        # UI 更新はメインスレッドで
        self.root.after(0, lambda: self._update_ui_with_tasks(tasks, error))

    def _update_ui_with_tasks(self, tasks: List[Task], error: Optional[str]):
        """タスクで UI を更新"""
        if error:
            messagebox.showerror("取得エラー", error)
            return

        self.tasks = tasks
        self.last_update = datetime.now()

        # 最終更新時刻を更新
        time_str = self.last_update.strftime("%H:%M")
        self.last_update_label.config(text=f"最終更新: {time_str}")

        # タスクカードを再生成
        self._render_task_cards()

    def _render_task_cards(self):
        """タスクカードを描画"""
        # 既存のウィジェットをクリア
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()

        if not self.tasks:
            # タスクが無い場合
            no_task_label = tk.Label(
                self.scrollable_frame,
                text="タスクがありません",
                font=("Segoe UI", 14),
                bg=self.theme_manager.get_color("bg"),
                fg=self.theme_manager.get_color("fg_secondary"),
                pady=50
            )
            no_task_label.pack()
            return

        # タスクカードを生成
        for task in self.tasks:
            card = TaskCard(self.scrollable_frame, task, self.theme_manager)
            card.pack(fill=tk.X, padx=10, pady=5)

    def _open_settings(self):
        """設定画面を開く"""
        dialog = SettingsDialog(self.root, self.config, self.theme_manager)
        self.root.wait_window(dialog.dialog)

        # 設定が変更された場合、再初期化
        if dialog.settings_changed:
            self._apply_new_settings()

    def _apply_new_settings(self):
        """新しい設定を適用"""
        # Notion クライアント再初期化
        token = self.config.notion_token
        if token:
            self.notion_client = NotionClient(token)
            self.refresh_tasks()

        # ウィンドウ設定の更新
        if self.config.always_on_top:
            self.root.attributes("-topmost", True)
        else:
            self.root.attributes("-topmost", False)

        transparency = self.config.transparency / 100.0
        self.root.attributes("-alpha", transparency)

        # テーマ変更
        self.theme_manager.set_theme(self.config.theme)
        self._update_theme()

        # 自動更新の再起動
        self._start_auto_update()

    def _update_theme(self):
        """テーマを再適用"""
        # ウィンドウ全体を再描画
        for widget in self.root.winfo_children():
            widget.destroy()
        self._create_ui()
        self._render_task_cards()

    def _start_auto_update(self):
        """自動更新タイマーを開始"""
        # 既存のタイマーをキャンセル
        if self.auto_update_timer:
            self.root.after_cancel(self.auto_update_timer)

        # 新しいタイマーを設定
        interval_ms = self.config.auto_update_interval * 60 * 1000
        self.auto_update_timer = self.root.after(interval_ms, self._auto_update_callback)

    def _auto_update_callback(self):
        """自動更新のコールバック"""
        self.refresh_tasks()
        self._start_auto_update()  # 次回のタイマーを設定

    def _on_mousewheel(self, event):
        """マウスホイールでスクロール"""
        self.canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")

    def _on_closing(self):
        """アプリケーション終了時の処理"""
        # 自動更新タイマーをキャンセル
        if self.auto_update_timer:
            self.root.after_cancel(self.auto_update_timer)

        # ウィンドウサイズを保存
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        self.config.window_size = (width, height)

        self.root.destroy()


def main():
    """メイン関数"""
    root = tk.Tk()
    app = DailyTodoApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
