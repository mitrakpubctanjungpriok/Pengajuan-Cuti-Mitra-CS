# 📋 Sistem Izin Cuti Online

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

Aplikasi web single-page untuk mengelola pengajuan cuti karyawan dengan integrasi Google Sheets sebagai database dan notifikasi email otomatis.

🔗 **Live Demo:** [https://pengajuan-cuti-mitra-cs.pages.dev/](https://pengajuan-cuti-mitra-cs.pages.dev/)

---

## 📸 Preview

### Halaman Utama
```
┌─────────────────────────────────────────────────────────┐
│  📅 SISTEM IZIN CUTI          [CEK STATUS] [ADMIN]      │
│  SENIN, 9 JUNI 2025                      14:30:25 WIB   │
├─────────────────────────────────────────────────────────┤
│  🔍 CARI NAMA KARYAWAN...                               │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ 👤 BUDI     │ │ 👤 SITI     │ │ 👤 AHMAD    │       │
│  │ Sisa: 12    │ │ Sisa: 10    │ │ Sisa: 8     │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### Panel Admin
```
┌─────────────────────────────────────────────────────────┐
│  ⚙️ PANEL ADMIN                            [LOGOUT]     │
├─────────────────────────────────────────────────────────┤
│  [🔄 REFRESH] [🔐 PASSWORD] [👥 KARYAWAN] [🏠 BERANDA]  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ MENUNGGU │ │ DISETUJUI│ │ DITOLAK  │                │
│  │    5     │ │    12    │ │    3     │                │
│  └──────────┘ └──────────┘ └──────────┘                │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Fitur Utama

### 👤 Untuk Karyawan
- ✅ Pilih nama dari daftar karyawan
- ✅ Form pengajuan cuti yang lengkap
- ✅ Upload foto surat dokter (untuk cuti sakit)
- ✅ Cek status pengajuan cuti
- ✅ Notifikasi email saat mengajukan & saat diproses

### 🔐 Untuk Admin
- ✅ Login dengan username & password
- ✅ Lihat semua pengajuan yang menunggu persetujuan
- ✅ Setujui atau tolak pengajuan
- ✅ Kelola data karyawan (CRUD)
- ✅ Ganti password admin
- ✅ Filter riwayat berdasarkan tanggal
- ✅ Auto-refresh data setiap 30 detik
- ✅ Kirim pesan WhatsApp ke pengawas

### 📧 Notifikasi Email
- ✅ Email ke admin saat ada pengajuan baru
- ✅ Email ke karyawan saat mengajukan cuti
- ✅ Email ke karyawan saat pengajuan disetujui/ditolak
- ✅ Template email profesional dengan HTML

### 📱 Responsive Design
- ✅ Tampilan optimal di desktop & mobile
- ✅ Touch-friendly untuk perangkat mobile
- ✅ Jam & tanggal real-time

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
|----------|-----------|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Styling | Tailwind CSS (CDN) |
| Font | Google Fonts (Inter) |
| Backend | Google Apps Script |
| Database | Google Sheets |
| Hosting | Cloudflare Pages |
| Email | Gmail (via Apps Script) |

---

## 📁 Struktur File

```
📦 sistem-cuti/
├── 📄 index.html        # Aplikasi frontend (single-page)
├── 📄 Code.gs           # Backend Google Apps Script
└── 📄 README.md         # Dokumentasi
```

---

## ⚙️ Instalasi & Setup

### Langkah 1: Buat Google Spreadsheet

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru
3. Buat 3 sheet dengan nama:
   - `Karyawan`
   - `Pengajuan Cuti`
   - `Admin`

### Langkah 2: Setup Sheet Karyawan

Buat header di baris 1:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| ID | Nama | Sisa Cuti | Cuti Terpakai | Nama Pengawas | No. WA Pengawas |

Contoh data:

| ID | Nama | Sisa Cuti | Cuti Terpakai | Nama Pengawas | No. WA Pengawas |
|----|------|-----------|---------------|---------------|-----------------|
| 001 | BUDI SANTOSO | 12 | 0 | PAK AHMAD | 628123456789 |
| 002 | SITI RAHAYU | 10 | 2 | PAK AHMAD | 628123456789 |

### Langkah 3: Setup Sheet Pengajuan Cuti

Buat header di baris 1 (18 kolom):

```
ID | Nama Karyawan | Jabatan | Unit Kerja | Jenis Cuti | Alasan | Lama Pengambilan | Tanggal Mulai | Tanggal Selesai | Alamat | No. Telepon | Email Karyawan | Petugas Pengganti | Persetujuan Pengawas | No. WA Pengawas | Foto | Status | Tanggal Pengajuan
```

### Langkah 4: Setup Sheet Admin

| A | B |
|---|---|
| Username | Password |
| admin | admin123 |

### Langkah 5: Setup Google Apps Script

1. Buka [Google Apps Script](https://script.google.com)
2. Buat project baru
3. Hapus kode default, paste isi file `Code.gs`
4. Ganti `SPREADSHEET_ID` dengan ID spreadsheet Anda:

```javascript
const CONFIG = {
  SPREADSHEET_ID: 'ID_SPREADSHEET_ANDA',
  ADMIN_EMAIL: 'email_admin@gmail.com',
  ...
};
```

> 💡 **Cara mendapatkan Spreadsheet ID:**
> Dari URL `https://docs.google.com/spreadsheets/d/ABC123XYZ/edit`
> ID-nya adalah `ABC123XYZ`

### Langkah 6: Setup Permission Email

1. Di Apps Script, klik ⚙️ **Project Settings**
2. Centang ✅ **Show "appsscript.json" manifest file**
3. Buka file `appsscript.json`, ganti dengan:

```json
{
  "timeZone": "Asia/Jakarta",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/gmail.send"
  ]
}
```

4. Jalankan fungsi `testEmail` untuk memberikan izin
5. Klik **Review Permissions** → Pilih akun → **Allow**

### Langkah 7: Deploy Apps Script

1. Klik **Deploy** → **New Deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Klik **Deploy**
6. Copy URL deployment

### Langkah 8: Update Frontend

Di file `index.html`, update CONFIG:

```javascript
const CONFIG = {
  GOOGLE_SCRIPT_URL: 'URL_DEPLOYMENT_ANDA',
  ADMIN_EMAIL: 'email_admin@gmail.com',
  ...
};
```

### Langkah 9: Deploy Frontend

Upload `index.html` ke hosting pilihan Anda:
- [Cloudflare Pages](https://pages.cloudflare.com)
- [Netlify](https://netlify.com)
- [Vercel](https://vercel.com)
- [GitHub Pages](https://pages.github.com)

---

## 📖 Cara Penggunaan

### Untuk Karyawan

1. Buka website
2. Klik nama Anda dari daftar
3. Isi form pengajuan cuti:
   - Pilih jabatan & unit kerja
   - Pilih jenis cuti
   - Isi alasan
   - Pilih lama cuti (1-2 hari)
   - Pilih tanggal mulai (tanggal selesai otomatis)
   - Isi alamat & nomor telepon
   - Isi email Anda (untuk notifikasi)
   - Isi nama petugas pengganti
   - Upload surat dokter (jika cuti sakit)
4. Klik **KIRIM PENGAJUAN**
5. Tunggu email konfirmasi

### Untuk Cek Status

1. Klik tombol **CEK STATUS** di halaman utama
2. Pilih nama Anda
3. Lihat riwayat pengajuan dan statusnya

### Untuk Admin

1. Klik tombol **ADMIN** di halaman utama
2. Login dengan username & password
3. Lihat pengajuan yang menunggu persetujuan
4. Klik **✅ SETUJUI** atau **❌ TOLAK**
5. Klik **👥 KARYAWAN** untuk kelola data karyawan

---

## 🔐 Default Login Admin

| Username | Password |
|----------|----------|
| admin | admin123 |

> ⚠️ **Penting:** Segera ganti password setelah login pertama!

---

## 📊 Struktur Database

### Sheet: Karyawan (6 kolom)
| Kolom | Keterangan |
|-------|------------|
| ID | NIP/NIK karyawan |
| Nama | Nama lengkap (UPPERCASE) |
| Sisa Cuti | Sisa cuti (12 - Terpakai) |
| Cuti Terpakai | Jumlah cuti yang sudah digunakan |
| Nama Pengawas | Nama atasan/pengawas |
| No. WA Pengawas | Nomor WhatsApp (format: 628xxx) |

### Sheet: Pengajuan Cuti (18 kolom)
| Kolom | Keterangan |
|-------|------------|
| A | ID Karyawan |
| B | Nama Karyawan |
| C | Jabatan |
| D | Unit Kerja |
| E | Jenis Cuti |
| F | Alasan |
| G | Lama Pengambilan |
| H | Tanggal Mulai |
| I | Tanggal Selesai |
| J | Alamat |
| K | No. Telepon |
| L | Email Karyawan |
| M | Petugas Pengganti |
| N | Persetujuan Pengawas |
| O | No. WA Pengawas |
| P | Foto (Base64) |
| Q | Status |
| R | Tanggal Pengajuan |

### Sheet: Admin (2 kolom)
| Kolom | Keterangan |
|-------|------------|
| Username | Username admin |
| Password | Password admin |

---

## 🎨 Kustomisasi Warna

Warna dapat diubah di bagian Tailwind config:

| Warna | Kode | Penggunaan |
|-------|------|------------|
| Primary | Indigo-600 (#4F46E5) | Tombol utama, link |
| Secondary | Slate-600 (#475569) | Tombol sekunder |
| Success | Green-600 (#10B981) | Status disetujui |
| Warning | Yellow-600 (#F59E0B) | Status menunggu |
| Danger | Red-600 (#EF4444) | Status ditolak |

---

## 🐛 Troubleshooting

### Email tidak terkirim
1. Pastikan sudah setup `appsscript.json` dengan benar
2. Jalankan `testEmail` untuk memberikan izin
3. Cek folder SPAM

### Data tidak muncul
1. Pastikan nama sheet persis: `Karyawan`, `Pengajuan Cuti`, `Admin`
2. Pastikan SPREADSHEET_ID sudah benar
3. Pastikan sudah deploy ulang setelah update kode

### Error saat submit
1. Cek Console browser (F12)
2. Lihat log di Apps Script (View → Executions)

---

## 📝 Lisensi

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan.

---

## 👨‍💻 Kontributor

- **Developer:** [Nama Anda]
- **Organisasi:** KPU BC Tanjung Priok

---

## 📞 Kontak & Support

Jika ada pertanyaan atau masalah, silakan:
- 📧 Email: mitrakpubctanjungpriok@gmail.com
- 🌐 Website: [https://pengajuan-cuti-mitra-cs.pages.dev/](https://pengajuan-cuti-mitra-cs.pages.dev/)

---

<p align="center">

⭐ **Jangan lupa beri Star jika project ini membantu Anda!**

Made with ❤️ for MUHAMMAD ALFINAS

**Version:** 1.0.0  
**Last Updated:** December 2024
</p>
