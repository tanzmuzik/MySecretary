@echo off
REM QRコード配置PDF生成アプリ - Windows .exe ビルドスクリプト

echo ================================
echo QRコード配置PDF生成アプリ - ビルド
echo ================================
echo.

REM Python バージョンチェック
python --version
if errorlevel 1 (
    echo エラー: Pythonがインストールされていません
    pause
    exit /b 1
)

echo ✓ Pythonが確認できました
echo.

REM 仮想環境の確認
if not exist venv (
    echo エラー: 仮想環境が見つかりません
    echo setup.bat を実行してください
    pause
    exit /b 1
)

REM 仮想環境を有効化
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo エラー: 仮想環境の有効化に失敗しました
    pause
    exit /b 1
)

echo.
echo PyInstaller を実行中...
echo.

REM PyInstaller でビルド
pyinstaller --clean qr_pdf_generator.spec

if errorlevel 1 (
    echo エラー: ビルドに失敗しました
    pause
    exit /b 1
)

echo.
echo ================================
echo ビルド完了！
echo ================================
echo.
echo 実行可能ファイル:
echo   dist\QRコード配置PDF生成アプリ.exe
echo.
pause
