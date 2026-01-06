/**
 * Backend API Server Configuration
 * 
 * This is a reference template for the backend server that needs to be set up
 * to work with the SlowDown mobile app.
 * 
 * The backend should be built using Node.js/Express with PostgreSQL database.
 * 
 * Database: PostgreSQL
 * All credentials should be stored in .env file:
 * - DB_NAME: from environment
 * - DB_USER: from environment
 * - DB_PASSWORD: from environment (never hardcode!)
 * - DB_HOST: localhost
 * - DB_PORT: 5432
 * 
 * Required API Endpoints:
 * 
 * Authentication:
 * - POST /api/auth/google - Google OAuth authentication
 * - POST /api/auth/email/send-verification - Send email verification code
 * - POST /api/auth/email/verify - Verify email code and login
 * - POST /api/auth/logout - Logout user
 * - GET /api/auth/me - Get current user data
 * 
 * Users:
 * - POST /api/users - Create or update user
 * - GET /api/users - Get all users (admin only)
 * - GET /api/users/search?q=term - Search users
 * - GET /api/users/:id - Get user by ID
 * - PATCH /api/users/:id - Update user
 * - POST /api/users/:id/usage - Update user usage
 * - POST /api/users/:id/bonus - Add/reduce bonus time
 * - POST /api/users/:id/block - Block user
 * - POST /api/users/:id/unblock - Unblock user
 * 
 * Usage:
 * - POST /api/usage/log - Log app usage
 * - GET /api/usage/:userId/daily?dateKey=YYYY-MM-DD - Get daily usage
 * - GET /api/usage/:userId/weekly - Get weekly usage
 * - GET /api/usage/:userId/stats - Get usage statistics
 * 
 * Time Requests:
 * - POST /api/time-requests - Create time request
 * - GET /api/time-requests/pending - Get pending requests (admin)
 * - GET /api/time-requests/user/:userId - Get user's request history
 * - POST /api/time-requests/:id/approve - Approve request (admin)
 * - POST /api/time-requests/:id/reject - Reject request (admin)
 * 
 * PostgreSQL Tables Required:
 * 
 * users:
 * - id (UUID, PRIMARY KEY)
 * - email (VARCHAR, UNIQUE)
 * - display_name (VARCHAR)
 * - photo_url (TEXT)
 * - role (VARCHAR) - 'admin' or 'user'
 * - daily_limit_minutes (INTEGER, DEFAULT 30)
 * - bonus_minutes (INTEGER, DEFAULT 0)
 * - today_used_minutes (INTEGER, DEFAULT 0)
 * - is_blocked (BOOLEAN, DEFAULT FALSE)
 * - block_reason (TEXT)
 * - current_date_key (VARCHAR)
 * - last_reset_date (TIMESTAMP)
 * - pending_time_request (UUID, FK)
 * - created_at (TIMESTAMP)
 * - updated_at (TIMESTAMP)
 * - last_login_at (TIMESTAMP)
 * 
 * usage_logs:
 * - id (UUID, PRIMARY KEY)
 * - user_id (UUID, FK)
 * - app_id (VARCHAR)
 * - date_key (VARCHAR)
 * - duration_minutes (DECIMAL)
 * - created_at (TIMESTAMP)
 * - updated_at (TIMESTAMP)
 * 
 * time_requests:
 * - id (UUID, PRIMARY KEY)
 * - user_id (UUID, FK)
 * - requested_minutes (INTEGER)
 * - approved_minutes (INTEGER)
 * - reason (TEXT)
 * - status (VARCHAR) - 'pending', 'approved', 'rejected'
 * - date_key (VARCHAR)
 * - admin_note (TEXT)
 * - processed_by (UUID, FK)
 * - created_at (TIMESTAMP)
 * - updated_at (TIMESTAMP)
 * - processed_at (TIMESTAMP)
 * 
 * email_verifications:
 * - id (UUID, PRIMARY KEY)
 * - email (VARCHAR)
 * - code (VARCHAR)
 * - expires_at (TIMESTAMP)
 * - created_at (TIMESTAMP)
 * - used (BOOLEAN, DEFAULT FALSE)
 */

module.exports = {
  info: 'Backend API Server Reference - See comments above for implementation details'
};
