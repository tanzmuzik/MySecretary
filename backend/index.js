const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: 'MySecretary Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      tasks: '/api/tasks',
      teams: '/api/teams'
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

app.listen(PORT, () => {
  console.log(`MySecretary Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});