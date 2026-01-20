import React, { useState, useEffect } from 'react';
import './MonthlyFortune.css';
import FortuneGauge from './FortuneGauge';

interface MonthlyData {
  year: number;
  month: number;
  avgScore: number;
  level: {
    score: number;
    label: string;
    description: string;
  };
  totalScore: number;
  daysInMonth: number;
  dailyScores: number[];
  starChanges: Array<{
    day: number;
    star: {
      id: number;
      name: string;
      reading: string;
      element: string;
      natureType: string;
    };
  }>;
}

interface MonthlyFortuneProps {
  birthDate: string;
}

const MonthlyFortune: React.FC<MonthlyFortuneProps> = ({ birthDate }) => {
  const [monthData, setMonthData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchMonthly = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shukuyodo/monthly-fortune', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ birthDate, year, month }),
        });

        if (!response.ok) {
          throw new Error('月間運気データの取得に失敗しました');
        }

        const data = await response.json();
        setMonthData(data);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchMonthly();
  }, [birthDate, year, month]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!monthData) {
    return <div className="error">データが見つかりません</div>;
  }

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

  const monthNames = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  return (
    <div className="monthly-container">
      <div className="monthly-header">
        <button onClick={handlePrevMonth} className="nav-btn">
          ◀ 前の月
        </button>
        <h3>{year}年 {monthNames[month]}</h3>
        <button onClick={handleNextMonth} className="nav-btn">
          次の月 ▶
        </button>
      </div>

      <div className="monthly-summary">
        <div className="summary-box">
          <span className="label">月間平均運気</span>
          <div className="summary-display">
            <span className="level" style={{ color: getLevelColor(monthData.level.label) }}>
              {monthData.level.label}
            </span>
            <span className="score">{monthData.avgScore}点</span>
          </div>
        </div>

        <div className="summary-box">
          <span className="label">総合スコア</span>
          <div className="summary-display">
            <span className="total-score">{monthData.totalScore}点</span>
            <span className="days-count">/ {monthData.daysInMonth}日</span>
          </div>
        </div>
      </div>

      <div className="gauge-section">
        <FortuneGauge score={monthData.avgScore} />
      </div>

      <div className="monthly-chart">
        <h4>日ごとの運気推移</h4>
        <div className="chart-bars">
          {monthData.dailyScores.map((score, index) => (
            <div key={index} className="chart-bar" title={`${index + 1}日: ${score}点`}>
              <div className="bar-fill" style={{ height: `${(score / 100) * 100}%` }} />
            </div>
          ))}
        </div>
      </div>

      {monthData.starChanges.length > 0 && (
        <div className="star-changes">
          <h4>宿星の変化</h4>
          <div className="star-timeline">
            {monthData.starChanges.map((change, index) => (
              <div key={index} className="star-change-item">
                <span className="day">{change.day}日</span>
                <span className="star-badge">{change.star.name}宿</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyFortune;
