import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import FortuneCard from '../components/FortuneCard';
import WeeklyFortune from '../components/WeeklyFortune';
import MonthlyFortune from '../components/MonthlyFortune';
import YearlyFortune from '../components/YearlyFortune';
import BirthstarInfo from '../components/BirthstarInfo';

interface DashboardProps {
  birthDate: string;
  userName: string;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ birthDate, userName, onReset }) => {
  const [activeTab, setActiveTab] = useState('today');
  const [error, setError] = useState('');

  useEffect(() => {
    // ダッシュボードが読み込まれたときに、バックエンドが利用可能かチェック
    fetch('/api/shukuyodo/birthday-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthDate }),
    })
      .catch(() => {
        setError('バックエンドサーバーに接続できません。サーバーが起動していることを確認してください。');
      });
  }, [birthDate]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h2>こんにちは、{userName}さん</h2>
          <p>生年月日: {new Date(birthDate).toLocaleDateString('ja-JP')}</p>
        </div>
        <button className="reset-btn" onClick={onReset}>
          生年月日を変更
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          📅 本日の運気
        </button>
        <button
          className={`tab ${activeTab === 'week' ? 'active' : ''}`}
          onClick={() => setActiveTab('week')}
        >
          📊 週間
        </button>
        <button
          className={`tab ${activeTab === 'month' ? 'active' : ''}`}
          onClick={() => setActiveTab('month')}
        >
          📈 月間
        </button>
        <button
          className={`tab ${activeTab === 'year' ? 'active' : ''}`}
          onClick={() => setActiveTab('year')}
        >
          🗓️ 年間
        </button>
        <button
          className={`tab ${activeTab === 'birthstar' ? 'active' : ''}`}
          onClick={() => setActiveTab('birthstar')}
        >
          ⭐ 宿星情報
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'today' && <FortuneCard birthDate={birthDate} />}
        {activeTab === 'week' && <WeeklyFortune birthDate={birthDate} />}
        {activeTab === 'month' && <MonthlyFortune birthDate={birthDate} />}
        {activeTab === 'year' && <YearlyFortune birthDate={birthDate} />}
        {activeTab === 'birthstar' && <BirthstarInfo birthDate={birthDate} />}
      </div>
    </div>
  );
};

export default Dashboard;
