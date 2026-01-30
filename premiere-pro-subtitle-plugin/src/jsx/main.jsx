// ============================================
// Premiere Pro Subtitle Auto-Placer
// ExtendScript for Premiere Pro
// ============================================

// デバッグ用
function log(message) {
    try {
        var f = new File("~/subtitle-plugin.log");
        f.open("a");
        f.writeln("[" + new Date().toLocaleString() + "] " + message);
        f.close();
    } catch(e) {}
}

// グローバルPremiere Pro API
var app = require('premiere');

/**
 * SRT字幕データを解析する
 * @param {string} srtContent - SRTファイルの内容
 * @returns {Array} 字幕データの配列
 */
function parseSRT(srtContent) {
    var subtitles = [];
    var blocks = srtContent.split(/\n\s*\n/);

    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i].trim();
        if (!block) continue;

        var lines = block.split('\n');
        if (lines.length < 3) continue;

        var timeLine = lines[1];
        var textLines = lines.slice(2);

        // タイムコードをパース: HH:MM:SS,mmm --> HH:MM:SS,mmm
        var timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);

        if (timeMatch) {
            var startTime = timeToMilliseconds(
                parseInt(timeMatch[1]),
                parseInt(timeMatch[2]),
                parseInt(timeMatch[3]),
                parseInt(timeMatch[4])
            );

            var endTime = timeToMilliseconds(
                parseInt(timeMatch[5]),
                parseInt(timeMatch[6]),
                parseInt(timeMatch[7]),
                parseInt(timeMatch[8])
            );

            var text = textLines.join('\n').trim();

            subtitles.push({
                index: i,
                startTime: startTime,
                endTime: endTime,
                text: text,
                duration: endTime - startTime
            });
        }
    }

    return subtitles;
}

/**
 * タイムコードをミリ秒に変換
 */
function timeToMilliseconds(hours, minutes, seconds, milliseconds) {
    return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
}

/**
 * ミリ秒をPremiere ProのTime値に変換
 * 29.97 FPS想定
 */
function millisecondsToTime(ms) {
    // Premiere Proではティックを使用 (1秒 = 254016000ティック at 29.97fps)
    // または、シンプルにミリ秒をティックに変換
    return ms * 254016; // 29.97fps用の係数
}

/**
 * Premiere Proに字幕を配置する
 * @param {string} srtContent - SRTファイルの内容
 * @param {Object} settings - テンプレート設定
 */
function applySubtitles(srtContent, settings) {
    try {
        // アクティブなプロジェクトを取得
        var project = app.project;
        if (!project) {
            return "error: プロジェクトが開かれていません";
        }

        // アクティブなシーケンスを取得
        var sequence = project.activeSequence;
        if (!sequence) {
            return "error: シーケンスが選択されていません";
        }

        // SRTを解析
        var subtitles = parseSRT(srtContent);
        if (subtitles.length === 0) {
            return "error: 有効な字幕が見つかりません";
        }

        // 字幕トラックを取得または作成
        var videoTrackCount = sequence.videoTracks.numTracks;
        var subtitleTrackIndex = videoTrackCount; // ビデオトラックの次にテキストトラックを作成

        // 各字幕をシーケンスに追加
        var successCount = 0;
        for (var i = 0; i < subtitles.length; i++) {
            var subtitle = subtitles[i];

            // テキストクリップを作成
            var mediaItem = createSubtitleMediaItem(subtitle.text, settings);
            if (!mediaItem) continue;

            // タイムラインにクリップを追加
            var trackItem = addClipToSequence(
                sequence,
                mediaItem,
                subtitle.startTime,
                subtitle.duration,
                subtitleTrackIndex,
                settings
            );

            if (trackItem) {
                successCount++;
            }
        }

        return "success: " + successCount + "個の字幕を配置しました";

    } catch(error) {
        log("Error in applySubtitles: " + error.toString());
        return "error: " + error.toString();
    }
}

/**
 * テキストメディアアイテムを作成
 */
function createSubtitleMediaItem(text, settings) {
    try {
        var project = app.project;

        // テキストアジャスタを使用してテキストメディアアイテムを作成
        // Premiere Proではテキストを直接作成するのが複雑なため、
        // 既存のテキストテンプレートを使うか、
        // またはビットマップ画像として字幕を生成する必要があります

        // ここでは簡略版：テキストテンプレートの参照を返す
        // 実装の詳細はPremiere ProのバージョンとAPIに依存

        return null; // 実装待ち
    } catch(error) {
        log("Error in createSubtitleMediaItem: " + error.toString());
        return null;
    }
}

/**
 * クリップをシーケンスに追加
 */
function addClipToSequence(sequence, mediaItem, startTime, duration, trackIndex, settings) {
    try {
        if (!mediaItem) return null;

        var track = sequence.videoTracks[trackIndex];
        if (!track) {
            // トラックが存在しない場合は作成
            // Premiere ProのAPIではトラック作成が制限されているため、
            // 既存のトラックを使用するか、エラーを返す
            return null;
        }

        // クリップをトラックに追加
        // 実装の詳細はPremiere ProのAPIドキュメントを参照

        return null; // 実装待ち
    } catch(error) {
        log("Error in addClipToSequence: " + error.toString());
        return null;
    }
}

// Extensionからのコマンドをリッスン
// より詳細な実装はPremiere Pro CEP SDKドキュメントを参照
if (typeof CSXSEvent !== "undefined") {
    var csxsEvent = new CSXSEvent();
    csxsEvent.type = "com.adobe.csxs.events.ApplicationActivate";
}

log("Subtitle plugin loaded");
