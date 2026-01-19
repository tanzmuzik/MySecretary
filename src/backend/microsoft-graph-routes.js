const express = require('express');
const MicrosoftGraphIntegration = require('./microsoft-graph-integration');

const router = express.Router();
const graph = new MicrosoftGraphIntegration();

/**
 * GET /api/microsoft-graph/calendar
 * Fetch calendar events for a specific date
 * Query: date (YYYY-MM-DD)
 */
router.get('/calendar', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const events = await graph.getCalendarEvents(date);

    res.status(200).json({
      date,
      events,
      count: events.length,
      source: 'Microsoft Graph Calendar',
    });
  } catch (error) {
    console.error('Calendar endpoint error:', error);
    res.status(500).json({
      error: 'Failed to fetch calendar events',
      message: error.message,
    });
  }
});

/**
 * GET /api/microsoft-graph/emails
 * Fetch recent emails
 * Query: limit (default: 10)
 */
router.get('/emails', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Invalid limit. Must be between 1 and 100',
      });
    }

    const emails = await graph.getRecentEmails(limit);

    res.status(200).json({
      emails,
      count: emails.length,
      source: 'Microsoft Graph Mail',
    });
  } catch (error) {
    console.error('Emails endpoint error:', error);
    res.status(500).json({
      error: 'Failed to fetch emails',
      message: error.message,
    });
  }
});

/**
 * GET /api/microsoft-graph/teams
 * Fetch Teams activity
 */
router.get('/teams', async (req, res) => {
  try {
    const teamId = req.query.teamId || null;
    const activity = await graph.getTeamsActivity(teamId);

    res.status(200).json({
      teams: activity,
      count: activity.length,
      source: 'Microsoft Graph Teams',
    });
  } catch (error) {
    console.error('Teams endpoint error:', error);
    res.status(500).json({
      error: 'Failed to fetch Teams activity',
      message: error.message,
    });
  }
});

/**
 * GET /api/microsoft-graph/merged-activities
 * Fetch merged activities from all sources
 * Query: date (YYYY-MM-DD)
 */
router.get('/merged-activities', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const merged = await graph.getMergedActivities(date);

    res.status(200).json({
      date,
      ...merged,
      totalActivities: merged.all.length,
      source: 'Microsoft Graph Merged',
    });
  } catch (error) {
    console.error('Merged activities endpoint error:', error);
    res.status(500).json({
      error: 'Failed to fetch merged activities',
      message: error.message,
    });
  }
});

/**
 * GET /api/microsoft-graph/status
 * Check Microsoft Graph integration status
 */
router.get('/status', (req, res) => {
  const hasToken = !!process.env.MICROSOFT_GRAPH_TOKEN;

  res.status(200).json({
    service: 'Microsoft Graph Integration',
    status: hasToken ? 'configured' : 'not-configured',
    tokenConfigured: hasToken,
    features: ['calendar', 'emails', 'teams', 'merged-activities'],
  });
});

/**
 * Helper function to validate date format
 * @param {String} date - Date string
 * @returns {Boolean} True if valid
 */
function isValidDate(date) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
}

module.exports = router;
