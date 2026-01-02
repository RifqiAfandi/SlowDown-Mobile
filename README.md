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
- **Authentication**: Firebase Auth + Google Sign-In
- **Database**: Firebase Firestore
- **Navigation**: React Navigation
- **Charts**: react-native-chart-kit
- **Icons**: react-native-vector-icons

## Struktur Folder

```
src/
├── components/
│   ├── admin/          # Komponen untuk admin
│   ├── charts/         # Komponen grafik
│   ├── common/         # Komponen reusable
│   └── time/           # Komponen waktu
├── config/
│   └── firebase.js     # Konfigurasi Firebase
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

### 1. Clone Repository
```bash
git clone <repository-url>
cd SlowDown-Mobile
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Firebase

1. Buat project di [Firebase Console](https://console.firebase.google.com)
2. Aktifkan **Authentication** dengan provider Google
3. Buat **Firestore Database**
4. Copy konfigurasi Firebase ke `src/config/firebase.js`

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Konfigurasi Google Sign-In (Android)

1. Di Firebase Console, tambahkan Android app
2. Download `google-services.json`
3. Letakkan di folder `android/app/`
4. Tambahkan SHA-1 certificate fingerprint ke Firebase

```bash
cd android
./gradlew signingReport
```

### 5. Konfigurasi AndroidManifest.xml

Tambahkan permission berikut untuk fitur overlay:

```xml
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" 
    tools:ignore="ProtectedPermissions" />
```

### 6. Struktur Firestore

**Collection: `users`**
```javascript
{
  id: string,
  email: string,
  displayName: string,
  photoURL: string,
  role: 'admin' | 'user',
  isBlocked: boolean,
  dailyLimitMinutes: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Collection: `usageRecords`**
```javascript
{
  userId: string,
  date: string (YYYY-MM-DD),
  totalMinutes: number,
  apps: {
    instagram: number,
    twitter: number,
    reddit: number,
    youtube: number,
    threads: number
  },
  createdAt: timestamp
}
```

**Collection: `timeRequests`**
```javascript
{
  userId: string,
  userEmail: string,
  requestedMinutes: number,
  reason: string,
  status: 'pending' | 'approved' | 'rejected',
  adminNote: string,
  createdAt: timestamp,
  processedAt: timestamp
}
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