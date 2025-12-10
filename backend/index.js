const express = require('express');
const cors = require('cors');
require('dotenv').config();
const shortid = require('shortid');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory storage for shortened URLs
const urlMap = {};

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'MySecretary Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      tasks: '/api/tasks',
      teams: '/api/teams',
      shorten: 'POST /api/shorten',
      qrcode: 'GET /api/qrcode/:code'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/tasks', (req, res) => {
  res.json({ 
    tasks: [],
    message: 'Task management endpoint - ready for implementation'
  });
});

app.get('/api/teams', (req, res) => {
  res.json({
    teams: [],
    message: 'Microsoft Teams integration endpoint - ready for implementation'
  });
});

// URL Shortening Endpoint
app.post('/api/shorten', (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'originalUrl is required' });
  }

  try {
    const code = shortid.generate();
    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
    const shortenedUrl = `${baseUrl}/s/${code}`;

    urlMap[code] = originalUrl;

    res.json({
      originalUrl,
      shortenedUrl,
      code
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to shorten URL' });
  }
});

// QR Code Endpoint
app.get('/api/qrcode/:code', async (req, res) => {
  const { code } = req.params;

  if (!urlMap[code]) {
    return res.status(404).json({ error: 'Shortened URL not found' });
  }

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(urlMap[code]);
    res.json({ qrCode: qrCodeDataUrl, url: urlMap[code] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Redirect Endpoint (redirects from shortened URL to original)
app.get('/s/:code', (req, res) => {
  const { code } = req.params;
  const originalUrl = urlMap[code];

  if (!originalUrl) {
    return res.status(404).json({ error: 'Shortened URL not found' });
  }

  res.redirect(originalUrl);
});

app.listen(PORT, () => {
  console.log(`MySecretary Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});