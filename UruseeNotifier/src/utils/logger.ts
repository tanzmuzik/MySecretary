export interface LogEntry {
  timestamp: number;
  date: string;
  time: string;
  type: 'sent' | 'received';
  message: string;
}

export interface DailySummary {
  date: string;
  sent: number;
  received: number;
  total: number;
}

export class Logger {
  private storageKey = 'urusee-logs';

  private formatDate(timestamp: number): { date: string; time: string } {
    const d = new Date(timestamp);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    return { date, time };
  }

  log(type: 'sent' | 'received', message: string) {
    const timestamp = Date.now();
    const { date, time } = this.formatDate(timestamp);

    const entry: LogEntry = {
      timestamp,
      date,
      time,
      type,
      message
    };

    const logs = this.getLogs();
    logs.push(entry);

    // 最新1000件のみ保存
    if (logs.length > 1000) {
      logs.shift();
    }

    localStorage.setItem(this.storageKey, JSON.stringify(logs));
  }

  getLogs(): LogEntry[] {
    const data = localStorage.getItem(this.storageKey);
    if (!data) {
      return [];
    }

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('ログの読み込みエラー:', error);
      return [];
    }
  }

  getTodayLogs(): LogEntry[] {
    const { date } = this.formatDate(Date.now());
    const logs = this.getLogs();
    return logs.filter(log => log.date === date);
  }

  getTodaySummary(): DailySummary {
    const { date } = this.formatDate(Date.now());
    const todayLogs = this.getTodayLogs();

    const sent = todayLogs.filter(log => log.type === 'sent').length;
    const received = todayLogs.filter(log => log.type === 'received').length;

    return {
      date,
      sent,
      received,
      total: sent + received
    };
  }

  clearLogs() {
    localStorage.removeItem(this.storageKey);
  }

  exportLogs(): string {
    const logs = this.getLogs();
    return JSON.stringify(logs, null, 2);
  }
}
