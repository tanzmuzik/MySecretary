@echo off
echo ================================================
echo UruseeNotifier - Windows EXE ビルドスクリプト
echo ================================================
echo.

REM Node.jsのバージョンチェック
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.jsがインストールされていません。
    echo https://nodejs.org/ からダウンロードしてください。
    pause
    exit /b 1
)

echo [1/5] Node.jsバージョン確認...
node --version
npm --version
echo.

echo [2/5] アイコンファイルの確認...
if not exist "assets\icon.png" (
    echo [WARNING] アイコンファイルが見つかりません。
    echo.
    echo Pythonがインストールされている場合、以下のコマンドでアイコンを作成できます:
    echo   python create_icon.py
    echo.
    echo または、assets\icon.png に256x256のPNG画像を配置してください。
    echo.
    choice /C YN /M "アイコンなしで続行しますか"
    if errorlevel 2 exit /b 1
) else (
    echo ✓ アイコンファイルが見つかりました。
)
echo.

echo [3/5] 依存関係のインストール...
if not exist "node_modules" (
    echo 初回インストールには5-10分かかる場合があります...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm installに失敗しました。
        pause
        exit /b 1
    )
) else (
    echo ✓ node_modulesが既に存在します（スキップ）
)
echo.

echo [4/5] Reactアプリのビルド...
call npm run build
if errorlevel 1 (
    echo [ERROR] Reactビルドに失敗しました。
    pause
    exit /b 1
)
echo.

echo [5/5] Windows EXEの作成...
echo これには5-10分かかる場合があります...
call npm run build:win
if errorlevel 1 (
    echo [ERROR] Windowsビルドに失敗しました。
    pause
    exit /b 1
)
echo.

echo ================================================
echo ビルド完了！
echo ================================================
echo.
echo 生成されたファイル:
echo   dist\UruseeNotifier Setup 1.0.0.exe (インストーラー)
echo   dist\win-unpacked\UruseeNotifier.exe (ポータブル版)
echo.
echo インストーラーを実行するか、ポータブル版を配布できます。
echo.
pause
