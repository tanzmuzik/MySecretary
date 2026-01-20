import React, { useState, useEffect } from 'react';
import './WeeklyFortune.css';
import FortuneGauge from './FortuneGauge';

interface DayFortune {
  date: string;
  dayOfWeek: string;
  star: {
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
}

interface WeeklyData {
  startDate: string;
  week: DayFortune[];
  avgScore: number;
  weeklyLevel: {
    score: number;
    label: string;
    description: string;
  };
}

interface WeeklyFortuneProps {
  birthDate: string;
}

const WeeklyFortune: React.FC<WeeklyFortuneProps> = ({ birthDate }) => {
  const [weekData, setWeekData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWeekly = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startDateStr = startOfWeek.toISOString().split('T')[0];

        const response = await fetch('/api/shukuyodo/weekly-fortune', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ birthDate, startDate: startDateStr }),
        });

        if (!response.ok) {
          throw new Error('週間運気データの取得に失敗しました');
        }

        const data = await response.json();
        setWeekData(data);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchWeekly();
  }, [birthDate]);

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!weekData) {
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

  return (
    <div className="weekly-container">
      <div className="weekly-summary">
        <h3>週間平均運気</h3>
        <div className="summary-level">
          <span className="summary-label" style={{ color: getLevelColor(weekData.weeklyLevel.label) }}>
            {weekData.weeklyLevel.label}
          </span>
          <span className="summary-score">{weekData.avgScore}点</span>
        </div>
        <FortuneGauge score={weekData.avgScore} />
      </div>

      <div className="weekly-grid">
        {weekData.week.map((day, index) => (
          <div key={index} className="day-card">
            <div className="day-header">
              <span className="day-of-week">{day.dayOfWeek}</span>
              <span className="date">{new Date(day.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</span>
            </div>

            <div className="day-star">
              <div className="star-name">{day.star.name}宿</div>
              <div className="star-reading">（{day.star.reading}）</div>
            </div>

            <div className="day-level" style={{ borderColor: getLevelColor(day.level.label) }}>
              <span className="level-label" style={{ color: getLevelColor(day.level.label) }}>
                {day.level.label}
              </span>
              <span className="score">{day.score}点</span>
            </div>

            <div className="day-gauge">
              <div className="mini-gauge-background">
                <div
                  className="mini-gauge-fill"
                  style={{
                    width: `${(day.score / 100) * 100}%`,
                    backgroundColor: getLevelColor(day.level.label),
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyFortune;
