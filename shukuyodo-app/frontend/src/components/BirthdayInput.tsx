import React, { useState } from 'react';
import './BirthdayInput.css';

interface BirthdayInputProps {
  onBirthdaySet: (date: string, name: string) => void;
}

const BirthdayInput: React.FC<BirthdayInputProps> = ({ onBirthdaySet }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('お名前を入力してください');
      return;
    }

    if (!birthDate) {
      setError('生年月日を選択してください');
      return;
    }

    // 生年月日の妥当性チェック
    const date = new Date(birthDate);
    const today = new Date();

    if (date > today) {
      setError('生年月日は本日より前である必要があります');
      return;
    }

    onBirthdaySet(birthDate, name);
  };

  return (
    <div className="birthday-input-container">
      <div className="card">
        <h2>生年月日を入力</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">お名前</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="山田太郎"
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="birthDate">生年月日</label>
            <input
              type="date"
              id="birthDate"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="input-field"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn">
            運気を診断
          </button>
        </form>

        <div className="info-box">
          <h3>宿曜道について</h3>
          <p>
            宿曜道（しゅくようどう）は、古代インドの占星術「ナヴァンシャ」を
            日本に伝わった形式で、27個の宿星によって人の運命や性質を判断する占いです。
          </p>
          <p>
            生年月日から宿星を割り出し、その日その日の運気、月ごと、年ごとの運気を詳しく鑑定します。
          </p>
        </div>
      </div>
    </div>
  );
};

export default BirthdayInput;
