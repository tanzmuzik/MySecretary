export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private onMessageCallback: ((data: any) => void) | null = null;
  private onConnectionCountCallback: ((count: number) => void) | null = null;

  constructor(private url: string = 'ws://localhost:5555') {}

  connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket接続成功');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'connection-count') {
            if (this.onConnectionCountCallback) {
              this.onConnectionCountCallback(data.count);
            }
            // メインプロセスに接続数を通知
            if (window.electronAPI) {
              window.electronAPI.updateConnectionCount(data.count);
            }
          } else if (data.type === 'message') {
            if (this.onMessageCallback) {
              this.onMessageCallback(data);
            }
          }
        } catch (error) {
          console.error('メッセージ処理エラー:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocketエラー:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket接続が閉じられました');
        this.reconnect();
      };
    } catch (error) {
      console.error('WebSocket接続エラー:', error);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      console.log('WebSocket再接続を試みています...');
      this.connect();
    }, this.reconnectInterval);
  }

  sendMessage(message: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const data = {
        type: 'message',
        content: message,
        timestamp: Date.now()
      };
      this.ws.send(JSON.stringify(data));
      return true;
    }
    console.error('WebSocketが接続されていません');
    return false;
  }

  onMessage(callback: (data: any) => void) {
    this.onMessageCallback = callback;
  }

  onConnectionCount(callback: (count: number) => void) {
    this.onConnectionCountCallback = callback;
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
