const { contextBridge, ipcRenderer } = require('electron');

// レンダラープロセスに安全なAPIを公開
contextBridge.exposeInMainWorld('electronAPI', {
  // メインプロセスにメッセージを送信
  sendMessage: (message) => {
    ipcRenderer.send('send-message', message);
  },

  // 接続数を更新
  updateConnectionCount: (count) => {
    ipcRenderer.send('update-connection-count', count);
  },

  // 通知を表示
  showNotification: (message) => {
    ipcRenderer.send('show-notification', message);
  },

  // メインプロセスからのメッセージを受信
  onSendMessage: (callback) => {
    ipcRenderer.on('send-message', (event, message) => {
      callback(message);
    });
  },

  // イベントリスナーを削除
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  }
});
