// Premiere Pro ExtendScriptへの通信用ブリッジ
const CSInterface = window.CSInterface;

let selectedSRTContent = null;

// DOM要素の参照
const srtFileInput = document.getElementById('srtFileInput');
const fileNameSpan = document.getElementById('fileName');
const applyButton = document.getElementById('applyButton');
const statusArea = document.getElementById('statusArea');
const opacitySlider = document.getElementById('opacity');
const opacityValue = document.getElementById('opacityValue');

// ファイル選択イベント
srtFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) {
        fileNameSpan.textContent = 'ファイルを選択してください';
        selectedSRTContent = null;
        applyButton.disabled = true;
        return;
    }

    // ファイル形式の確認
    if (!file.name.toLowerCase().endsWith('.srt')) {
        updateStatus('エラー: SRTファイルを選択してください', 'error');
        return;
    }

    // ファイルを読み込む
    const reader = new FileReader();
    reader.onload = function(event) {
        selectedSRTContent = event.target.result;
        fileNameSpan.textContent = file.name;
        applyButton.disabled = false;
        updateStatus(`ファイル読み込み完了: ${file.name}`, 'info');
    };
    reader.onerror = function() {
        updateStatus('エラー: ファイルを読み込めませんでした', 'error');
    };

    reader.readAsText(file);
});

// 透明度スライダーの更新
opacitySlider.addEventListener('input', function() {
    opacityValue.textContent = this.value + '%';
});

// 字幕配置ボタンのクリックイベント
applyButton.addEventListener('click', function() {
    if (!selectedSRTContent) {
        updateStatus('エラー: SRTファイルを選択してください', 'error');
        return;
    }

    // テンプレート設定を取得
    const settings = {
        fontFamily: document.getElementById('fontFamily').value,
        fontSize: parseInt(document.getElementById('fontSize').value),
        fontColor: document.getElementById('fontColor').value,
        bgColor: document.getElementById('bgColor').value,
        opacity: parseInt(document.getElementById('opacity').value),
        verticalPosition: document.getElementById('verticalPosition').value,
        addBackground: document.getElementById('addBackground').checked,
        addShadow: document.getElementById('addShadow').checked
    };

    applyButton.disabled = true;
    updateStatus('字幕を配置中...', 'info');

    // ExtendScriptに処理を委譲
    const payload = {
        srtContent: selectedSRTContent,
        settings: settings
    };

    // CSInterfaceを通じてExtendScriptを実行
    const jsxCode = `
        (function() {
            var payload = ${JSON.stringify(payload)};
            applySubtitles(payload.srtContent, payload.settings);
        })();
    `;

    CSInterface.evalScript(jsxCode, function(result) {
        applyButton.disabled = false;
        if (result && result.indexOf('success') !== -1) {
            updateStatus('成功: 字幕が配置されました！', 'success');
        } else {
            updateStatus(`エラー: ${result || '処理に失敗しました'}`, 'error');
        }
    });
});

/**
 * ステータスエリアを更新
 */
function updateStatus(message, type = 'info') {
    statusArea.textContent = message;
    statusArea.className = 'status-area ' + type;
}

// 初期化
window.addEventListener('load', function() {
    updateStatus('プラグイン準備完了。SRTファイルを選択してください。', 'info');
});
