#!/bin/bash
# QRコードPDF生成アプリ セットアップスクリプト

set -e

echo "================================"
echo "QRコード配置PDF生成アプリ セットアップ"
echo "================================"

# Python バージョンチェック
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python バージョン: $python_version"

# 仮想環境を作成（オプション）
if [ ! -d "venv" ]; then
    echo ""
    echo "仮想環境を作成しています..."
    python3 -m venv venv
    echo "✓ 仮想環境を作成しました"
fi

# 仮想環境を有効化
echo ""
echo "仮想環境を有効化しています..."
source venv/bin/activate || . venv/Scripts/activate

# パッケージをインストール
echo ""
echo "必要なパッケージをインストール中..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "================================"
echo "セットアップ完了！"
echo "================================"
echo ""
echo "アプリケーションを実行するには："
echo "  python src/main.py"
echo ""
echo "テストを実行するには："
echo "  python -m unittest tests.test_pdf_processor -v"
echo ""
