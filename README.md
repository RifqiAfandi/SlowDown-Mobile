# SlowDown Mobile

📱 **Aplikasi anti-doom scrolling untuk membatasi penggunaan media sosial**

## Deskripsi

SlowDown adalah aplikasi mobile yang membantu pengguna mengurangi waktu yang dihabiskan di media sosial dengan membatasi penggunaan harian maksimal 30 menit. Ketika batas waktu tercapai, aplikasi akan menampilkan overlay blocking yang mencegah akses ke aplikasi media sosial yang dikonfigurasi.

### Aplikasi yang Diblokir
- 📸 Instagram
- 🐦 Twitter/X
- 📱 Reddit
- 🎬 YouTube
- 🧵 Threads

## Fitur

### Untuk Pengguna
- ⏱️ Melihat sisa waktu penggunaan hari ini
- 📊 Statistik penggunaan harian dan mingguan
- 🔔 Notifikasi ketika waktu hampir habis
- 📝 Request tambahan waktu ke admin
- 🚫 Blocking overlay ketika waktu habis

### Untuk Admin (rifqitriafandi.2002@gmail.com)
- 👥 Melihat daftar semua pengguna
- 📈 Dashboard statistik global
- ⏰ Menambah/mengurangi waktu pengguna
- ✅ Approve/reject request tambahan waktu
- 🔓 Block/unblock pengguna secara manual

## Tech Stack

- **Framework**: Expo Bare Workflow
- **Language**: JavaScript
- **Platform**: Android Only
- **Authentication**: Google Sign-In + Email Verification
- **Database**: PostgreSQL (via Backend API)
- **HTTP Client**: Axios
- **Navigation**: React Navigation
- **Charts**: react-native-chart-kit
- **Icons**: react-native-vector-icons
- **Config**: react-native-config

## Struktur Folder

```
src/
├── components/
│   ├── admin/          # Komponen untuk admin
│   ├── charts/         # Komponen grafik
│   ├── common/         # Komponen reusable
│   └── time/           # Komponen waktu
├── config/
│   ├── api.js          # Konfigurasi API Client
│   └── env.js          # Konfigurasi Environment
├── constants/
│   └── index.js        # Konstanta aplikasi
├── contexts/
│   ├── AuthContext.js  # Context autentikasi
│   └── TimeTrackingContext.js
├── navigation/
│   ├── AppNavigator.js
│   ├── AdminTabNavigator.js
│   └── UserTabNavigator.js
├── screens/
│   ├── admin/          # Screen untuk admin
│   ├── auth/           # Screen login
│   └── user/           # Screen untuk user
├── services/
│   ├── authService.js
│   ├── timeRequestService.js
│   ├── usageService.js
│   └── userService.js
└── utils/
    ├── dateUtils.js    # Utilitas tanggal (WIB)
    ├── logger.js       # Logging
    └── validation.js   # Validasi input
```

## Setup & Instalasi

### Prerequisites
- Node.js 16+
- npm atau yarn
- Android Studio (untuk Android)
- Expo CLI
- PostgreSQL Database
- Backend API Server (Node.js/Express)

### 1. Clone Repository
```bash
git clone <repository-url>
cd SlowDown-Mobile
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment

1. Copy `.env.example` ke `.env`
```bash
cp .env.example .env
```

2. Update konfigurasi di `.env`:
```env
# Database Configuration
DB_NAME=precision_agriculture
DB_USER=postgres
DB_PASSWORD=2002
DB_HOST=localhost
DB_PORT=5432

# API Configuration
API_BASE_URL=http://localhost:3000/api

# Admin Configuration
ADMIN_EMAIL=rifqitriafandi.2002@gmail.com

# Google OAuth Configuration
GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

### 4. Setup Backend API Server

Lihat `backend/README.js` untuk detail implementasi backend server yang diperlukan.

Backend harus menyediakan endpoint untuk:
- Authentication (Google OAuth & Email Verification)
- User Management
- Usage Tracking
- Time Requests

### 5. Konfigurasi Google Sign-In (Android)

1. Di Google Cloud Console, buat OAuth 2.0 credentials
2. Download `google-services.json` (jika menggunakan Firebase untuk Google Sign-In)
3. Letakkan di folder `android/app/`
4. Tambahkan SHA-1 certificate fingerprint

```bash
cd android
./gradlew signingReport
```

5. Update `GOOGLE_WEB_CLIENT_ID` di `.env` dengan Web Client ID

### 6. Konfigurasi AndroidManifest.xml

Tambahkan permission berikut untuk fitur overlay:

```xml
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" 
    tools:ignore="ProtectedPermissions" />
```

### 7. Database Schema (PostgreSQL)

**Table: `users`**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  photo_url TEXT,
  role VARCHAR(20) DEFAULT 'user',
  daily_limit_minutes INTEGER DEFAULT 30,
  bonus_minutes INTEGER DEFAULT 0,
  today_used_minutes INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT FALSE,
  block_reason TEXT,
  current_date_key VARCHAR(10),
  last_reset_date TIMESTAMP,
  pending_time_request UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);
```

**Table: `usage_logs`**
```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  app_id VARCHAR(50) NOT NULL,
  date_key VARCHAR(10) NOT NULL,
  duration_minutes DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Table: `time_requests`**
```sql
CREATE TABLE time_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  requested_minutes INTEGER NOT NULL,
  approved_minutes INTEGER,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  date_key VARCHAR(10),
  admin_note TEXT,
  processed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);
```

**Table: `email_verifications`**
```sql
CREATE TABLE email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Menjalankan Aplikasi

### Development
```bash
# Metro bundler
npx expo start

# Android
npx expo run:android

# Atau dengan React Native CLI
npx react-native run-android
```

### Build Production
```bash
# Android APK
cd android
./gradlew assembleRelease

# Android AAB (untuk Play Store)
./gradlew bundleRelease
```

## Timezone

Aplikasi menggunakan timezone **WIB (UTC+7)** untuk:
- Reset waktu harian (00:00 WIB)
- Perhitungan statistik
- Tampilan waktu

## Keamanan

- Hanya email `rifqitriafandi.2002@gmail.com` yang memiliki akses admin
- Semua request ke Firestore divalidasi dengan Firebase Rules
- Token autentikasi di-refresh otomatis

## Troubleshooting

### Google Sign-In tidak berjalan
1. Pastikan SHA-1 sudah ditambahkan di Firebase
2. Pastikan `google-services.json` sudah benar
3. Clean build: `cd android && ./gradlew clean`

### Firebase connection error
1. Cek internet connection
2. Pastikan konfigurasi Firebase benar
3. Cek Firebase Rules

### Metro bundler error
```bash
npx expo start --clear
```

## License

MIT License

## Contributing

1. Fork repository
2. Buat branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request