const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../db');
const config = require('../config');

const router = express.Router();
const googleClient = new OAuth2Client(config.googleClientId);

/**
 * POST /api/auth/google
 * Authenticate with Google ID token
 */
router.post('/google', async (req, res) => {
  try {
    const { idToken, email, displayName, photoURL } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token is required',
      });
    }

    // Verify Google ID token
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: config.googleClientId,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('[Auth] Google token verification failed:', verifyError.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid Google token',
      });
    }

    const googleEmail = payload.email;
    const googleName = payload.name || displayName || googleEmail.split('@')[0];
    const googlePhoto = payload.picture || photoURL;

    console.log(`[Auth] Google sign-in for: ${googleEmail}`);

    // Check if user exists
    let result = await db.query(
      'SELECT id, email, display_name, photo_url, role, daily_limit_minutes, is_blocked FROM users WHERE email = $1',
      [googleEmail]
    );

    let user;
    let isNewUser = false;

    if (result.rows.length === 0) {
      // Create new user
      const role = googleEmail === config.adminEmail ? 'admin' : 'user';
      const dailyLimit = role === 'admin' ? 999 : 30;

      const insertResult = await db.query(
        `INSERT INTO users (email, display_name, photo_url, role, daily_limit_minutes) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, email, display_name, photo_url, role, daily_limit_minutes, is_blocked`,
        [googleEmail, googleName, googlePhoto, role, dailyLimit]
      );

      user = insertResult.rows[0];
      isNewUser = true;
      console.log(`[Auth] New user created: ${googleEmail} (${role})`);
    } else {
      user = result.rows[0];

      // Update user info if changed
      await db.query(
        'UPDATE users SET display_name = $1, photo_url = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [googleName, googlePhoto, user.id]
      );
      
      console.log(`[Auth] Existing user signed in: ${googleEmail}`);
    }

    // Check if blocked
    if (user.is_blocked) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been blocked',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Return user data
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        photoURL: user.photo_url,
        role: user.role,
        dailyLimitMinutes: user.daily_limit_minutes,
        isBlocked: user.is_blocked,
        isNewUser,
      },
    });
  } catch (error) {
    console.error('[Auth] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Get user from database
    const result = await db.query(
      'SELECT id, email, display_name, photo_url, role, daily_limit_minutes, is_blocked FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const user = result.rows[0];

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
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }
    console.error('[Auth] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user info',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout (invalidate session)
 */
router.post('/logout', async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // Here we can log the event or invalidate sessions if needed
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

module.exports = router;
