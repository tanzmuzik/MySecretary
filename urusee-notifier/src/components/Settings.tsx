import React from "react";

interface LogEntry {
  timestamp: string;
  machine_name: string;
}

interface SettingsProps {
  soundEnabled: boolean;
  toggleSound: () => void;
  logs: LogEntry[];
  onClose: () => void;
  onSend: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  soundEnabled,
  toggleSound,
  logs,
  onClose,
  onSend,
}) => {
  // 今日のログをフィルタリング
  const today = new Date().toISOString().split("T")[0];
  const todayLogs = logs.filter((log) => log.timestamp.startsWith(today));

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>⚙️ うるせぇ通知 設定</h1>
      </div>

      <div className="settings-content">
        {/* 送信ボタン */}
        <div className="settings-section">
          <button className="send-button" onClick={onSend}>
            💥 うるせぇ！を送信
          </button>
        </div>

        {/* 効果音設定 */}
        <div className="settings-section">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={toggleSound}
            />
            <span>効果音を有効にする</span>
          </label>
        </div>

        {/* 接続状態 */}
        <div className="settings-section">
          <div className="status-indicator">
            <div className="status-dot online"></div>
            <span>オンライン</span>
          </div>
        </div>

        {/* ログビューア */}
        <div className="settings-section">
          <h2>📊 今日の送信履歴</h2>
          <div className="log-count">
            今日の送信回数: <strong>{todayLogs.length}</strong> 回
          </div>

          <div className="log-list">
            {todayLogs.length === 0 ? (
              <p className="log-empty">まだ送信していません</p>
            ) : (
              todayLogs
                .slice()
                .reverse()
                .slice(0, 10)
                .map((log, index) => (
                  <div key={index} className="log-entry">
                    <span className="log-time">
                      {log.timestamp.split(" ")[1]}
                    </span>
                    <span className="log-machine">{log.machine_name}</span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* 閉じるボタン */}
        <div className="settings-section">
          <button className="close-button" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
