# SlowDown Backend

Backend server untuk aplikasi SlowDown menggunakan Node.js, Express, dan PostgreSQL.

## Requirements

- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` ke `.env` dan isi dengan konfigurasi Anda:

```bash
cp .env.example .env
```

Edit file `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=slow_down
DB_USER=postgres
DB_PASSWORD=your_secure_password

PORT=3000
# Generate JWT secret: openssl rand -hex 64
JWT_SECRET=your_generated_jwt_secret_here
GOOGLE_CLIENT_ID=your-google-client-id
ADMIN_EMAIL=your-admin-email@gmail.com
```

### 3. Initialize Database

Pastikan PostgreSQL running, lalu jalankan:

```bash
npm run db:init
```

### 4. Start Server

Development mode (dengan auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/google` - Login dengan Google
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users (Admin)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `GET /api/users/:id/stats` - Get user statistics

### Usage
- `GET /api/usage/today` - Get today's usage
- `POST /api/usage/sync` - Sync usage data
- `POST /api/usage/add` - Add usage time
- `GET /api/usage/history` - Get usage history

### Time Requests
- `POST /api/time-requests` - Create request
- `GET /api/time-requests` - Get requests
- `GET /api/time-requests/pending` - Get pending request
- `PATCH /api/time-requests/:id` - Approve/reject request
- `DELETE /api/time-requests/:id` - Cancel request

### Health Check
- `GET /api/health` - Server health status
