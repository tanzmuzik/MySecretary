import React, { useState, useEffect } from 'react';
import './App.css';
import DailyReportGenerator from './components/DailyReportGenerator';
import ActivityLog from './components/ActivityLog';
import ProjectManager from './components/ProjectManager';

type AppTab = 'report' | 'activities' | 'projects';

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('report');
  const [apiStatus, setApiStatus] = useState<string>('checking');

  useEffect(() => {
    // Check API health
    fetch('http://localhost:3001/health')
      .then(res => res.json())
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('disconnected'));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>MySecretary Daily Report Copilot</h1>
        <p>Powered by AI - 効率的な日報作成を実現</p>
        <div className="api-status">
          API Status: <span className={`status ${apiStatus}`}>{apiStatus}</span>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          📝 日報生成
        </button>
        <button
          className={`nav-btn ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          📋 活動ログ
        </button>
        <button
          className={`nav-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          📊 プロジェクト
        </button>
      </nav>

      <main className="App-main">
        {activeTab === 'report' && <DailyReportGenerator />}
        {activeTab === 'activities' && <ActivityLog />}
        {activeTab === 'projects' && <ProjectManager />}
      </main>

      <footer className="App-footer">
        <p>MySecretary v2.0 - Copilot Integration for Daily Reports</p>
      </footer>
    </div>
  );
}

export default App;