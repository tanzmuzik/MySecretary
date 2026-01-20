import React, { useState } from 'react';
import './App.css';
import BirthdayInput from './components/BirthdayInput';
import Dashboard from './pages/Dashboard';

function App() {
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  const handleSetBirthDate = (date: string, name: string) => {
    setBirthDate(date);
    setUserName(name);
  };

  const handleReset = () => {
    setBirthDate(null);
    setUserName('');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌟 宿曜道 運気鑑定</h1>
        <p>生年月日から、あなたの宿星と運気を知ろう</p>
      </header>

      <main className="app-main">
        {!birthDate ? (
          <BirthdayInput onBirthdaySet={handleSetBirthDate} />
        ) : (
          <Dashboard birthDate={birthDate} userName={userName} onReset={handleReset} />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2026 Shukuyodo Fortune. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
