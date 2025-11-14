import React, { useEffect, useState } from 'react';
import Settings from './components/Settings';
import LogViewer from './components/LogViewer';
import { WebSocketClient } from './utils/websocket';
import { Logger } from './utils/logger';
import { NotificationManager } from './utils/notification';
import './App.css';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'settings' | 'logs'>('settings');
  const [connectionCount, setConnectionCount] = useState<number>(0);
  const [wsClient] = useState(() => new WebSocketClient());
  const [logger] = useState(() => new Logger());
  const [notificationManager] = useState(() => new NotificationManager());

  useEffect(() => {
    // WebSocket接続
    wsClient.connect();

    // 接続数の更新
    wsClient.onConnectionCount((count) => {
      setConnectionCount(count);
    });

    // メッセージ受信時の処理
    wsClient.onMessage((data) => {
      if (data.type === 'message') {
        // 通知を表示
        notificationManager.showNotification(data.content);

        // ログに記録
        logger.log('received', data.content);
      }
    });

    // トレイアイコンからのメッセージ送信イベントを監視
    if (window.electronAPI) {
      window.electronAPI.onSendMessage((message: string) => {
        sendMessage(message);
      });
    }

    // クリーンアップ
    return () => {
      wsClient.disconnect();
    };
  }, []);

  const sendMessage = (message: string) => {
    const success = wsClient.sendMessage(message);
    if (success) {
      logger.log('sent', message);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔥 UruseeNotifier</h1>
        <div className="connection-status">
          接続中: <span className="count">{connectionCount}</span>人
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={currentView === 'settings' ? 'active' : ''}
          onClick={() => setCurrentView('settings')}
        >
          ⚙️ 設定
        </button>
        <button
          className={currentView === 'logs' ? 'active' : ''}
          onClick={() => setCurrentView('logs')}
        >
          📊 ログ
        </button>
      </nav>

      <main className="app-content">
        {currentView === 'settings' && (
          <Settings
            notificationManager={notificationManager}
            onSendMessage={sendMessage}
          />
        )}
        {currentView === 'logs' && (
          <LogViewer logger={logger} />
        )}
      </main>
    </div>
  );
};

export default App;
