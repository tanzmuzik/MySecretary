import React, { useState, useEffect } from 'react';
import { Logger, LogEntry, DailySummary } from '../utils/logger';
import './LogViewer.css';

interface LogViewerProps {
  logger: Logger;
}

const LogViewer: React.FC<LogViewerProps> = ({ logger }) => {
  const [todayLogs, setTodayLogs] = useState<LogEntry[]>([]);
  const [summary, setSummary] = useState<DailySummary>({ date: '', sent: 0, received: 0, total: 0 });
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [showAllLogs, setShowAllLogs] = useState(false);

  useEffect(() => {
    loadLogs();

    // 定期的にログを更新
    const interval = setInterval(loadLogs, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadLogs = () => {
    setTodayLogs(logger.getTodayLogs());
    setSummary(logger.getTodaySummary());
    setAllLogs(logger.getLogs());
  };

  const handleClearLogs = () => {
    if (window.confirm('すべてのログを削除しますか?')) {
      logger.clearLogs();
      loadLogs();
    }
  };

  const handleExportLogs = () => {
    const data = logger.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urusee-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const displayLogs = showAllLogs ? allLogs : todayLogs;

  return (
    <div className="log-viewer">
      <section className="log-summary">
        <h2>📊 今日のサマリー</h2>
        <div className="summary-cards">
          <div className="summary-card sent">
            <div className="card-icon">📤</div>
            <div className="card-content">
              <div className="card-label">送信</div>
              <div className="card-value">{summary.sent}</div>
            </div>
          </div>
          <div className="summary-card received">
            <div className="card-icon">📥</div>
            <div className="card-content">
              <div className="card-label">受信</div>
              <div className="card-value">{summary.received}</div>
            </div>
          </div>
          <div className="summary-card total">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <div className="card-label">合計</div>
              <div className="card-value">{summary.total}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="log-controls">
        <button
          className={`toggle-button ${!showAllLogs ? 'active' : ''}`}
          onClick={() => setShowAllLogs(false)}
        >
          今日のログ
        </button>
        <button
          className={`toggle-button ${showAllLogs ? 'active' : ''}`}
          onClick={() => setShowAllLogs(true)}
        >
          全てのログ
        </button>
        <button className="export-button" onClick={handleExportLogs}>
          📥 エクスポート
        </button>
        <button className="clear-button" onClick={handleClearLogs}>
          🗑️ クリア
        </button>
      </section>

      <section className="log-list">
        <h3>{showAllLogs ? '全てのログ' : '今日のログ'} ({displayLogs.length}件)</h3>
        {displayLogs.length === 0 ? (
          <div className="no-logs">ログがありません</div>
        ) : (
          <div className="log-entries">
            {displayLogs.slice().reverse().map((log, index) => (
              <div key={index} className={`log-entry ${log.type}`}>
                <div className="log-time">{log.time}</div>
                <div className="log-type">
                  {log.type === 'sent' ? '📤 送信' : '📥 受信'}
                </div>
                <div className="log-message">{log.message}</div>
                <div className="log-date">{log.date}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LogViewer;
