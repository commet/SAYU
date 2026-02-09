/**
 * Exhibition Pipeline API Routes
 *
 * Endpoints to trigger, monitor, and manage the exhibition data pipeline.
 */

const express = require('express');
const router = express.Router();
const { getExhibitionPipeline } = require('../services/exhibition-pipeline');

/**
 * GET /api/exhibition-pipeline/status
 * Get pipeline status and last run info
 */
router.get('/status', (req, res) => {
  const pipeline = getExhibitionPipeline();
  res.json(pipeline.getStatus());
});

/**
 * POST /api/exhibition-pipeline/run
 * Trigger a full pipeline run (all sources)
 */
router.post('/run', async (req, res) => {
  const pipeline = getExhibitionPipeline();

  if (pipeline.isRunning) {
    return res.status(409).json({
      status: 'conflict',
      message: 'Pipeline is already running'
    });
  }

  // Run async - return immediately
  res.json({
    status: 'started',
    message: 'Full pipeline run started. Check /status for progress.'
  });

  // Execute in background
  pipeline.runFull().catch(err => {
    console.error('[Pipeline Route] Run failed:', err);
  });
});

/**
 * POST /api/exhibition-pipeline/run/:source
 * Trigger a single source collection
 * Valid sources: koreaCulture, seoulOpenData, aic
 */
router.post('/run/:source', async (req, res) => {
  const pipeline = getExhibitionPipeline();
  const { source } = req.params;

  const validSources = ['mmca', 'culture_events', 'exhibition_integrated', 'aic'];
  if (!validSources.includes(source)) {
    return res.status(400).json({
      status: 'error',
      message: `Invalid source. Valid: ${validSources.join(', ')}`
    });
  }

  if (pipeline.isRunning) {
    return res.status(409).json({
      status: 'conflict',
      message: 'Pipeline is already running'
    });
  }

  try {
    const result = await pipeline.runSource(source);
    res.json({ status: 'success', result });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * POST /api/exhibition-pipeline/cron/start
 * Start cron scheduling
 */
router.post('/cron/start', (req, res) => {
  const pipeline = getExhibitionPipeline();
  pipeline.startCron();
  res.json({ status: 'started', message: 'Cron jobs activated' });
});

/**
 * POST /api/exhibition-pipeline/cron/stop
 * Stop cron scheduling
 */
router.post('/cron/stop', (req, res) => {
  const pipeline = getExhibitionPipeline();
  pipeline.stopCron();
  res.json({ status: 'stopped', message: 'Cron jobs deactivated' });
});

module.exports = router;
