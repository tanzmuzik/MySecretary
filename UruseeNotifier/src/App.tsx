import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

interface UruseeMessage {
  type: string;
  timestamp: number;
  machine_id: string;
}

interface ConnectionStatus {
  online: boolean;
  broadcast_addr: string;
  machine_id: string;
}

const EMOJIS = ["💢", "🔔", "😤", "🗣️", "💔"];

function App() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sendCount, setSendCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // soundEnabled の最新の値を参照できるようにする
  const soundEnabledRef = useRef(soundEnabled);

  // 最後に受信したメッセージのタイムスタンプを記録（重複防止）
  const lastReceivedTimestampRef = useRef<number>(0);

  // soundEnabled が変更されたら ref も更新
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    loadConnectionStatus();
    setupEventListeners();
  }, []);

  const loadConnectionStatus = async () => {
    try {
      const result = await invoke<ConnectionStatus>("get_connection_status");
      setStatus(result);
    } catch (error) {
      console.error("Failed to get connection status:", error);
    }
  };

  const setupEventListeners = async () => {
    // UDP メッセージ受信イベントをリスン
    await listen<UruseeMessage>("uresee-received", (event) => {
      console.log("Received uresee:", event.payload);

      // 同じタイムスタンプのメッセージは無視（重複防止）
      if (event.payload.timestamp === lastReceivedTimestampRef.current) {
        console.log("⚠️ Duplicate message ignored");
        return;
      }
      lastReceivedTimestampRef.current = event.payload.timestamp;

      showBubble();
      // ref を使って最新の soundEnabled の値を取得
      if (soundEnabledRef.current) {
        playReceiveSound();
      }
    });
  };

  const sendUresee = async () => {
    try {
      await invoke("send_uresee");
      setSendCount((prev) => prev + 1);
      // ref を使って最新の soundEnabled の値を取得
      if (soundEnabledRef.current) {
        playSendSound();
      }
      console.log("Uresee sent!");
    } catch (error) {
      console.error("Failed to send uresee:", error);
    }
  };

  const showBubble = async () => {
    const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

    // スクリーン全体のサイズを取得（デスクトップ全体）
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    // ランダムな位置を計算
    const x = Math.floor(Math.random() * (screenWidth - 300));
    const y = Math.floor(Math.random() * (screenHeight - 150));

    try {
      // Rust 側で透過ウィンドウを作成
      await invoke("show_bubble", {
        text: "うるせぇ！",
        emoji: randomEmoji,
        x: x,
        y: y
      });
    } catch (error) {
      console.error("Failed to show bubble:", error);
    }
  };

  const playSendSound = () => {
    console.log("🔊 playSendSound called");
    // 簡易的なビープ音（実際には音声ファイルを使用）
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const playReceiveSound = () => {
    console.log("🔊 playReceiveSound called");
    // 3回のビープ音
    const audioContext = new AudioContext();
    for (let i = 0; i < 3; i++) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 1000;
      oscillator.type = "square";

      const startTime = audioContext.currentTime + i * 0.15;
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.1);
    }
  };

  return (
    <div className="app">
      {/* メインコントロール */}
      <div className="main-container">
        <h1>🔔 うるせぇ通知</h1>

        <button className="uresee-button" onClick={sendUresee}>
          うるせぇ！を送信
        </button>

        <button className="settings-button" onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? "閉じる" : "設定"}
        </button>

        {showSettings && (
          <div className="settings-panel">
            <h2>設定</h2>

            <div className="status-section">
              <h3>接続状態</h3>
              {status ? (
                <>
                  <p className="status-online">● オンライン</p>
                  <p className="status-detail">
                    ブロードキャスト: {status.broadcast_addr}
                  </p>
                  <p className="status-detail">マシンID: {status.machine_id}</p>
                </>
              ) : (
                <p className="status-offline">● オフライン</p>
              )}
            </div>

            <div className="sound-section">
              <label>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => {
                    console.log("🔧 Sound toggle changed:", e.target.checked);
                    setSoundEnabled(e.target.checked);
                  }}
                />
                効果音を有効にする
              </label>
            </div>

            <div className="log-section">
              <h3>今日の送信数</h3>
              <p className="send-count">{sendCount} 回</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
