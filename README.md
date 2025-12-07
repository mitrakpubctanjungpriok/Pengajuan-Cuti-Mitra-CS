# Sistem Izin Cuti Karyawan

Aplikasi manajemen cuti karyawan berbasis web dengan integrasi Google Sheets dan notifikasi email otomatis.

## 🚀 Fitur Utama

- ✅ Login karyawan dengan ID/NIP
- ✅ Input email untuk notifikasi
- ✅ Pengajuan cuti lengkap dengan form terstruktur
- ✅ Notifikasi email otomatis ke admin saat ada pengajuan
- ✅ Notifikasi email otomatis ke karyawan saat di-approve/reject
- ✅ Panel admin untuk kelola pengajuan & karyawan
- ✅ Import data karyawan via CSV
- ✅ Realtime sync dengan Google Sheets
- ✅ Mobile responsive

## 🔧 Setup

### Prerequisites
- Google Account (untuk Google Sheets & Apps Script)
- GitHub Account
- Cloudflare Account

### Langkah Deploy

1. **Setup Google Apps Script**
   - Buat Google Spreadsheet baru
   - Buka Extensions → Apps Script
   - Copy kode dari `google-apps-script.js`
   - Deploy sebagai Web App
   - Copy URL Web App

2. **Update Konfigurasi**
   - Edit `src/App.jsx`
   - Ganti `GOOGLE_SCRIPT_URL` dengan URL Web App Anda

3. **Deploy ke Cloudflare Pages**
   - Push repository ke GitHub
   - Connect ke Cloudflare Pages
   - Build settings:
     - Framework: Vite
     - Build command: `npm run build`
     - Build output: `dist`

4. **Import Data Karyawan**
   - Buka Google Sheets
   - Copy data dari `data-karyawan.csv`
   - Paste di sheet "Karyawan"

## 🔐 Login Default

**Admin:**
- Username:
- Password:

**Karyawan:**
- Login dengan ID/NIP (contoh: 192, 2, 89, dll)

## 📧 Konfigurasi Email

Edit email admin di Google Apps Script:
```javascript
const ADMIN_EMAIL = 'your-email@example.com';
```

## 📱 URL Production

Setelah deploy: `https://sistem-izin-cuti.pages.dev`

## 📄 Lisensi

MIT License
