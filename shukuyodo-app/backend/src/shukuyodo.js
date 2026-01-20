// 宿曜道計算エンジン

const SHUKUYO_STARS = [
  { id: 1, name: '虚', reading: 'きょ', element: '水', natureType: '怪' },
  { id: 2, name: '危', reading: 'き', element: '火', natureType: '怪' },
  { id: 3, name: '室', reading: 'しつ', element: '木', natureType: '吉' },
  { id: 4, name: '壁', reading: 'へき', element: '木', natureType: '怪' },
  { id: 5, name: '奎', reading: 'けい', element: '金', natureType: '吉' },
  { id: 6, name: '婁', reading: 'ろう', element: '金', natureType: '怪' },
  { id: 7, name: '胃', reading: 'い', element: '土', natureType: '怪' },
  { id: 8, name: '昴', reading: 'ぼう', element: '水', natureType: '吉' },
  { id: 9, name: '畢', reading: 'ひつ', element: '水', natureType: '怪' },
  { id: 10, name: '觜', reading: 'し', element: '火', natureType: '吉' },
  { id: 11, name: '参', reading: 'しん', element: '火', natureType: '怪' },
  { id: 12, name: '井', reading: 'せい', element: '木', natureType: '吉' },
  { id: 13, name: '鬼', reading: 'き', element: '火', natureType: '吉' },
  { id: 14, name: '柳', reading: 'りゅう', element: '土', natureType: '吉' },
  { id: 15, name: '星', reading: 'せい', element: '金', natureType: '吉' },
  { id: 16, name: '張', reading: 'ちょう', element: '金', natureType: '怪' },
  { id: 17, name: '翼', reading: 'よく', element: '水', natureType: '吉' },
  { id: 18, name: '軫', reading: 'しん', element: '木', natureType: '吉' },
  { id: 19, name: '角', reading: 'かく', element: '木', natureType: '吉' },
  { id: 20, name: '亢', reading: 'こう', element: '金', natureType: '怪' },
  { id: 21, name: '氐', reading: 'てい', element: '土', natureType: '怪' },
  { id: 22, name: '房', reading: 'ぼう', element: '日', natureType: '吉' },
  { id: 23, name: '心', reading: 'しん', element: '火', natureType: '怪' },
  { id: 24, name: '尾', reading: 'び', element: '火', natureType: '吉' },
  { id: 25, name: '箕', reading: 'き', element: '木', natureType: '怪' },
  { id: 26, name: '斗', reading: 'と', element: '水', natureType: '吉' },
  { id: 27, name: '牛', reading: 'ぎゅう', element: '土', natureType: '吉' },
];

const FORTUNE_LEVELS = {
  excellent: { score: 90, label: '大吉', description: '非常に良好な運気です' },
  veryGood: { score: 75, label: '吉', description: '良好な運気です' },
  good: { score: 60, label: '中吉', description: 'まあまあ良い運気です' },
  neutral: { score: 50, label: '平', description: '平穏な運気です' },
  warning: { score: 35, label: '小凶', description: '注意が必要です' },
  bad: { score: 20, label: '凶', description: 'あまり良くない運気です' },
  verybad: { score: 5, label: '大凶', description: '非常に悪い運気です' },
};

// 生年月日から宿星を計算
function calculateBirthStar(birthDate) {
  // 簡便版：生年月日から宿星番号を計算
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 月日の数値を用いた計算
  const monthDay = month * 100 + day;
  const starIndex = (monthDay - 1) % 27;

  return SHUKUYO_STARS[starIndex];
}

// 指定日付の宿星を計算
function calculateDailyStar(date) {
  // ベース日（基準日）: 2024年1月1日を虚宿（id:1）とする
  const baseDate = new Date('2024-01-01');
  const baseStar = 0; // 虚宿のインデックス

  const targetDate = new Date(date);
  const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));

  const starIndex = (baseStar + diffDays) % 27;
  return SHUKUYO_STARS[starIndex];
}

// 運気スコアを計算（日ごと）
function calculateDailyFortune(birthStar, dayStar) {
  const starDiff = Math.abs(birthStar.id - dayStar.id);
  const minDiff = Math.min(starDiff, 27 - starDiff);

  // 生年月日の宿星と本日の宿星の関係で運気が変わる
  let score = 50;

  if (minDiff === 0) {
    score = 95; // 同じ宿星
  } else if (minDiff === 1) {
    score = 80; // 隣同士（吉）
  } else if (minDiff === 13 || minDiff === 14) {
    score = 15; // 正反対（凶）
  } else if (minDiff <= 6) {
    score = 65 + Math.random() * 20;
  } else if (minDiff >= 21) {
    score = 40 + Math.random() * 20;
  } else {
    score = 50 + (Math.random() - 0.5) * 20;
  }

  return Math.max(5, Math.min(95, Math.round(score)));
}

