# 🏢 Sistem Izin Cuti Karyawan

Aplikasi web untuk mengelola pengajuan cuti karyawan dengan notifikasi email otomatis dan integrasi WhatsApp.

## ✨ Fitur Utama

- ✅ Pengajuan cuti karyawan (Cuti Tahunan & Cuti Sakit)
- ✅ Panel Admin untuk approve/reject pengajuan
- ✅ Notifikasi email otomatis ke admin
- ✅ Integrasi WhatsApp untuk konfirmasi ke pengawas
- ✅ Upload lampiran surat dokter untuk cuti sakit
- ✅ Manajemen data karyawan
- ✅ Import data karyawan dari CSV/Excel
- ✅ Histori pengajuan cuti dengan filter tanggal

## 🚀 Setup Google Apps Script

### 1. Buat Google Spreadsheet
- Buka [Google Sheets](https://sheets.google.com)
- Buat spreadsheet baru
- Buat 3 sheet: `Karyawan`, `Pengajuan Cuti`, `Admin`

### 2. Setup Apps Script
- Di spreadsheet, klik **Extensions** → **Apps Script**
- Hapus code default, copy paste code dari `google-apps-script.js`
- **PENTING:** Ganti `ADMIN_EMAIL` di baris 15 dengan email Anda
- Klik **Save** (icon disket)

### 3. Deploy Web App
- Klik **Deploy** → **New deployment**
- Klik icon ⚙️ → Pilih **Web app**
- Isi deskripsi: "Leave Management API"
- Execute as: **Me**
- Who has access: **Anyone**
- Klik **Deploy**
- **Copy URL** yang muncul (contoh: `https://script.google.com/macros/s/.../exec`)

### 4. Update URL di Aplikasi
- Buka file `src/App.jsx`
- Di baris 9, ganti `GOOGLE_SCRIPT_URL` dengan URL yang Anda copy
- Save file

## 📦 Deploy ke Cloudflare Pages

Aplikasi sudah siap deploy! Ikuti langkah di bawah.

## 🔐 Default Login Admin

- **Username:** admin
- **Password:** admin123

⚠️ Segera ganti password setelah login pertama!

## 📱 Cara Penggunaan

### Untuk Karyawan:
1. Pilih nama karyawan dari daftar
2. Isi form pengajuan cuti
3. Upload lampiran (jika cuti sakit)
4. Submit pengajuan
5. Tunggu approval dari admin

### Untuk Admin:
1. Klik tombol "Admin" di pojok kanan atas
2. Login dengan username & password
3. Review pengajuan cuti yang masuk
4. Approve atau Reject pengajuan
5. Untuk Anggota, klik tombol WhatsApp untuk konfirmasi ke pengawas

## 🛠️ Teknologi

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)
- Google Apps Script (backend)
- Google Sheets (database)

## 📧 Notifikasi Email

Email otomatis akan dikirim ke admin saat ada pengajuan baru berisi:
- Detail karyawan
- Informasi cuti
- Tombol WhatsApp (untuk konfirmasi ke pengawas)

## 🎯 Support

Untuk pertanyaan atau bantuan, hubungi administrator sistem.

---

Made with ❤️ for MUHAMMAD ALFINAS
