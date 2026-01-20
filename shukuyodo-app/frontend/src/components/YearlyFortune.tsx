import React, { useState, useEffect } from 'react';
import './YearlyFortune.css';
import FortuneGauge from './FortuneGauge';

interface MonthlyFortune {
  year: number;
  month: number;
  avgScore: number;
  level: {
    score: number;
    label: string;
    description: string;
  };
}

interface YearlyData {
  year: number;
  avgScore: number;
  level: {
    score: number;
    label: string;
    description: string;
  };
  monthlyFortures: MonthlyFortune[];
}

interface YearlyFortuneProps {
  birthDate: string;
}

const YearlyFortune: React.FC<YearlyFortuneProps> = ({ birthDate }) => {
  const [yearData, setYearData] = useState<YearlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchYearly = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shukuyodo/yearly-fortune', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ birthDate, year }),
        });

        if (!response.ok) {
          throw new Error('年間運気データの取得に失敗しました');
        }

        const data = await response.json();
        setYearData(data);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchYearly();
  }, [birthDate, year]);

  const handlePrevYear = () => setYear(year - 1);
  const handleNextYear = () => setYear(year + 1);

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!yearData) {
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

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  const highestMonth = yearData.monthlyFortures.reduce((max, month, idx) => {
    return month.avgScore > yearData.monthlyFortures[max].avgScore ? idx : max;
  }, 0);

  const lowestMonth = yearData.monthlyFortures.reduce((min, month, idx) => {
    return month.avgScore < yearData.monthlyFortures[min].avgScore ? idx : min;
  }, 0);

  return (
    <div className="yearly-container">
      <div className="yearly-header">
        <button onClick={handlePrevYear} className="nav-btn">
          ◀ 前年
        </button>
        <h3>{year}年</h3>
        <button onClick={handleNextYear} className="nav-btn">
          翌年 ▶
        </button>
      </div>

      <div className="yearly-summary">
        <div className="summary-card">
          <span className="label">年間総合運気</span>
          <div className="summary-display">
            <span className="level" style={{ color: getLevelColor(yearData.level.label) }}>
              {yearData.level.label}
            </span>
            <span className="score">{yearData.avgScore}点</span>
          </div>
        </div>

        <div className="summary-card">
          <span className="label">最も運が良い月</span>
          <div className="summary-display">
            <span className="month-name">{monthNames[highestMonth]}</span>
            <span className="score">{yearData.monthlyFortures[highestMonth].avgScore}点</span>
          </div>
        </div>

        <div className="summary-card">
          <span className="label">運気が弱い月</span>
          <div className="summary-display">
            <span className="month-name">{monthNames[lowestMonth]}</span>
            <span className="score">{yearData.monthlyFortures[lowestMonth].avgScore}点</span>
          </div>
        </div>
      </div>

      <div className="gauge-section">
        <FortuneGauge score={yearData.avgScore} />
      </div>

      <div className="monthly-overview">
        <h4>月ごとの運気</h4>
        <div className="months-grid">
          {yearData.monthlyFortures.map((month, index) => (
            <div key={index} className="month-card">
              <div className="month-name-header">{monthNames[index]}</div>
              <div className="month-level" style={{ borderColor: getLevelColor(month.level.label) }}>
                <span className="level" style={{ color: getLevelColor(month.level.label) }}>
                  {month.level.label}
                </span>
              </div>
              <div className="month-score">{month.avgScore}点</div>
              <div className="month-gauge">
                <div className="mini-gauge-background">
                  <div
                    className="mini-gauge-fill"
                    style={{
                      width: `${(month.avgScore / 100) * 100}%`,
                      backgroundColor: getLevelColor(month.level.label),
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YearlyFortune;
