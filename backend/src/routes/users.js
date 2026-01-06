const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/users
 * Get all users (Admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, email, display_name, photo_url, role, 
        daily_limit_minutes, is_blocked, created_at
      FROM users 
      ORDER BY created_at DESC
    `);

    const users = result.rows.map(user => ({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      photoURL: user.photo_url,
      role: user.role,
      dailyLimitMinutes: user.daily_limit_minutes,
      isBlocked: user.is_blocked,
      createdAt: user.created_at,
    }));

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('[Users] Error getting users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users',
    });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID (Admin or self)
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Allow users to get their own info, or admins to get anyone
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const result = await db.query(`
      SELECT 
        id, email, display_name, photo_url, role, 
        daily_limit_minutes, is_blocked, created_at
      FROM users 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const user = result.rows[0];

    // Get today's usage
    const today = new Date().toISOString().split('T')[0];
    const usageResult = await db.query(
      'SELECT total_minutes FROM usage_records WHERE user_id = $1 AND date = $2',
      [id, today]
    );

    const todayUsage = usageResult.rows.length > 0 ? usageResult.rows[0].total_minutes : 0;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        photoURL: user.photo_url,
        role: user.role,
        dailyLimitMinutes: user.daily_limit_minutes,
        isBlocked: user.is_blocked,
        createdAt: user.created_at,
        todayUsageMinutes: todayUsage,
        remainingMinutes: Math.max(0, user.daily_limit_minutes - todayUsage),
      },
    });
  } catch (error) {
    console.error('[Users] Error getting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user',
    });
  }
});

/**
 * PATCH /api/users/:id
 * Update user (Admin only, except some self-updates)
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { dailyLimitMinutes, isBlocked, role } = req.body;

    // Only admin can update other users
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Only admin can change these fields
    if (req.user.role !== 'admin' && (dailyLimitMinutes !== undefined || isBlocked !== undefined || role !== undefined)) {
      return res.status(403).json({
        success: false,
        error: 'Only admin can update these fields',
      });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (dailyLimitMinutes !== undefined) {
      updates.push(`daily_limit_minutes = $${paramCount++}`);
      values.push(dailyLimitMinutes);
    }

    if (isBlocked !== undefined) {
      updates.push(`is_blocked = $${paramCount++}`);
      values.push(isBlocked);
    }

    if (role !== undefined && req.user.role === 'admin') {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await db.query(`
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, display_name, photo_url, role, daily_limit_minutes, is_blocked
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const user = result.rows[0];
    console.log(`[Users] User updated: ${user.email}`);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        photoURL: user.photo_url,
        role: user.role,
        dailyLimitMinutes: user.daily_limit_minutes,
        isBlocked: user.is_blocked,
      },
    });
  } catch (error) {
    console.error('[Users] Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
    });
  }
});

/**
 * GET /api/users/:id/stats
 * Get user usage statistics
 */
router.get('/:id/stats', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 7 } = req.query;

    // Allow users to get their own stats, or admins to get anyone's
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Get usage records for the past N days
    const result = await db.query(`
      SELECT date, total_minutes, app_usage
      FROM usage_records
      WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
      ORDER BY date DESC
    `, [id]);

    const stats = result.rows.map(row => ({
      date: row.date,
      totalMinutes: row.total_minutes,
      appUsage: row.app_usage,
    }));

    // Calculate averages
    const totalMinutes = stats.reduce((sum, s) => sum + s.totalMinutes, 0);
    const averageMinutes = stats.length > 0 ? Math.round(totalMinutes / stats.length) : 0;

    res.json({
      success: true,
      stats: {
        records: stats,
        totalMinutes,
        averageMinutes,
        daysTracked: stats.length,
      },
    });
  } catch (error) {
    console.error('[Users] Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
    });
  }
});

module.exports = router;
