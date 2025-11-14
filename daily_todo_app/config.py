"""
アプリケーション設定管理
"""
import os
import json
from typing import Optional


class Config:
    """アプリケーション設定"""

    def __init__(self):
        self.config_file = os.path.join(os.path.dirname(__file__), "config.json")
        self.settings = self._load_settings()

    def _load_settings(self) -> dict:
        """設定ファイルから読み込み"""
        default_settings = {
            "notion_token": "",
            "auto_update_interval": 5,  # 分
            "always_on_top": False,
            "theme": "dark",  # "dark" or "light"
            "window_width": 700,
            "window_height": 500,
            "transparency": 100  # 50-100%
        }

        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                    default_settings.update(loaded)
            except Exception as e:
                print(f"設定ファイルの読み込みエラー: {e}")

        return default_settings

    def save_settings(self) -> None:
        """設定をファイルに保存"""
        try:
            with open(self.config_file, "w", encoding="utf-8") as f:
                json.dump(self.settings, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"設定ファイルの保存エラー: {e}")

    def get(self, key: str, default=None):
        """設定値を取得"""
        return self.settings.get(key, default)

    def set(self, key: str, value) -> None:
        """設定値を更新して保存"""
        self.settings[key] = value
        self.save_settings()

    @property
    def notion_token(self) -> str:
        """Notion Token を取得"""
        # 環境変数から取得（優先）
        token = os.getenv("NOTION_TOKEN")
        if token:
            return token
        # 設定ファイルから取得
        return self.settings.get("notion_token", "")

    @notion_token.setter
    def notion_token(self, value: str) -> None:
        """Notion Token を保存"""
        self.set("notion_token", value)

    @property
    def auto_update_interval(self) -> int:
        """自動更新間隔（分）"""
        return self.settings.get("auto_update_interval", 5)

    @auto_update_interval.setter
    def auto_update_interval(self, value: int) -> None:
        """自動更新間隔を設定"""
        self.set("auto_update_interval", max(1, min(30, value)))

    @property
    def always_on_top(self) -> bool:
        """常時最前面表示"""
        return self.settings.get("always_on_top", False)

    @always_on_top.setter
    def always_on_top(self, value: bool) -> None:
        """常時最前面表示を設定"""
        self.set("always_on_top", value)

    @property
    def theme(self) -> str:
        """テーマ"""
        return self.settings.get("theme", "dark")

    @theme.setter
    def theme(self, value: str) -> None:
        """テーマを設定"""
        if value in ["dark", "light"]:
            self.set("theme", value)

    @property
    def window_size(self) -> tuple[int, int]:
        """ウィンドウサイズ"""
        width = self.settings.get("window_width", 700)
        height = self.settings.get("window_height", 500)
        return width, height

    @window_size.setter
    def window_size(self, value: tuple[int, int]) -> None:
        """ウィンドウサイズを設定"""
        width, height = value
        self.settings["window_width"] = width
        self.settings["window_height"] = height
        self.save_settings()

    @property
    def transparency(self) -> int:
        """透明度（50-100%）"""
        return self.settings.get("transparency", 100)

    @transparency.setter
    def transparency(self, value: int) -> None:
        """透明度を設定"""
        self.set("transparency", max(50, min(100, value)))
