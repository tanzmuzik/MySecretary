export interface NotificationSettings {
  soundEnabled: boolean;
  volume: number;
  displayVariation: string;
}

export class NotificationManager {
  private settings: NotificationSettings;
  private audio: HTMLAudioElement | null = null;

  constructor() {
    this.settings = this.loadSettings();
    this.initAudio();
  }

  private loadSettings(): NotificationSettings {
    const stored = localStorage.getItem('notification-settings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('設定の読み込みエラー:', error);
      }
    }

    return {
      soundEnabled: true,
      volume: 0.5,
      displayVariation: 'default'
    };
  }

  saveSettings(settings: NotificationSettings) {
    this.settings = settings;
    localStorage.setItem('notification-settings', JSON.stringify(settings));

    if (this.audio) {
      this.audio.volume = settings.volume;
    }
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  private initAudio() {
    // 効果音の初期化（実際のファイルパスは後で設定）
    this.audio = new Audio('/assets/sounds/paan.mp3');
    this.audio.volume = this.settings.volume;
  }

  playSound() {
    if (this.settings.soundEnabled && this.audio) {
      this.audio.currentTime = 0;
      this.audio.play().catch(error => {
        console.error('音声再生エラー:', error);
      });
    }
  }

  showNotification(message: string) {
    // Electronの通知機能を使用
    if (window.electronAPI) {
      window.electronAPI.showNotification(message);
    }

    // 効果音を再生
    this.playSound();
  }
}
