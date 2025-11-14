const WebSocket = require('ws');

const PORT = 5555;
const wss = new WebSocket.Server({ port: PORT });

const clients = new Set();

wss.on('connection', (ws) => {
  console.log('新しいクライアントが接続しました');
  clients.add(ws);

  // 接続数を全クライアントに通知
  broadcastConnectionCount();

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('受信したメッセージ:', data);

      // 送信者以外の全クライアントにブロードキャスト
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (error) {
      console.error('メッセージ処理エラー:', error);
    }
  });

  ws.on('close', () => {
    console.log('クライアントが切断しました');
    clients.delete(ws);
    broadcastConnectionCount();
  });

  ws.on('error', (error) => {
    console.error('WebSocketエラー:', error);
  });
});

function broadcastConnectionCount() {
  const count = clients.size;
  const message = JSON.stringify({
    type: 'connection-count',
    count: count
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

console.log(`WebSocketサーバーがポート${PORT}で起動しました`);

// プロセスの終了処理
process.on('SIGTERM', () => {
  console.log('サーバーを終了します...');
  wss.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('サーバーを終了します...');
  wss.close(() => {
    process.exit(0);
  });
});
