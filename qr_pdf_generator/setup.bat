@echo off
REM QRコード配置PDF生成アプリ - Windowsセットアップスクリプト

echo ================================
echo QRコード配置PDF生成アプリ セットアップ
echo ================================
echo.

REM Python バージョンチェック
python --version
if errorlevel 1 (
    echo エラー: Pythonがインストールされていません
    echo https://www.python.org からPython 3.12以上をインストールしてください
    pause
    exit /b 1
)

echo ✓ Pythonが確認できました
echo.

REM 仮想環境を作成
echo 仮想環境を作成しています...
python -m venv venv
if errorlevel 1 (
    echo エラー: 仮想環境の作成に失敗しました
    pause
    exit /b 1
)
echo ✓ 仮想環境を作成しました
echo.

REM 仮想環境を有効化
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo エラー: 仮想環境の有効化に失敗しました
    pause
    exit /b 1
)

REM パッケージをインストール
echo 必要なパッケージをインストール中...
python -m pip install --upgrade pip
if errorlevel 1 (
    echo エラー: pipのアップグレードに失敗しました
    pause
    exit /b 1
)

pip install -r requirements.txt
if errorlevel 1 (
    echo エラー: パッケージのインストールに失敗しました
    pause
    exit /b 1
)

echo.
echo ================================
echo セットアップ完了！
echo ================================
echo.
echo アプリケーションを実行するには：
echo   python src\main.py
echo.
echo または、実行スクリプトを使用：
echo   run.bat
echo.
pause
