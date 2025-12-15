@echo off
REM QRコード配置PDF生成アプリ - 実行スクリプト

REM 仮想環境が存在するか確認
if not exist "venv\Scripts\activate.bat" (
    echo エラー: 仮想環境が見つかりません
    echo setup.bat を実行してセットアップしてください
    pause
    exit /b 1
)

REM 仮想環境を有効化
call venv\Scripts\activate.bat

REM アプリケーションを実行
python src\main.py
if errorlevel 1 (
    echo.
    echo エラーが発生しました
    pause
)
