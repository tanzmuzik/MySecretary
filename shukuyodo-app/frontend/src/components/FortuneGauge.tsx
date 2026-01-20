import React from 'react';
import './FortuneGauge.css';

interface FortuneGaugeProps {
  score: number;
}

const FortuneGauge: React.FC<FortuneGaugeProps> = ({ score }) => {
  const getGaugeColor = (score: number) => {
    if (score >= 85) return '#27ae60'; // 大吉
    if (score >= 70) return '#3498db'; // 吉
    if (score >= 55) return '#2ecc71'; // 中吉
    if (score >= 45) return '#f39c12'; // 平
    if (score >= 30) return '#e67e22'; // 小凶
    if (score >= 15) return '#e74c3c'; // 凶
    return '#8b0000'; // 大凶
  };

  const color = getGaugeColor(score);
  const percentage = (score / 100) * 100;

  return (
    <div className="fortune-gauge">
      <div className="gauge-container">
        <div className="gauge-background">
          <div className="gauge-fill" style={{ width: `${percentage}%`, backgroundColor: color }} />
        </div>
        <div className="gauge-labels">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
};

export default FortuneGauge;
