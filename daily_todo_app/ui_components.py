"""
UI コンポーネント
カスタム Tkinter ウィジェット
"""
import tkinter as tk
from tkinter import ttk
from typing import Dict

from notion_client import Task


class ThemeManager:
    """テーマ管理"""

    DARK_THEME = {
        "bg": "#1E1E1E",
        "fg": "#FFFFFF",
        "fg_secondary": "#B0B0B0",
        "header_bg": "#2D2D2D",
        "footer_bg": "#2D2D2D",
        "card_bg": "#2A2A2A",
        "card_border": "#404040",
        "button_bg": "#0078D4",
        "button_fg": "#FFFFFF",
        "button_active": "#106EBE",
        "input_bg": "#3C3C3C",
        "input_fg": "#FFFFFF"
    }

    LIGHT_THEME = {
        "bg": "#F5F5F5",
        "fg": "#000000",
        "fg_secondary": "#666666",
        "header_bg": "#FFFFFF",
        "footer_bg": "#FFFFFF",
        "card_bg": "#FFFFFF",
        "card_border": "#E0E0E0",
        "button_bg": "#0078D4",
        "button_fg": "#FFFFFF",
        "button_active": "#106EBE",
        "input_bg": "#FFFFFF",
        "input_fg": "#000000"
    }

    def __init__(self, theme: str = "dark"):
        self.theme = theme
        self.colors = self.DARK_THEME if theme == "dark" else self.LIGHT_THEME

    def set_theme(self, theme: str):
        """テーマを変更"""
        self.theme = theme
        self.colors = self.DARK_THEME if theme == "dark" else self.LIGHT_THEME

    def get_color(self, key: str) -> str:
        """色を取得"""
        return self.colors.get(key, "#000000")


class TaskCard(tk.Frame):
    """タスクカード"""

    def __init__(self, parent, task: Task, theme_manager: ThemeManager):
        super().__init__(
            parent,
            bg=theme_manager.get_color("card_bg"),
            relief=tk.SOLID,
            borderwidth=1,
            highlightbackground=theme_manager.get_color("card_border"),
            highlightthickness=1
        )

        self.task = task
        self.theme_manager = theme_manager

        self._create_card()

    def _create_card(self):
        """カードの内容を作成"""
        # 左側：優先度インジケーター
        priority_indicator = tk.Frame(
            self,
            bg=self.task.priority_color,
            width=5
        )
        priority_indicator.pack(side=tk.LEFT, fill=tk.Y)

        # メインコンテンツエリア
        content_frame = tk.Frame(self, bg=self.task.status_color)
        content_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)

        # タスク名
        name_label = tk.Label(
            content_frame,
            text=self.task.name,
            font=("Segoe UI", 12, "bold"),
            bg=self.task.status_color,
            fg=self.theme_manager.get_color("fg"),
            anchor="w",
            justify=tk.LEFT
        )
        name_label.pack(fill=tk.X)

        # バッジ行
        badge_frame = tk.Frame(content_frame, bg=self.task.status_color)
        badge_frame.pack(fill=tk.X, pady=(5, 0))

        # 優先度バッジ
        if self.task.priority:
            priority_badge = tk.Label(
                badge_frame,
                text=f"優先度: {self.task.priority}",
                font=("Segoe UI", 9),
                bg=self.task.priority_color,
                fg="#FFFFFF",
                padx=8,
                pady=2,
                relief=tk.FLAT
            )
            priority_badge.pack(side=tk.LEFT, padx=(0, 5))

        # ステータスバッジ
        if self.task.status:
            status_badge = tk.Label(
                badge_frame,
                text=self.task.status,
                font=("Segoe UI", 9),
                bg=self._get_status_badge_color(),
                fg="#FFFFFF",
                padx=8,
                pady=2,
                relief=tk.FLAT
            )
            status_badge.pack(side=tk.LEFT, padx=(0, 5))

        # 種類
        if self.task.category:
            category_label = tk.Label(
                badge_frame,
                text=f"📁 {self.task.category}",
                font=("Segoe UI", 9),
                bg=self.task.status_color,
                fg=self.theme_manager.get_color("fg_secondary")
            )
            category_label.pack(side=tk.LEFT)

    def _get_status_badge_color(self) -> str:
        """ステータスバッジの色を取得"""
        status_colors = {
            "未着手": "#757575",
            "進行中": "#2196F3",
            "完了": "#4CAF50",
            "保留": "#FF9800"
        }
        return status_colors.get(self.task.status, "#999999")


