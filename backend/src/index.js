const express = require('express');
const cors = require('cors');
const config = require('./config');
const db = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const usageRoutes = require('./routes/usage');
const timeRequestRoutes = require('./routes/timeRequests');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server is unhealthy',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/time-requests', timeRequestRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server] Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await db.query('SELECT 1');
    console.log('[Server] Database connection verified');

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`\n🚀 SlowDown Backend Server`);
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   Port: ${config.port}`);
      console.log(`   API URL: http://localhost:${config.port}/api`);
      console.log(`   Admin Email: ${config.adminEmail}`);
      console.log(`\n📡 Ready to accept connections!\n`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error.message);
    console.error('\n⚠️  Make sure PostgreSQL is running and database is initialized.');
    console.error('   Run: npm run db:init\n');
    process.exit(1);
  }
};

startServer();
