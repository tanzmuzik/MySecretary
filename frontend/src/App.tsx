import React, { useState } from 'react';
import './App.css';
import URLShortener from './URLShortener';

type Page = 'home' | 'urlshortener';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return (
    <div className="App">
      <header className="App-header">
        <h1>MySecretary</h1>
        <p>Microsoft Teams連携タスク管理</p>
        <nav className="header-nav">
          <button
            className={currentPage === 'home' ? 'nav-button active' : 'nav-button'}
            onClick={() => setCurrentPage('home')}
          >
            ホーム
          </button>
          <button
            className={currentPage === 'urlshortener' ? 'nav-button active' : 'nav-button'}
            onClick={() => setCurrentPage('urlshortener')}
          >
            URL短縮
          </button>
        </nav>
      </header>
      <main>
        {currentPage === 'home' && (
          <div className="container">
            <h2>MySecretaryへようこそ</h2>
            <p>あなた専用のタスク管理アシスタント with Microsoft Teams integration.</p>
            <div className="features">
              <div className="feature-card">
                <h3>📋 タスク管理</h3>
                <p>タスクの作成・編集・管理が簡単に</p>
              </div>
              <div className="feature-card">
                <h3>🔗 URL短縮</h3>
                <p>URLを短縮してQRコードを生成</p>
              </div>
              <div className="feature-card">
                <h3>👥 Teams連携</h3>
                <p>Microsoft Teamsとの統合で効率化</p>
              </div>
            </div>
          </div>
        )}
        {currentPage === 'urlshortener' && <URLShortener />}
      </main>
    </div>
  );
}

export default App;