class SettingsDialog:
    """設定ダイアログ"""

    def __init__(self, parent, config, theme_manager: ThemeManager):
        self.parent = parent
        self.config = config
        self.theme_manager = theme_manager
        self.settings_changed = False

        self._create_dialog()

    def _create_dialog(self):
        """ダイアログを作成"""
        self.dialog = tk.Toplevel(self.parent)
        self.dialog.title("設定")
        self.dialog.geometry("500x400")
        self.dialog.resizable(False, False)
        self.dialog.configure(bg=self.theme_manager.get_color("bg"))

        # モーダルにする
        self.dialog.transient(self.parent)
        self.dialog.grab_set()

        # コンテンツフレーム
        content_frame = tk.Frame(
            self.dialog,
            bg=self.theme_manager.get_color("bg")
        )
        content_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)

        # Notion Token
        self._create_token_section(content_frame)

        # 自動更新間隔
        self._create_auto_update_section(content_frame)

        # 常時最前面
        self._create_always_on_top_section(content_frame)

        # テーマ選択
        self._create_theme_section(content_frame)

        # 透明度
        self._create_transparency_section(content_frame)

        # ボタン
        self._create_buttons(content_frame)

    def _create_token_section(self, parent):
        """Notion Token 入力セクション"""
        label = tk.Label(
            parent,
            text="Notion Integration Token:",
            font=("Segoe UI", 10),
            bg=self.theme_manager.get_color("bg"),
            fg=self.theme_manager.get_color("fg")
        )
        label.pack(anchor="w", pady=(0, 5))

        self.token_entry = tk.Entry(
            parent,
            font=("Segoe UI", 10),
            bg=self.theme_manager.get_color("input_bg"),
            fg=self.theme_manager.get_color("input_fg"),
            insertbackground=self.theme_manager.get_color("fg"),
            show="*"
        )
        self.token_entry.pack(fill=tk.X, pady=(0, 15))
        self.token_entry.insert(0, self.config.notion_token)

    def _create_auto_update_section(self, parent):
        """自動更新間隔セクション"""
        label = tk.Label(
            parent,
            text="自動更新間隔（分）:",
            font=("Segoe UI", 10),
            bg=self.theme_manager.get_color("bg"),
            fg=self.theme_manager.get_color("fg")
        )
        label.pack(anchor="w", pady=(0, 5))

        self.interval_var = tk.IntVar(value=self.config.auto_update_interval)
        interval_spinbox = tk.Spinbox(
            parent,
            from_=1,
            to=30,
            textvariable=self.interval_var,
            font=("Segoe UI", 10),
            bg=self.theme_manager.get_color("input_bg"),
            fg=self.theme_manager.get_color("input_fg")
        )
        interval_spinbox.pack(fill=tk.X, pady=(0, 15))

    def _create_always_on_top_section(self, parent):
        """常時最前面セクション"""
        self.always_on_top_var = tk.BooleanVar(value=self.config.always_on_top)
        checkbox = tk.Checkbutton(
            parent,
            text="常時最前面に表示",
            variable=self.always_on_top_var,
            font=("Segoe UI", 10),
            bg=self.theme_manager.get_color("bg"),
            fg=self.theme_manager.get_color("fg"),
            selectcolor=self.theme_manager.get_color("input_bg"),
            activebackground=self.theme_manager.get_color("bg"),
            activeforeground=self.theme_manager.get_color("fg")
        )
        checkbox.pack(anchor="w", pady=(0, 15))

    def _create_theme_section(self, parent):
        """テーマ選択セクション"""
        label = tk.Label(
            parent,
            text="テーマ:",
            font=("Segoe UI", 10),
            bg=self.theme_manager.get_color("bg"),
            fg=self.theme_manager.get_color("fg")
        )
        label.pack(anchor="w", pady=(0, 5))

        self.theme_var = tk.StringVar(value=self.config.theme)
        theme_frame = tk.Frame(parent, bg=self.theme_manager.get_color("bg"))
        theme_frame.pack(fill=tk.X, pady=(0, 15))

        dark_radio = tk.Radiobutton(
            theme_frame,
            text="ダーク",
            variable=self.theme_var,
            value="dark",
            font=("Segoe UI", 10),
            bg=self.theme_manager.get_color("bg"),
            fg=self.theme_manager.get_color("fg"),
            selectcolor=self.theme_manager.get_color("input_bg"),
            activebackground=self.theme_manager.get_color("bg"),
            activeforeground=self.theme_manager.get_color("fg")
        )
        dark_radio.pack(side=tk.LEFT, padx=(0, 20))

        light_radio = tk.Radiobutton(
            theme_frame,
            text="ライト",
            variable=self.theme_var,
            value="light",
            font=("Segoe UI", 10),
            bg=self.theme_manager.get_color("bg"),
            fg=self.theme_manager.get_color("fg"),
            selectcolor=self.theme_manager.get_color("input_bg"),
            activebackground=self.theme_manager.get_color("bg"),
            activeforeground=self.theme_manager.get_color("fg")
        )
        light_radio.pack(side=tk.LEFT)

    def _create_transparency_section(self, parent):
        """透明度セクション"""
        label = tk.Label(
            parent,
            text=f"透明度: {self.config.transparency}%",
            font=("Segoe UI", 10),
            bg=self.theme_manager.get_color("bg"),
            fg=self.theme_manager.get_color("fg")
        )
        label.pack(anchor="w", pady=(0, 5))

        self.transparency_var = tk.IntVar(value=self.config.transparency)
        transparency_scale = tk.Scale(
            parent,
            from_=50,
            to=100,
            orient=tk.HORIZONTAL,
            variable=self.transparency_var,
            font=("Segoe UI", 9),
            bg=self.theme_manager.get_color("bg"),
            fg=self.theme_manager.get_color("fg"),
            highlightthickness=0,
            command=lambda v: label.config(text=f"透明度: {int(float(v))}%")
        )
        transparency_scale.pack(fill=tk.X, pady=(0, 15))

    def _create_buttons(self, parent):
        """ボタンの作成"""
        button_frame = tk.Frame(parent, bg=self.theme_manager.get_color("bg"))
        button_frame.pack(side=tk.BOTTOM, fill=tk.X, pady=(20, 0))

        save_btn = tk.Button(
            button_frame,
            text="保存",
            font=("Segoe UI", 10),
            bg=self.theme_manager.get_color("button_bg"),
            fg=self.theme_manager.get_color("button_fg"),
            activebackground=self.theme_manager.get_color("button_active"),
            relief=tk.FLAT,
            padx=20,
            pady=8,
            cursor="hand2",
            command=self._save_settings
        )
        save_btn.pack(side=tk.RIGHT, padx=(10, 0))

        cancel_btn = tk.Button(
            button_frame,
            text="キャンセル",
            font=("Segoe UI", 10),
            bg="#757575",
            fg="#FFFFFF",
            activebackground="#616161",
            relief=tk.FLAT,
            padx=20,
            pady=8,
            cursor="hand2",
            command=self.dialog.destroy
        )
        cancel_btn.pack(side=tk.RIGHT)

    def _save_settings(self):
        """設定を保存"""
        # Notion Token
        token = self.token_entry.get().strip()
        if token:
            self.config.notion_token = token

        # 自動更新間隔
        self.config.auto_update_interval = self.interval_var.get()

        # 常時最前面
        self.config.always_on_top = self.always_on_top_var.get()

        # テーマ
        self.config.theme = self.theme_var.get()

        # 透明度
        self.config.transparency = self.transparency_var.get()

        self.settings_changed = True
        self.dialog.destroy()
