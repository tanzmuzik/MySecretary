import React, { useState, useEffect } from 'react';
import './FortuneCard.css';
import FortuneGauge from './FortuneGauge';

interface FortuneData {
  date: string;
  birthStar: {
    id: number;
    name: string;
    reading: string;
    element: string;
    natureType: string;
  };
  dayStar: {
    id: number;
    name: string;
    reading: string;
    element: string;
    natureType: string;
  };
  score: number;
  level: {
    score: number;
    label: string;
    description: string;
  };
  advice: string[];
}

interface FortuneCardProps {
  birthDate: string;
}

const FortuneCard: React.FC<FortuneCardProps> = ({ birthDate }) => {
  const [fortune, setFortune] = useState<FortuneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFortune = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shukuyodo/today-fortune', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ birthDate }),
        });

        if (!response.ok) {
          throw new Error('運気データの取得に失敗しました');
        }

        const data = await response.json();
        setFortune(data);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchFortune();
  }, [birthDate]);

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!fortune) {
    return <div className="error">データが見つかりません</div>;
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const getLevelColor = (label: string) => {
    switch (label) {
      case '大吉':
        return '#27ae60';
      case '吉':
        return '#3498db';
      case '中吉':
        return '#2ecc71';
      case '平':
        return '#f39c12';
      case '小凶':
        return '#e67e22';
      case '凶':
        return '#e74c3c';
      case '大凶':
        return '#8b0000';
      default:
        return '#95a5a6';
    }
  };

  return (
    <div className="fortune-card-container">
      <div className="fortune-card">
        <div className="card-header">
          <h3>{dateStr}</h3>
          <div className="date-info">本日の運気</div>
        </div>

        <div className="fortune-level" style={{ borderLeftColor: getLevelColor(fortune.level.label) }}>
          <div className="level-display">
            <div className="level-text">
              <span className="level-label" style={{ color: getLevelColor(fortune.level.label) }}>
                {fortune.level.label}
              </span>
              <span className="level-description">{fortune.level.description}</span>
            </div>
            <div className="score-display">{fortune.score}点</div>
          </div>
        </div>

        <FortuneGauge score={fortune.score} />

        <div className="star-info">
          <div className="star-box">
            <h4>生年月日の宿星</h4>
            <div className="star-details">
              <div className="star-name">{fortune.birthStar.name}宿</div>
              <div className="star-reading">（{fortune.birthStar.reading}）</div>
              <div className="star-meta">
                <span className="element">属性: {fortune.birthStar.element}</span>
                <span className="nature">気質: {fortune.birthStar.natureType}</span>
              </div>
            </div>
          </div>

          <div className="star-box">
            <h4>本日の宿星</h4>
            <div className="star-details">
              <div className="star-name">{fortune.dayStar.name}宿</div>
              <div className="star-reading">（{fortune.dayStar.reading}）</div>
              <div className="star-meta">
                <span className="element">属性: {fortune.dayStar.element}</span>
                <span className="nature">気質: {fortune.dayStar.natureType}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="advice-section">
          <h4>📝 本日のアドバイス</h4>
          <ul className="advice-list">
            {fortune.advice.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FortuneCard;
