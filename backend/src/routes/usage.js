const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/usage/today
 * Get today's usage for current user
 */
router.get('/today', authenticate, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await db.query(
      'SELECT total_minutes, app_usage FROM usage_records WHERE user_id = $1 AND date = $2',
      [req.user.id, today]
    );

    const usage = result.rows.length > 0 ? result.rows[0] : { total_minutes: 0, app_usage: {} };

    res.json({
      success: true,
      usage: {
        date: today,
        totalMinutes: usage.total_minutes,
        appUsage: usage.app_usage,
        dailyLimit: req.user.dailyLimitMinutes,
        remainingMinutes: Math.max(0, req.user.dailyLimitMinutes - usage.total_minutes),
        isLimitExceeded: usage.total_minutes >= req.user.dailyLimitMinutes,
      },
    });
  } catch (error) {
    console.error('[Usage] Error getting today usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get usage',
    });
  }
});

/**
 * POST /api/usage/sync
 * Sync usage data from device
 */
router.post('/sync', authenticate, async (req, res) => {
  try {
    const { date, totalMinutes, appUsage } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Upsert usage record
    const result = await db.query(`
      INSERT INTO usage_records (user_id, date, total_minutes, app_usage)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, date) 
      DO UPDATE SET 
        total_minutes = GREATEST(usage_records.total_minutes, $3),
        app_usage = $4,
        updated_at = CURRENT_TIMESTAMP
      RETURNING total_minutes, app_usage
    `, [req.user.id, targetDate, totalMinutes || 0, JSON.stringify(appUsage || {})]);

    const usage = result.rows[0];
    const isLimitExceeded = usage.total_minutes >= req.user.dailyLimitMinutes;

    console.log(`[Usage] Synced for user ${req.user.email}: ${usage.total_minutes} minutes`);

    res.json({
      success: true,
      usage: {
        date: targetDate,
        totalMinutes: usage.total_minutes,
        appUsage: usage.app_usage,
        dailyLimit: req.user.dailyLimitMinutes,
        remainingMinutes: Math.max(0, req.user.dailyLimitMinutes - usage.total_minutes),
        isLimitExceeded,
      },
    });
  } catch (error) {
    console.error('[Usage] Error syncing usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync usage',
    });
  }
});

/**
 * POST /api/usage/add
 * Add usage time (called periodically by app)
 */
router.post('/add', authenticate, async (req, res) => {
  try {
    const { minutes, appName } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!minutes || minutes <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid minutes value',
      });
    }

    // Get current usage
    let currentUsage = await db.query(
      'SELECT total_minutes, app_usage FROM usage_records WHERE user_id = $1 AND date = $2',
      [req.user.id, today]
    );

    let appUsage = {};
    let currentMinutes = 0;

    if (currentUsage.rows.length > 0) {
      currentMinutes = currentUsage.rows[0].total_minutes;
      appUsage = currentUsage.rows[0].app_usage || {};
    }

    // Update app-specific usage
    if (appName) {
      appUsage[appName] = (appUsage[appName] || 0) + minutes;
    }

    const newTotal = currentMinutes + minutes;

    // Upsert usage record
    const result = await db.query(`
      INSERT INTO usage_records (user_id, date, total_minutes, app_usage)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, date) 
      DO UPDATE SET 
        total_minutes = $3,
        app_usage = $4,
        updated_at = CURRENT_TIMESTAMP
      RETURNING total_minutes, app_usage
    `, [req.user.id, today, newTotal, JSON.stringify(appUsage)]);

    const usage = result.rows[0];
    const isLimitExceeded = usage.total_minutes >= req.user.dailyLimitMinutes;

    res.json({
      success: true,
      usage: {
        date: today,
        totalMinutes: usage.total_minutes,
        appUsage: usage.app_usage,
        dailyLimit: req.user.dailyLimitMinutes,
        remainingMinutes: Math.max(0, req.user.dailyLimitMinutes - usage.total_minutes),
        isLimitExceeded,
        shouldBlock: isLimitExceeded && !req.user.isBlocked,
      },
    });
  } catch (error) {
    console.error('[Usage] Error adding usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add usage',
    });
  }
});

/**
 * GET /api/usage/history
 * Get usage history for current user
 */
router.get('/history', authenticate, async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const result = await db.query(`
      SELECT date, total_minutes, app_usage
      FROM usage_records
      WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
      ORDER BY date DESC
    `, [req.user.id]);

    const history = result.rows.map(row => ({
      date: row.date,
      totalMinutes: row.total_minutes,
      appUsage: row.app_usage,
    }));

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('[Usage] Error getting history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get history',
    });
  }
});

module.exports = router;