// 運気レベルを取得
function getFortuneLevel(score) {
  if (score >= 85) return FORTUNE_LEVELS.excellent;
  if (score >= 70) return FORTUNE_LEVELS.veryGood;
  if (score >= 55) return FORTUNE_LEVELS.good;
  if (score >= 45) return FORTUNE_LEVELS.neutral;
  if (score >= 30) return FORTUNE_LEVELS.warning;
  if (score >= 15) return FORTUNE_LEVELS.bad;
  return FORTUNE_LEVELS.verybad;
}

// 相性を計算
function calculateCompatibility(star1, star2) {
  const diff = Math.abs(star1.id - star2.id);
  const minDiff = Math.min(diff, 27 - diff);

  let compatibility = 0;
  let relation = '';

  if (minDiff === 0) {
    compatibility = 100;
    relation = '完全一致';
  } else if (minDiff === 1) {
    compatibility = 85;
    relation = '相性良好';
  } else if (minDiff === 3 || minDiff === 4) {
    compatibility = 70;
    relation = 'まあまあ良好';
  } else if (minDiff === 13 || minDiff === 14) {
    compatibility = 15;
    relation = '相性が悪い';
  } else if (minDiff === 9 || minDiff === 10) {
    compatibility = 25;
    relation = '注意が必要';
  } else {
    compatibility = 50;
    relation = '中立的';
  }

  return { compatibility, relation };
}

// 本日の運気を計算
function getTodayFortune(birthDateStr) {
  const birthStar = calculateBirthStar(birthDateStr);
  const today = new Date();
  const dayStar = calculateDailyStar(today);

  const score = calculateDailyFortune(birthStar, dayStar);
  const level = getFortuneLevel(score);

  return {
    date: today.toISOString().split('T')[0],
    birthStar,
    dayStar,
    score,
    level,
    advice: generateAdvice(birthStar, dayStar, score),
  };
}

// 月ごとの運気を計算
function getMonthlyFortune(birthDateStr, year, month) {
  const birthStar = calculateBirthStar(birthDateStr);
  const daysInMonth = new Date(year, month, 0).getDate();

  let totalScore = 0;
  const dailyScores = [];
  const starChanges = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayStar = calculateDailyStar(date);
    const score = calculateDailyFortune(birthStar, dayStar);

    totalScore += score;
    dailyScores.push(score);

    if (day === 1 || dayStar.id !== starChanges[starChanges.length - 1]?.star.id) {
      starChanges.push({ day, star: dayStar });
    }
  }

  const avgScore = Math.round(totalScore / daysInMonth);
  const level = getFortuneLevel(avgScore);

  return {
    year,
    month,
    avgScore,
    level,
    totalScore,
    daysInMonth,
    dailyScores,
    starChanges,
  };
}

// 年ごとの運気を計算
function getYearlyFortune(birthDateStr, year) {
  const monthlyFortures = [];
  let totalScore = 0;

  for (let month = 1; month <= 12; month++) {
    const monthFortune = getMonthlyFortune(birthDateStr, year, month);
    monthlyFortures.push(monthFortune);
    totalScore += monthFortune.avgScore;
  }

  const avgScore = Math.round(totalScore / 12);
  const level = getFortuneLevel(avgScore);

  return {
    year,
    avgScore,
    level,
    monthlyFortures,
  };
}

// アドバイスを生成
function generateAdvice(birthStar, dayStar, score) {
  const adviceList = [];

  if (score >= 85) {
    adviceList.push('今日は非常に良い運気です。重要な決断や新しいプロジェクトの開始に適しています。');
  } else if (score >= 70) {
    adviceList.push('今日の運気は良好です。積極的に行動することをお勧めします。');
  } else if (score >= 55) {
    adviceList.push('まあまあの運気です。通常通りの活動を心がけましょう。');
  } else if (score >= 45) {
    adviceList.push('平穏な運気です。急激な変化は控えめにしましょう。');
  } else if (score >= 30) {
    adviceList.push('注意が必要な運気です。重要な決断は避けた方が無難です。');
  } else {
    adviceList.push('今日の運気は良くありません。無理をせず、慎重に行動してください。');
  }

  // 属性に基づくアドバイス
  if (birthStar.element === dayStar.element) {
    adviceList.push(`あなたの${birthStar.element}の属性と本日の${dayStar.element}の属性が一致しており、より良い結果が期待できます。`);
  }

  return adviceList;
}

module.exports = {
  SHUKUYO_STARS,
  calculateBirthStar,
  calculateDailyStar,
  calculateDailyFortune,
  getFortuneLevel,
  calculateCompatibility,
  getTodayFortune,
  getMonthlyFortune,
  getYearlyFortune,
};
