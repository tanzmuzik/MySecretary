"""
Notion API クライアント
Daily TODO データベースからタスクを取得する
"""
import os
import requests
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime


@dataclass
class Task:
    """タスクのデータモデル"""
    name: str
    status: str  # "未着手", "進行中", "完了", "保留"
    priority: str  # "高", "中", "低"
    category: str  # 種類
    priority_color: str  # RGB色コード
    status_color: str  # RGB色コード


class NotionClient:
    """Notion API クライアント"""

    # データベース ID
    DATABASE_ID = "2ab1e478764780adb2a4e57d994788ea"

    # 優先度の色分け
    PRIORITY_COLORS = {
        "高": "#FF6B6B",
        "中": "#FFD93D",
        "低": "#6BCB77",
        "": "#CCCCCC"  # デフォルト
    }

    # ステータスの色分け
    STATUS_COLORS = {
        "未着手": "#E0E0E0",
        "進行中": "#B3E5FC",
        "完了": "#C8E6C9",
        "保留": "#FFE0B2",
        "": "#F5F5F5"  # デフォルト
    }

    def __init__(self, token: str):
        """
        初期化

        Args:
            token: Notion Integration Token
        """
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        self.base_url = "https://api.notion.com/v1"

    def get_tasks(self) -> tuple[List[Task], Optional[str]]:
        """
        Notion データベースからタスクを取得

        Returns:
            (タスクリスト, エラーメッセージ)
        """
        try:
            # データベースをクエリ
            url = f"{self.base_url}/databases/{self.DATABASE_ID}/query"
            response = requests.post(url, headers=self.headers, json={}, timeout=10)

            if response.status_code != 200:
                return [], f"Notion API エラー: {response.status_code} - {response.text}"

            data = response.json()
            tasks = self._parse_tasks(data)

            # 優先度順でソート（高 → 中 → 低）
            priority_order = {"高": 0, "中": 1, "低": 2, "": 3}
            tasks.sort(key=lambda t: priority_order.get(t.priority, 3))

            return tasks, None

        except requests.exceptions.Timeout:
            return [], "タイムアウト: Notion API への接続がタイムアウトしました"
        except requests.exceptions.ConnectionError:
            return [], "接続エラー: インターネット接続を確認してください"
        except Exception as e:
            return [], f"エラー: {str(e)}"

    def _parse_tasks(self, data: Dict) -> List[Task]:
        """
        Notion API のレスポンスをパース

        Args:
            data: Notion API のレスポンス

        Returns:
            タスクリスト
        """
        tasks = []

        for page in data.get("results", []):
            try:
                properties = page.get("properties", {})

                # タスク名（Title）
                name_prop = properties.get("名前", {})
                title_list = name_prop.get("title", [])
                name = title_list[0].get("plain_text", "無題") if title_list else "無題"

                # ステータス（Select）
                status_prop = properties.get("ステータス", {})
                status_select = status_prop.get("select")
                status = status_select.get("name", "") if status_select else ""

                # 優先度（Select）
                priority_prop = properties.get("優先度", {})
                priority_select = priority_prop.get("select")
                priority = priority_select.get("name", "") if priority_select else ""

                # 種類（Text）
                category_prop = properties.get("種類", {})
                category_text = category_prop.get("rich_text", [])
                category = category_text[0].get("plain_text", "") if category_text else ""

                # 色の取得
                priority_color = self.PRIORITY_COLORS.get(priority, self.PRIORITY_COLORS[""])
                status_color = self.STATUS_COLORS.get(status, self.STATUS_COLORS[""])

                task = Task(
                    name=name,
                    status=status,
                    priority=priority,
                    category=category,
                    priority_color=priority_color,
                    status_color=status_color
                )
                tasks.append(task)

            except Exception as e:
                print(f"タスクのパースエラー: {e}")
                continue

        return tasks

    def test_connection(self) -> tuple[bool, str]:
        """
        Notion API への接続をテスト

        Returns:
            (成功したか, メッセージ)
        """
        try:
            url = f"{self.base_url}/databases/{self.DATABASE_ID}"
            response = requests.get(url, headers=self.headers, timeout=10)

            if response.status_code == 200:
                return True, "接続成功"
            elif response.status_code == 401:
                return False, "認証エラー: トークンが無効です"
            elif response.status_code == 404:
                return False, "データベースが見つかりません"
            else:
                return False, f"エラー: {response.status_code}"

        except Exception as e:
            return False, f"接続エラー: {str(e)}"


def load_token_from_env() -> Optional[str]:
    """
    .env ファイルまたは環境変数から Notion Token を読み込む

    Returns:
        Notion Token (無い場合は None)
    """
    # 環境変数から取得
    token = os.getenv("NOTION_TOKEN")
    if token:
        return token

    # .env ファイルから読み込み
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("NOTION_TOKEN="):
                    token = line.split("=", 1)[1].strip()
                    return token

    return None
