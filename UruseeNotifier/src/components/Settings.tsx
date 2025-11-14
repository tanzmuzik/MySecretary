import React, { useState, useEffect } from 'react';
import { NotificationManager, NotificationSettings } from '../utils/notification';
import './Settings.css';

interface SettingsProps {
  notificationManager: NotificationManager;
  onSendMessage: (message: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ notificationManager, onSendMessage }) => {
  const [settings, setSettings] = useState<NotificationSettings>(
    notificationManager.getSettings()
  );

  const handleToggleSound = () => {
    const newSettings = {
      ...settings,
      soundEnabled: !settings.soundEnabled
    };
    setSettings(newSettings);
    notificationManager.saveSettings(newSettings);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    const newSettings = {
      ...settings,
      volume
    };
    setSettings(newSettings);
    notificationManager.saveSettings(newSettings);
  };

  const handleDisplayVariationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSettings = {
      ...settings,
      displayVariation: e.target.value
    };
    setSettings(newSettings);
    notificationManager.saveSettings(newSettings);
  };

  const handleTestNotification = () => {
    notificationManager.showNotification('うるせぇ！');
  };

  const handleSendMessage = () => {
    onSendMessage('うるせぇ！');
  };

  return (
    <div className="settings">
      <section className="settings-section">
        <h2>💬 メッセージ送信</h2>
        <button className="send-button" onClick={handleSendMessage}>
          うるせぇ！を送信
        </button>
        <p className="hint">
          タスクトレイアイコンをクリックしても送信できます
        </p>
      </section>

      <section className="settings-section">
        <h2>🔊 効果音設定</h2>
        <div className="setting-item">
          <label className="switch-label">
            <span>効果音を有効化</span>
            <div className="switch" onClick={handleToggleSound}>
              <div className={`switch-slider ${settings.soundEnabled ? 'active' : ''}`} />
            </div>
          </label>
        </div>

        <div className="setting-item">
          <label>
            音量: {Math.round(settings.volume * 100)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.volume}
              onChange={handleVolumeChange}
              disabled={!settings.soundEnabled}
              className="volume-slider"
            />
          </label>
        </div>
      </section>

      <section className="settings-section">
        <h2>🎨 表示設定</h2>
        <div className="setting-item">
          <label>
            表示バリエーション
            <select
              value={settings.displayVariation}
              onChange={handleDisplayVariationChange}
              className="select-input"
            >
              <option value="default">デフォルト</option>
              <option value="cute">かわいい</option>
              <option value="angry">激怒</option>
              <option value="cool">クール</option>
            </select>
          </label>
        </div>
      </section>

      <section className="settings-section">
        <h2>🧪 テスト</h2>
        <button className="test-button" onClick={handleTestNotification}>
          通知をテスト
        </button>
        <p className="hint">
          自分の画面に通知を表示します（他の人には送信されません）
        </p>
      </section>
    </div>
  );
};

export default Settings;
