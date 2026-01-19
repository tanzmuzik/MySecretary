const express = require('express');
const cors = require('cors');
require('dotenv').config();

const copilotRoutes = require('./copilot-routes');
const microsoftGraphRoutes = require('./microsoft-graph-routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory storage for demo (replace with database in production)
let activities = [];
let projects = [];
let dailyReports = [];

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'MySecretary Daily Report Copilot Backend',
    version: '2.0.0',
    features: ['Activity Logging', 'Daily Report Generation', 'Project Management', 'Copilot Integration'],
    endpoints: {
      health: '/health',
      activities: '/api/activities',
      reports: '/api/reports',
      projects: '/api/projects'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Daily Report Copilot'
  });
});

// Activity Logging Endpoints
app.post('/api/activities', (req, res) => {
  const { startTime, endTime, task, projectId, notes } = req.body;

  const activity = {
    id: Date.now(),
    startTime,
    endTime,
    task,
    projectId,
    notes,
    createdAt: new Date().toISOString()
  };

  activities.push(activity);
  res.status(201).json(activity);
});

app.get('/api/activities', (req, res) => {
  const { date, projectId } = req.query;

  let filtered = activities;

  if (date) {
    const targetDate = new Date(date).toDateString();
    filtered = filtered.filter(a => new Date(a.createdAt).toDateString() === targetDate);
  }

  if (projectId) {
    filtered = filtered.filter(a => a.projectId === projectId);
  }

  res.json({ activities: filtered, total: filtered.length });
});

app.get('/api/activities/:id', (req, res) => {
  const activity = activities.find(a => a.id === parseInt(req.params.id));
  if (!activity) return res.status(404).json({ error: 'Activity not found' });
  res.json(activity);
});

app.put('/api/activities/:id', (req, res) => {
  const activity = activities.find(a => a.id === parseInt(req.params.id));
  if (!activity) return res.status(404).json({ error: 'Activity not found' });

  Object.assign(activity, req.body, { updatedAt: new Date().toISOString() });
  res.json(activity);
});

app.delete('/api/activities/:id', (req, res) => {
  const index = activities.findIndex(a => a.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Activity not found' });

  const deleted = activities.splice(index, 1);
  res.json(deleted[0]);
});

// Project Management Endpoints
app.post('/api/projects', (req, res) => {
  const { name, description } = req.body;

  const project = {
    id: Date.now(),
    name,
    description,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  projects.push(project);
  res.status(201).json(project);
});

app.get('/api/projects', (req, res) => {
  res.json({ projects, total: projects.length });
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

app.put('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ error: 'Project not found' });

  Object.assign(project, req.body, { updatedAt: new Date().toISOString() });
  res.json(project);
});

// Mount Copilot routes
app.use('/api/copilot', copilotRoutes);

// Mount Microsoft Graph routes
app.use('/api/microsoft-graph', microsoftGraphRoutes);

// Daily Report Generation Endpoints
app.post('/api/reports/generate', (req, res) => {
  const { date, userId } = req.body;

  const targetDate = new Date(date).toDateString();
  const dayActivities = activities.filter(a => new Date(a.createdAt).toDateString() === targetDate);

  const report = {
    id: Date.now(),
    date,
    userId,
    activities: dayActivities,
    summary: `Daily report for ${date}: ${dayActivities.length} activities logged`,
    copilotStatus: 'pending',
    createdAt: new Date().toISOString()
  };

  dailyReports.push(report);
  res.status(201).json(report);
});

app.get('/api/reports', (req, res) => {
  const { date, userId } = req.query;

  let filtered = dailyReports;

  if (date) {
    filtered = filtered.filter(r => r.date === date);
  }

  if (userId) {
    filtered = filtered.filter(r => r.userId === userId);
  }

  res.json({ reports: filtered, total: filtered.length });
});

app.get('/api/reports/:id', (req, res) => {
  const report = dailyReports.find(r => r.id === parseInt(req.params.id));
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json(report);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`MySecretary Daily Report Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API docs: http://localhost:${PORT}/`);
});