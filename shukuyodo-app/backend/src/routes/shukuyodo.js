const express = require('express');
const router = express.Router();
const {
  calculateBirthStar,
  calculateDailyStar,
  calculateDailyFortune,
  getFortuneLevel,
  calculateCompatibility,
  getTodayFortune,
  getMonthlyFortune,
  getYearlyFortune,
} = require('../shukuyodo');

// 生年月日情報を取得
router.post('/birthday-info', (req, res) => {
  try {
    const { birthDate } = req.body;

    if (!birthDate) {
      return res.status(400).json({ error: 'birthDate is required' });
    }

    const birthStar = calculateBirthStar(birthDate);

    res.json({
      birthDate,
      birthStar,
      description: `あなたの宿星は${birthStar.name}宿（${birthStar.reading}）です。`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 本日の運気を取得
router.post('/today-fortune', (req, res) => {
  try {
    const { birthDate } = req.body;

    if (!birthDate) {
      return res.status(400).json({ error: 'birthDate is required' });
    }

    const fortuneData = getTodayFortune(birthDate);

    res.json(fortuneData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 月ごとの運気を取得
router.post('/monthly-fortune', (req, res) => {
  try {
    const { birthDate, year, month } = req.body;

    if (!birthDate || !year || !month) {
      return res.status(400).json({ error: 'birthDate, year, and month are required' });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({ error: 'month must be between 1 and 12' });
    }

    const monthlyFortune = getMonthlyFortune(birthDate, year, month);

    res.json(monthlyFortune);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 年ごとの運気を取得
router.post('/yearly-fortune', (req, res) => {
  try {
    const { birthDate, year } = req.body;

    if (!birthDate || !year) {
      return res.status(400).json({ error: 'birthDate and year are required' });
    }

    const yearlyFortune = getYearlyFortune(birthDate, year);

    res.json(yearlyFortune);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 週ごとの運気を取得
router.post('/weekly-fortune', (req, res) => {
  try {
    const { birthDate, startDate } = req.body;

    if (!birthDate || !startDate) {
      return res.status(400).json({ error: 'birthDate and startDate are required' });
    }

    const birthStar = calculateBirthStar(birthDate);
    const weeklyData = [];
    let totalScore = 0;

    const start = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);

      const dayStar = calculateDailyStar(date);
      const score = calculateDailyFortune(birthStar, dayStar);

      weeklyData.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: ['日', '月', '火', '水', '木', '金', '土'][date.getDay()],
        star: dayStar,
        score,
        level: getFortuneLevel(score),
      });

      totalScore += score;
    }

    const avgScore = Math.round(totalScore / 7);

    res.json({
      startDate: startDate,
      week: weeklyData,
      avgScore,
      weeklyLevel: getFortuneLevel(avgScore),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 相性を計算
router.post('/compatibility', (req, res) => {
  try {
    const { birthDate1, birthDate2 } = req.body;

    if (!birthDate1 || !birthDate2) {
      return res.status(400).json({ error: 'birthDate1 and birthDate2 are required' });
    }

    const star1 = calculateBirthStar(birthDate1);
    const star2 = calculateBirthStar(birthDate2);

    const compatibility = calculateCompatibility(star1, star2);

    res.json({
      person1: {
        birthDate: birthDate1,
        star: star1,
      },
      person2: {
        birthDate: birthDate2,
        star: star2,
      },
      compatibility,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
