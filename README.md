# Sistem Izin Cuti

Aplikasi manajemen cuti karyawan berbasis web dengan Google Sheets sebagai database.

## Fitur

- ✅ Pengajuan cuti online
- ✅ Approval sistem (admin)
- ✅ Kelola data karyawan
- ✅ Import CSV/Excel
- ✅ Realtime sync dengan Google Sheets
- ✅ Mobile responsive

## Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Update `GOOGLE_SCRIPT_URL` di `src/App.jsx`
4. Run development: `npm run dev`
5. Build production: `npm run build`

## Deploy

Deploy ke Cloudflare Pages:
1. Push ke GitHub
2. Connect repository di Cloudflare Pages
3. Build command: `npm run build`
4. Output directory: `dist`

## Default Login Admin

- Username: `admin`
- Password: `admin123`

**Segera ganti password setelah login pertama!**
