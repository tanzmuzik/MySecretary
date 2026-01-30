/**
 * SRTファイルをパースして字幕データを抽出
 * @param {string} srtContent - SRTファイルの内容
 * @returns {Array} 字幕データの配列
 */
function parseSRT(srtContent) {
  const subtitles = [];

  // SRTブロックを分割（"\n\n"で区切られている）
  const blocks = srtContent.trim().split(/\n\s*\n/);

  blocks.forEach((block) => {
    const lines = block.trim().split('\n');
    if (lines.length < 3) return; // 最小限のデータがない場合はスキップ

    const indexLine = lines[0];
    const timeLine = lines[1];
    const textLines = lines.slice(2);

    // タイムコード行をパース
    const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);

    if (timeMatch) {
      const startTime = timeToMilliseconds(
        parseInt(timeMatch[1]),
        parseInt(timeMatch[2]),
        parseInt(timeMatch[3]),
        parseInt(timeMatch[4])
      );

      const endTime = timeToMilliseconds(
        parseInt(timeMatch[5]),
        parseInt(timeMatch[6]),
        parseInt(timeMatch[7]),
        parseInt(timeMatch[8])
      );

      const text = textLines.join('\n').trim();

      subtitles.push({
        index: parseInt(indexLine),
        startTime: startTime,
        endTime: endTime,
        startTimeFormatted: millisecondsToTimeCode(startTime),
        endTimeFormatted: millisecondsToTimeCode(endTime),
        text: text,
        duration: endTime - startTime
      });
    }
  });

  return subtitles;
}

/**
 * タイムコード（時:分:秒,ミリ秒）をミリ秒に変換
 * @returns {number} ミリ秒単位の時間
 */
function timeToMilliseconds(hours, minutes, seconds, milliseconds) {
  return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
}

/**
 * ミリ秒をタイムコード形式に変換
 * @param {number} ms - ミリ秒
 * @returns {string} HH:MM:SS,mmm形式
 */
function millisecondsToTimeCode(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}

/**
 * ミリ秒をPremiere Proのティック数に変換（29.97 FPS想定）
 * @param {number} ms - ミリ秒
 * @returns {number} ティック数
 */
function millisecondsToTicks(ms) {
  // Premiere ProはティックベースのタイムコードModeを使用
  // 29.97 FPSの場合: 1フレーム = 1000 ticks
  return Math.round(ms);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseSRT,
    timeToMilliseconds,
    millisecondsToTimeCode,
    millisecondsToTicks
  };
}
