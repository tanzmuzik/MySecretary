import React, { useState, useEffect } from 'react';
import './BirthstarInfo.css';

interface BirthStar {
  id: number;
  name: string;
  reading: string;
  element: string;
  natureType: string;
}

interface BirthdayInfo {
  birthDate: string;
  birthStar: BirthStar;
  description: string;
}

interface BirthstarInfoProps {
  birthDate: string;
}

const STAR_DESCRIPTIONS: { [key: string]: string } = {
  虚: '虚宿は柔軟性に富み、新しい環境への適応力が高い。社交性が高く、人間関係が広い。創造性も豊かで、芸術的才能がある。',
  危: '危宿は知的で理性的。分析力や洞察力に優れている。慎重で真面目な性質。計画性があり、責任感が強い。',
  室: '室宿は行動力と実行力に優れている。積極的で、目標達成に向けて邁進できる。人当たりが良く、リーダーシップがある。',
  壁: '壁宿は冷静沈着。洞察力に優れ、物事の本質を見抜く能力がある。独立心が強く、自分の考えを持っている。',
  奎: '奎宿は実直で誠実。信頼できる人物として評価される。努力家で、継続力がある。安定を好む性質。',
  婁: '婁宿は感性豊かで繊細。人の心を理解する能力がある。芸術的感覚に優れている。深い思考をする傾向。',
  胃: '胃宿は社交的で親しみやすい。人を楽しませることが好き。楽観的で、困難な状況でも前向きに対処できる。',
  昴: '昴宿は誠実で責任感が強い。公平性を重視し、正義感がある。落ち着きと包容力がある。',
  畢: '畢宿は好奇心旺盛で学習意欲が高い。知識を求め、多方面に興味を持つ。柔軟な思考を持つ。',
  觜: '觜宿は直感力に優れている。感覚的に物事を判断する能力がある。芸術的才能に恵まれている。',
  参: '参宿は決断力と行動力がある。強い意志を持ち、困難も乗り越えられる。リーダーシップが高い。',
  井: '井宿は知恵と教養がある。学問や芸術に秀でている可能性が高い。理想主義的で、理想の実現を目指す。',
  鬼: '鬼宿は意志が強く、目標達成能力が高い。独立心が強く、自分の道を歩む。エネルギッシュで活動的。',
  柳: '柳宿は柔軟で適応力が高い。変化を恐れず、新しいことに挑戦できる。人間関係が円滑で、協調性がある。',
  星: '星宿は完成度を求める傾向がある。品質を重視し、完璧を目指す。真面目で勤勉。安定志向。',
  張: '張宿は拡大や拡張を象徴する。成長志向が強く、新しい可能性を求める。エネルギッシュで行動的。',
  翼: '翼宿は思慮深く、バランス感覚に優れている。中庸を保ち、両方の立場を理解できる。穏やかで優雅。',
  軫: '軫宿は気配りができ、他者への思いやりが強い。協調性に優れ、チームプレイができる。責任感がある。',
  角: '角宿は新しいことを始める能力に優れている。開拓精神があり、パイオニア気質。エネルギーが満ち溢れている。',
  亢: '亢宿は高い理想を持つ。完璧さを求め、高みを目指す。信頼性が高く、他者からの評価が高い。',
  氐: '氐宿は基礎を大切にする。安定と継続を重視する。真面目で実直。長期的な視点を持つ。',
  房: '房宿は情熱的で積極的。目標に向かって邁進できる。表現力に優れ、人を感動させることができる。',
  心: '心宿は感情が豊かで表現力がある。人の心に訴えかけることができる。芸術的才能に恵まれている。',
  尾: '尾宿は結実と完成を象徴する。物事を最後まで成し遂げる能力がある。完結志向が強い。',
  箕: '箕宿は風のような自由さを持つ。流動的で適応性が高い。変化を好み、新しい環境を求める。',
  斗: '斗宿は深い思考と知恵がある。内省的で、自分の心と向き合う。精神的な深さを持つ。',
  牛: '牛宿は堅実で信頼できる。努力を積み重ね、着実に進む。忍耐力と継続力がある。',
};

const BirthstarInfo: React.FC<BirthstarInfoProps> = ({ birthDate }) => {
  const [birthdayInfo, setBirthdayInfo] = useState<BirthdayInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBirthdayInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shukuyodo/birthday-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ birthDate }),
        });

        if (!response.ok) {
          throw new Error('宿星情報の取得に失敗しました');
        }

        const data = await response.json();
        setBirthdayInfo(data);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdayInfo();
  }, [birthDate]);

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!birthdayInfo) {
    return <div className="error">データが見つかりません</div>;
  }

  const star = birthdayInfo.birthStar;
  const description = STAR_DESCRIPTIONS[star.name] || '情報が見つかりません';

  const elementColors: { [key: string]: string } = {
    水: '#3498db',
    火: '#e74c3c',
    木: '#2ecc71',
    金: '#f39c12',
    土: '#d2691e',
    日: '#f1c40f',
  };

  return (
    <div className="birthstar-container">
      <div className="star-header">
        <h2>{star.name}宿</h2>
        <p className="reading">（{star.reading}）</p>
      </div>

      <div className="star-attributes">
        <div className="attribute-box">
          <span className="attr-label">属性</span>
          <span className="attr-value" style={{ color: elementColors[star.element] }}>
            {star.element}
          </span>
        </div>
        <div className="attribute-box">
          <span className="attr-label">気質</span>
          <span className="attr-value">{star.natureType}</span>
        </div>
        <div className="attribute-box">
          <span className="attr-label">宿星番号</span>
          <span className="attr-value">{star.id}/27</span>
        </div>
      </div>

      <div className="description-box">
        <h3>宿星の特性</h3>
        <p>{description}</p>
      </div>

      <div className="lucky-elements">
        <h3>ラッキー情報</h3>
        <div className="lucky-grid">
          <div className="lucky-item">
            <span className="lucky-label">吉色</span>
            <div className="lucky-colors" style={{ backgroundColor: elementColors[star.element] }} />
          </div>
          <div className="lucky-item">
            <span className="lucky-label">属性</span>
            <span className="lucky-value">{star.element}</span>
          </div>
          <div className="lucky-item">
            <span className="lucky-label">気質</span>
            <span className="lucky-value">{star.natureType}</span>
          </div>
        </div>
      </div>

      <div className="advice-box">
        <h3>💡 あなたへのアドバイス</h3>
        <ul className="advice-items">
          <li>あなたの宿星の特性を理解し、その強みを活かすことが大切です</li>
          <li>毎日の運気を参考にしながら、良い日には重要な決定をすることをお勧めします</li>
          <li>月ごと、年ごとの運気の流れも参考にして、長期計画を立てるとよいでしょう</li>
          <li>他の人の宿星との相性も確認してみると、人間関係がより円滑になるかもしれません</li>
        </ul>
      </div>
    </div>
  );
};

export default BirthstarInfo;
