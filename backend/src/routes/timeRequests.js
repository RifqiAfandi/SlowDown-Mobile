const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/time-requests
 * Create a new time request
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { requestedMinutes, reason } = req.body;

    if (!requestedMinutes || requestedMinutes <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid requested minutes',
      });
    }

    // Check for pending request
    const pendingCheck = await db.query(
      "SELECT id FROM time_requests WHERE user_id = $1 AND status = 'pending'",
      [req.user.id]
    );

    if (pendingCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'You already have a pending request',
      });
    }

    const result = await db.query(`
      INSERT INTO time_requests (user_id, requested_minutes, reason)
      VALUES ($1, $2, $3)
      RETURNING id, requested_minutes, reason, status, created_at
    `, [req.user.id, requestedMinutes, reason || '']);

    const request = result.rows[0];
    console.log(`[TimeRequest] New request from ${req.user.email}: ${requestedMinutes} minutes`);

    res.status(201).json({
      success: true,
      request: {
        id: request.id,
        requestedMinutes: request.requested_minutes,
        reason: request.reason,
        status: request.status,
        createdAt: request.created_at,
      },
    });
  } catch (error) {
    console.error('[TimeRequest] Error creating request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create request',
    });
  }
});

/**
 * GET /api/time-requests
 * Get time requests (own requests for users, all for admin)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query;
    let params;

    if (req.user.role === 'admin') {
      // Admin gets all requests with user info
      query = `
        SELECT 
          tr.id, tr.requested_minutes, tr.reason, tr.status, 
          tr.admin_response, tr.created_at, tr.updated_at,
          u.id as user_id, u.email, u.display_name, u.photo_url
        FROM time_requests tr
        JOIN users u ON tr.user_id = u.id
        ${status ? "WHERE tr.status = $1" : ""}
        ORDER BY 
          CASE tr.status 
            WHEN 'pending' THEN 0 
            WHEN 'approved' THEN 1 
            ELSE 2 
          END,
          tr.created_at DESC
      `;
      params = status ? [status] : [];
    } else {
      // Users get only their own requests
      query = `
        SELECT 
          id, requested_minutes, reason, status, 
          admin_response, created_at, updated_at
        FROM time_requests
        WHERE user_id = $1
        ${status ? "AND status = $2" : ""}
        ORDER BY created_at DESC
      `;
      params = status ? [req.user.id, status] : [req.user.id];
    }

    const result = await db.query(query, params);

    const requests = result.rows.map(row => {
      const request = {
        id: row.id,
        requestedMinutes: row.requested_minutes,
        reason: row.reason,
        status: row.status,
        adminResponse: row.admin_response,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      // Include user info for admin
      if (req.user.role === 'admin' && row.user_id) {
        request.user = {
          id: row.user_id,
          email: row.email,
          displayName: row.display_name,
          photoURL: row.photo_url,
        };
      }

      return request;
    });

    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error('[TimeRequest] Error getting requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get requests',
    });
  }
});

/**
 * GET /api/time-requests/pending
 * Get pending request for current user
 */
router.get('/pending', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, requested_minutes, reason, status, created_at
      FROM time_requests
      WHERE user_id = $1 AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        request: null,
      });
    }

    const request = result.rows[0];

    res.json({
      success: true,
      request: {
        id: request.id,
        requestedMinutes: request.requested_minutes,
        reason: request.reason,
        status: request.status,
        createdAt: request.created_at,
      },
    });
  } catch (error) {
    console.error('[TimeRequest] Error getting pending request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pending request',
    });
  }
});

/**
 * PATCH /api/time-requests/:id
 * Update time request status (Admin only)
 */
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "approved" or "rejected"',
      });
    }

    // Get the request
    const requestResult = await db.query(
      'SELECT user_id, requested_minutes, status FROM time_requests WHERE id = $1',
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      });
    }

    const request = requestResult.rows[0];

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Request has already been processed',
      });
    }

    // Update the request
    await db.query(`
      UPDATE time_requests 
      SET status = $1, admin_id = $2, admin_response = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [status, req.user.id, adminResponse || '', id]);

    // If approved, add time to user's daily limit
    if (status === 'approved') {
      await db.query(`
        UPDATE users 
        SET daily_limit_minutes = daily_limit_minutes + $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [request.requested_minutes, request.user_id]);

      console.log(`[TimeRequest] Approved: +${request.requested_minutes} minutes for user ${request.user_id}`);
    } else {
      console.log(`[TimeRequest] Rejected: request ${id}`);
    }

    res.json({
      success: true,
      message: `Request ${status}`,
    });
  } catch (error) {
    console.error('[TimeRequest] Error updating request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update request',
    });
  }
});

/**
 * DELETE /api/time-requests/:id
 * Cancel a pending request (user can cancel their own)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM time_requests WHERE id = $1 AND user_id = $2 AND status = 'pending' RETURNING id",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found or cannot be cancelled',
      });
    }

    console.log(`[TimeRequest] Cancelled: request ${id}`);

    res.json({
      success: true,
      message: 'Request cancelled',
    });
  } catch (error) {
    console.error('[TimeRequest] Error cancelling request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel request',
    });
  }
});

module.exports = router;
