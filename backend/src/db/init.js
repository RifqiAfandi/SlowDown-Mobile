/**
 * Database Initialization Script
 * Run: npm run db:init
 */

require('dotenv').config();
const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  // Connect to postgres first to create the database
  database: 'postgres',
});

const createDatabase = async () => {
  try {
    // Check if database exists
    const dbCheck = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [config.db.database]
    );

    if (dbCheck.rows.length === 0) {
      console.log(`Creating database: ${config.db.database}`);
      await pool.query(`CREATE DATABASE ${config.db.database}`);
      console.log('Database created successfully');
    } else {
      console.log(`Database ${config.db.database} already exists`);
    }
  } catch (error) {
    console.error('Error creating database:', error.message);
    throw error;
  }
};

const createTables = async () => {
  // Connect to the actual database
  const dbPool = new Pool({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
  });

  try {
    // Create users table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        photo_url TEXT,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        daily_limit_minutes INTEGER DEFAULT 30,
        is_blocked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "users" created/verified');

    // Create usage_records table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS usage_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        total_minutes INTEGER DEFAULT 0,
        app_usage JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      )
    `);
    console.log('Table "usage_records" created/verified');

    // Create time_requests table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS time_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        requested_minutes INTEGER NOT NULL,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        admin_id UUID REFERENCES users(id),
        admin_response TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "time_requests" created/verified');

    // Create sessions table for tracking active sessions
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        device_id VARCHAR(255),
        token_hash VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "sessions" created/verified');

    // Create indexes
    await dbPool.query(`
      CREATE INDEX IF NOT EXISTS idx_usage_records_user_date ON usage_records(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_time_requests_user ON time_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_time_requests_status ON time_requests(status);
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    `);
    console.log('Indexes created/verified');

    // Create admin user if not exists
    const adminCheck = await dbPool.query(
      'SELECT id FROM users WHERE email = $1',
      [config.adminEmail]
    );

    if (adminCheck.rows.length === 0) {
      await dbPool.query(
        `INSERT INTO users (email, display_name, role, daily_limit_minutes) 
         VALUES ($1, $2, 'admin', 999)`,
        [config.adminEmail, 'Admin']
      );
      console.log(`Admin user created: ${config.adminEmail}`);
    } else {
      // Make sure admin has admin role
      await dbPool.query(
        'UPDATE users SET role = $1 WHERE email = $2',
        ['admin', config.adminEmail]
      );
      console.log(`Admin user verified: ${config.adminEmail}`);
    }

    console.log('\n✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('Error creating tables:', error.message);
    throw error;
  } finally {
    await dbPool.end();
  }
};

const init = async () => {
  try {
    console.log('🚀 Starting database initialization...\n');
    await createDatabase();
    await createTables();
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

init();
