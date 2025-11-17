import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { appWindow } from "@tauri-apps/api/window";
import Notification from "./components/Notification";
import Settings from "./components/Settings";

interface NotificationData {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

interface LogEntry {
  timestamp: string;
  machine_name: string;
}

const EMOJIS = ["🔥", "💢", "💥", "😡", "👊"];

function App() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [machineName, setMachineName] = useState("");

  // クリック音とピピピ音
  const playClickSound = () => {
    if (soundEnabled) {
      const audio = new Audio("/sounds/click.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  };

  const playReceiveSound = () => {
    if (soundEnabled) {
      const audio = new Audio("/sounds/receive.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  };

  // ランダムな位置を生成
  const getRandomPosition = () => {
    const maxX = window.innerWidth - 200;
    const maxY = window.innerHeight - 100;
    return {
      x: Math.random() * maxX,
      y: Math.random() * maxY,
    };
  };

  // 通知を表示
  const showNotification = () => {
    const pos = getRandomPosition();
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const id = Date.now();

    setNotifications((prev) => [
      ...prev,
      {
        id,
        emoji,
        x: pos.x,
        y: pos.y,
      },
    ]);

    // 3秒後に削除
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  // 「うるせぇ！」を送信
  const sendUrusee = async () => {
    playClickSound();
    await invoke("send_urusee");
    await invoke("add_log", { machineName });
    loadLogs();
  };

  // ログを読み込み
  const loadLogs = async () => {
    try {
      const result = await invoke<LogEntry[]>("get_logs");
      setLogs(result);
    } catch (error) {
      console.error("Failed to load logs:", error);
    }
  };

  // 効果音設定を保存
  const toggleSound = async () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    await invoke("set_sound_enabled", { enabled: newState });
  };

  useEffect(() => {
    // 初期化
    const init = async () => {
      const name = await invoke<string>("get_machine_name");
      setMachineName(name);

      const enabled = await invoke<boolean>("get_sound_enabled");
      setSoundEnabled(enabled);

      loadLogs();
    };

    init();

    // イベントリスナーを登録
    const unlistenReceive = listen("receive-urusee", () => {
      playReceiveSound();
      showNotification();
    });

    const unlistenSend = listen("send-urusee", () => {
      playClickSound();
    });

    return () => {
      unlistenReceive.then((fn) => fn());
      unlistenSend.then((fn) => fn());
    };
  }, [soundEnabled]);

  return (
    <div className="app">
      {/* 設定パネル */}
      <Settings
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        logs={logs}
        onClose={() => appWindow.hide()}
        onSend={sendUrusee}
      />

      {/* 通知表示 */}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          emoji={notification.emoji}
          x={notification.x}
          y={notification.y}
        />
      ))}
    </div>
  );
}

export default App;
