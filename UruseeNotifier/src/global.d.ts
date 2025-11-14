export {};

declare global {
  interface Window {
    electronAPI: {
      sendMessage: (message: string) => void;
      updateConnectionCount: (count: number) => void;
      showNotification: (message: string) => void;
      onSendMessage: (callback: (message: string) => void) => void;
      removeListener: (channel: string, callback: (...args: any[]) => void) => void;
    };
  }
}
