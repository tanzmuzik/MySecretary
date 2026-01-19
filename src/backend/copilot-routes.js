const express = require('express');
const CopilotIntegration = require('./copilot-integration');

const router = express.Router();
const copilot = new CopilotIntegration();

// In-memory storage (replace with database in production)
let activities = [];

/**
 * POST /api/copilot/generate-report
 * Generate daily report using Copilot
 * Body: { date, activities, userId }
 */
router.post('/generate-report', async (req, res) => {
  try {
    const { date, activities: dayActivities, userId } = req.body;

    if (!date || !dayActivities) {
      return res.status(400).json({ error: 'Date and activities are required' });
    }

    const report = await copilot.generateDailyReport(dayActivities, date);

    res.status(200).json({
      success: true,
      report,
      userId,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      error: 'Failed to generate report',
      message: error.message
    });
  }
});

/**
 * POST /api/copilot/summarize
 * Summarize text using Copilot
 * Body: { text }
 */
router.post('/summarize', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const summary = await copilot.summarizeText(text);

    res.status(200).json({
      success: true,
      original: text,
      summary
    });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({
      error: 'Failed to summarize text',
      message: error.message
    });
  }
});

/**
 * POST /api/copilot/extract-key-points
 * Extract key points from activities
 * Body: { activities }
 */
router.post('/extract-key-points', async (req, res) => {
  try {
    const { activities } = req.body;

    if (!activities || !Array.isArray(activities)) {
      return res.status(400).json({ error: 'Activities array is required' });
    }

    const keyPoints = await copilot.extractKeyPoints(activities);

    res.status(200).json({
      success: true,
      keyPoints,
      count: keyPoints.length
    });
  } catch (error) {
    console.error('Key point extraction error:', error);
    res.status(500).json({
      error: 'Failed to extract key points',
      message: error.message
    });
  }
});

/**
 * GET /api/copilot/status
 * Check Copilot integration status
 */
router.get('/status', (req, res) => {
  const hasApiKey = !!process.env.AZURE_OPENAI_API_KEY;
  const hasEndpoint = !!process.env.AZURE_OPENAI_ENDPOINT;

  res.status(200).json({
    service: 'Copilot Integration',
    status: hasApiKey && hasEndpoint ? 'configured' : 'not-configured',
    apiConfigured: hasApiKey,
    endpointConfigured: hasEndpoint,
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'default'
  });
});

module.exports = router;
