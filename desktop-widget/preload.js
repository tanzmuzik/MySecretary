const { contextBridge } = require('electron');

// Expose alarm notification API to renderer
contextBridge.exposeInMainWorld('alarmAPI', {
  showNotification: (title, body) => {
    // Notifications are created in renderer with web Notification API
    return new Notification(title, { body });
  },
  playSound: (frequency, duration) => {
    // Sound will be played using Web Audio API in renderer
    return { frequency, duration };
  }
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('Desktop Widget Loaded');
});
