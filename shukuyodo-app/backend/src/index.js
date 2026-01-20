const express = require('express');
const cors = require('cors');
require('dotenv').config();

const shukuyodoRoutes = require('./routes/shukuyodo');

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());

// ルート
app.use('/api/shukuyodo', shukuyodoRoutes);

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// API情報
app.get('/', (req, res) => {
  res.json({
    name: 'Shukuyodo Fortune API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      birthdayInfo: 'POST /api/shukuyodo/birthday-info',
      todayFortune: 'POST /api/shukuyodo/today-fortune',
      monthlyFortune: 'POST /api/shukuyodo/monthly-fortune',
      yearlyFortune: 'POST /api/shukuyodo/yearly-fortune',
      compatibility: 'POST /api/shukuyodo/compatibility',
      weeklyFortune: 'POST /api/shukuyodo/weekly-fortune',
    },
  });
});

app.listen(PORT, () => {
  console.log(`Shukuyodo API server running on port ${PORT}`);
});
