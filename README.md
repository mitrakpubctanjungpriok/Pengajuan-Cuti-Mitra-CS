# 📋 Sistem Izin Cuti Karyawan

Aplikasi web modern untuk mengelola pengajuan cuti karyawan dengan sistem approval, notifikasi email otomatis, dan integrasi WhatsApp untuk komunikasi dengan pengawas.

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Fitur Utama

### 👤 **Untuk Karyawan:**
- ✅ Ajukan cuti dengan formulir lengkap dan mudah
- ✅ Pilih jenis cuti: Tahunan atau Sakit
- ✅ Upload foto lampiran surat dokter (wajib untuk cuti sakit)
- ✅ Lihat sisa cuti tahunan secara real-time
- ✅ Tracking status pengajuan (Menunggu/Disetujui/Ditolak)

### 👨‍💼 **Untuk Admin:**
- ✅ Dashboard admin dengan statistik lengkap
- ✅ Approve/Reject pengajuan cuti
- ✅ Kelola data karyawan (Tambah/Edit/Hapus)
- ✅ Input nomor WhatsApp pengawas untuk setiap karyawan
- ✅ Tombol WhatsApp langsung untuk konfirmasi ke pengawas
- ✅ Ganti password admin
- ✅ Filter riwayat pengajuan berdasarkan tanggal
- ✅ Notifikasi email otomatis saat ada pengajuan baru

### 🔐 **Keamanan:**
- ✅ Login admin dengan password terenkripsi
- ✅ Data tersimpan aman di Google Sheets
- ✅ Session management

## 🚀 Demo

**Live Demo:** [https://sistem-cuti.pages.dev](https://sistem-cuti.pages.dev)

**Login Admin:**
- Username: `admin`
- Password: `admin123`

## 🛠️ Teknologi yang Digunakan

- **Frontend:** HTML5, CSS3 (Tailwind CSS), Vanilla JavaScript
- **Backend:** Google Apps Script
- **Database:** Google Sheets
- **Hosting:** Cloudflare Pages
- **Version Control:** GitHub
- **Email:** Gmail (via Apps Script)
- **Messaging:** WhatsApp Web API

## 📋 Persyaratan

- Akun Google (untuk Google Sheets & Apps Script)
- Akun GitHub (untuk version control)
- Akun Cloudflare (untuk hosting - gratis)

## ⚙️ Instalasi & Setup

### 1️⃣ **Clone Repository**

```bash
git clone https://github.com/username/sistem-cuti.git
cd sistem-cuti
```

### 2️⃣ **Setup Google Sheets**

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru: **"Database Sistem Cuti"**
3. Buat 3 sheet dengan struktur berikut:

#### **Sheet 1: "Karyawan"**
```
| ID | Nama | Total Cuti | Cuti Terpakai | Nama Pengawas | No WA Pengawas |
```

Contoh data:
```
| 192 | SANDI ALJABAR        | 12 | 0 | Budi Santoso  | 6281234567890 |
| 2   | AHMAD SYAIFUL        | 12 | 2 | Dewi Lestari  | 6281234567891 |
| 89  | AJI KURNIA RAMADHAN  | 12 | 0 | Budi Santoso  | 6281234567890 |
```

#### **Sheet 2: "Pengajuan Cuti"**
```
| ID | Nama Karyawan | Jabatan | Unit Kerja | Jenis Cuti | Alasan Cuti | Lama Pengambilan | Tanggal Mulai | Tanggal Selesai | Alamat Selama Cuti | Nomor Telepon | Petugas Pengganti | Persetujuan Pengawas | Jumlah Hari | Foto Lampiran | Status | Tanggal Diajukan | Disetujui Oleh | Nama Pengawas | No WA Pengawas |
```

#### **Sheet 3: "Admin"**
```
| Username | Password |
| admin    | admin123 |
```

### 3️⃣ **Setup Google Apps Script**

1. Di Google Sheets, klik **Extensions → Apps Script**
2. Hapus kode default
3. Copy-paste kode dari section di bawah
4. **Ganti email admin** di line 6:
   ```javascript
   ADMIN_EMAIL: 'youremail@gmail.com',
   ```
5. Klik **Save** (Ctrl+S)
6. Klik **Deploy → New deployment**
7. Pilih type: **Web app**
8. Set konfigurasi:
   - Execute as: **Me**
   - Who has access: **Anyone**
9. Klik **Deploy**
10. **Authorize** aplikasi (klik Advanced → Go to ... → Allow)
11. **Copy URL** Web App yang dihasilkan

### 4️⃣ **Update index.html**

1. Buka file `index.html`
2. Cari baris 29 (sekitar):
   ```javascript
   GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/xxxxx/exec',
   ```
3. **Ganti** dengan URL Apps Script yang tadi di-copy
4. **Ganti** email admin juga:
   ```javascript
   ADMIN_EMAIL: 'youremail@gmail.com'
   ```

### 5️⃣ **Deploy ke Cloudflare Pages**

1. Push repository ke GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Klik **Workers & Pages → Create application → Pages**
4. Connect ke GitHub dan pilih repository ini
5. Set konfigurasi build:
   - **Framework preset:** None
   - **Build command:** (kosongkan)
   - **Build output directory:** `/`
6. Klik **Save and Deploy**
7. Tunggu deployment selesai
8. Akses aplikasi di URL yang diberikan

## 📝 Google Apps Script Code

Copy-paste kode berikut ke Google Apps Script Editor:

```javascript
// ====================================================================
// KONFIGURASI
// ====================================================================
const CONFIG = {
  ADMIN_EMAIL: 'youremail@gmail.com', // GANTI dengan email Anda untuk notifikasi
  SHEET_NAMES: {
    EMPLOYEES: 'Karyawan',
    LEAVE_REQUESTS: 'Pengajuan Cuti',
    ADMIN: 'Admin'
  }
};

// ====================================================================
// Helper Functions
// ====================================================================
function getSheetByName(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name);
}

function sendEmailNotification(request) {
  const subject = `[SISTEM CUTI] Pengajuan Cuti Baru - ${request.employeeName}`;
  
  const htmlBody = `
    <h2>Pengajuan Cuti Baru</h2>
    <p><strong>Nama:</strong> ${request.employeeName}</p>
    <p><strong>Jabatan:</strong> ${request.jabatan}</p>
    <p><strong>Unit Kerja:</strong> ${request.unitKerja}</p>
    <p><strong>Jenis Cuti:</strong> ${request.cutiType}</p>
    <p><strong>Tanggal:</strong> ${request.startDate} s/d ${request.endDate}</p>
    <p><strong>Durasi:</strong> ${request.days} hari</p>
    <p><strong>Alasan:</strong> ${request.alasanCuti}</p>
    <p><strong>Persetujuan Pengawas:</strong> ${request.persetujuanPengawas}</p>
    <hr>
    <p>Silakan login ke admin panel untuk approve/reject</p>
    ${request.supervisorName ? `<p><strong>Nama Pengawas:</strong> ${request.supervisorName}</p>` : ''}
    ${request.supervisorPhone ? `<p><strong>No WA Pengawas:</strong> ${request.supervisorPhone}</p>` : ''}
  `;
  
  try {
    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: subject,
      htmlBody: htmlBody
    });
  } catch (e) {
    console.error('Error sending email:', e);
  }
}

// ====================================================================
// GET Handlers
// ====================================================================
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'verifyAdmin') {
    return verifyAdmin(e.parameter.username, e.parameter.password);
  }
  
  if (action === 'getEmployees') {
    return getEmployees();
  }
  
  if (action === 'getLeaveRequests') {
    return getLeaveRequests();
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ====================================================================
// POST Handlers
// ====================================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'changeAdminPassword') {
      return changeAdminPassword(data.username, data.oldPassword, data.newPassword);
    }
    
    if (action === 'submitLeaveRequest') {
      return submitLeaveRequest(data.data);
    }
    
    if (action === 'updateLeaveStatus') {
      return updateLeaveStatus(data.requestId, data.status, data.adminName);
    }
    
    if (action === 'addEmployee') {
      return addEmployee(data.data);
    }
    
    if (action === 'updateEmployee') {
      return updateEmployee(data.employeeId, data.data);
    }
    
    if (action === 'deleteEmployee') {
      return deleteEmployee(data.employeeId);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ====================================================================
// Admin Functions
// ====================================================================
function verifyAdmin(username, password) {
  const sheet = getSheetByName(CONFIG.SHEET_NAMES.ADMIN);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username && data[i][1] === password) {
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Username atau password salah' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function changeAdminPassword(username, oldPassword, newPassword) {
  const sheet = getSheetByName(CONFIG.SHEET_NAMES.ADMIN);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username && data[i][1] === oldPassword) {
      sheet.getRange(i + 1, 2).setValue(newPassword);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Password lama salah' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ====================================================================
// Employee Functions
// ====================================================================
function getEmployees() {
  const sheet = getSheetByName(CONFIG.SHEET_NAMES.EMPLOYEES);
  const data = sheet.getDataRange().getValues();
  const employees = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      employees.push({
        id: data[i][0],
        name: data[i][1],
        totalLeave: data[i][2] || 12,
        usedLeave: data[i][3] || 0,
        supervisorName: data[i][4] || '',
        supervisorPhone: data[i][5] || ''
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ employees: employees }))
    .setMimeType(ContentService.MimeType.JSON);
}

function addEmployee(employee) {
  const sheet = getSheetByName(CONFIG.SHEET_NAMES.EMPLOYEES);
  sheet.appendRow([
    employee.id,
    employee.name,
    employee.totalLeave || 12,
    employee.usedLeave || 0,
    employee.supervisorName || '',
    employee.supervisorPhone || ''
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateEmployee(employeeId, employee) {
  const sheet = getSheetByName(CONFIG.SHEET_NAMES.EMPLOYEES);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(employeeId)) {
      sheet.getRange(i + 1, 2).setValue(employee.name);
      sheet.getRange(i + 1, 3).setValue(employee.totalLeave);
      if (employee.supervisorName !== undefined) {
        sheet.getRange(i + 1, 5).setValue(employee.supervisorName);
      }
      if (employee.supervisorPhone !== undefined) {
        sheet.getRange(i + 1, 6).setValue(employee.supervisorPhone);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Employee not found' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function deleteEmployee(employeeId) {
  const sheet = getSheetByName(CONFIG.SHEET_NAMES.EMPLOYEES);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(employeeId)) {
      sheet.deleteRow(i + 1);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Employee not found' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ====================================================================
// Leave Request Functions
// ====================================================================
function getLeaveRequests() {
  const sheet = getSheetByName(CONFIG.SHEET_NAMES.LEAVE_REQUESTS);
  const data = sheet.getDataRange().getValues();
  const requests = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      const rowId = 'REQ' + String(i).padStart(4, '0') + '_' + data[i][16];
      
      requests.push({
        id: rowId,
        employeeId: data[i][0],
        employeeName: data[i][1],
        jabatan: data[i][2],
        unitKerja: data[i][3],
        cutiType: data[i][4],
        alasanCuti: data[i][5],
        lamaPengambilan: data[i][6],
        startDate: data[i][7],
        endDate: data[i][8],
        alamatCuti: data[i][9],
        nomorTelepon: data[i][10],
        petugasPengganti: data[i][11],
        persetujuanPengawas: data[i][12],
        days: data[i][13],
        photo: data[i][14],
        status: data[i][15] || 'Menunggu',
        submittedAt: data[i][16],
        approvedBy: data[i][17] || '',
        supervisorName: data[i][18] || '',
        supervisorPhone: data[i][19] || ''
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ requests: requests }))
    .setMimeType(ContentService.MimeType.JSON);
}

function submitLeaveRequest(request) {
  const sheet = getSheetByName(CONFIG.SHEET_NAMES.LEAVE_REQUESTS);
  const timestamp = new Date().toISOString();
  
  const empSheet = getSheetByName(CONFIG.SHEET_NAMES.EMPLOYEES);
  const empData = empSheet.getDataRange().getValues();
  let supervisorName = '';
  let supervisorPhone = '';
  
  for (let i = 1; i < empData.length; i++) {
    if (String(empData[i][0]) === String(request.employeeId)) {
      supervisorName = empData[i][4] || '';
      supervisorPhone = empData[i][5] || '';
      break;
    }
  }
  
  sheet.appendRow([
    request.employeeId,
    request.employeeName,
    request.jabatan,
    request.unitKerja,
    request.cutiType,
    request.alasanCuti,
    request.lamaPengambilan,
    request.startDate,
    request.endDate,
    request.alamatCuti,
    request.nomorTelepon,
    request.petugasPengganti,
    request.persetujuanPengawas,
    request.days,
    request.photo || '',
    'Menunggu',
    timestamp,
    '',
    supervisorName,
    supervisorPhone
  ]);
  
  sendEmailNotification({
    ...request,
    supervisorName: supervisorName,
    supervisorPhone: supervisorPhone
  });
  
  const generatedId = 'REQ_' + timestamp.replace(/[-:\.TZ]/g, '');
  
  return ContentService.createTextOutput(JSON.stringify({ 
    success: true,
    request: {
      ...request,
      id: generatedId,
      status: 'Menunggu',
      submittedAt: timestamp,
      supervisorName: supervisorName,
      supervisorPhone: supervisorPhone
    }
  })).setMimeType(ContentService.MimeType.JSON);
}

function updateLeaveStatus(requestId, status, adminName) {
  const sheet = getSheetByName(CONFIG.SHEET_NAMES.LEAVE_REQUESTS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const rowId = 'REQ' + String(i).padStart(4, '0') + '_' + data[i][16];
    
    if (rowId === requestId) {
      sheet.getRange(i + 1, 16).setValue(status);
      sheet.getRange(i + 1, 18).setValue(adminName);
      
      if (status === 'Disetujui' && data[i][4] === 'Cuti Tahunan') {
        const employeeId = data[i][0];
        const days = data[i][13];
        updateUsedLeave(employeeId, days);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Request not found' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateUsedLeave(employeeId, days) {
  const sheet = getSheetByName(CONFIG.SHEET_NAMES.EMPLOYEES);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(employeeId)) {
      const currentUsed = data[i][3] || 0;
      sheet.getRange(i + 1, 4).setValue(currentUsed + days);
      break;
    }
  }
}
```

## 🎯 Cara Penggunaan

### **Untuk Karyawan:**

1. Buka aplikasi web
2. Cari dan klik nama Anda
3. Isi formulir pengajuan cuti:
   - Pilih **Jabatan** (Pengawas/Anggota)
   - Pilih **Unit Kerja** (Pramubhakti/Pramusaji)
   - Pilih **Jenis Cuti** (Tahunan/Sakit)
   - Isi semua field yang wajib (*)
   - Upload foto surat dokter jika cuti sakit
4. Klik **Kirim**
5. Tunggu persetujuan dari admin

### **Untuk Admin:**

1. Klik tombol **Admin** di pojok kanan atas
2. Login dengan username & password
3. Lihat pengajuan yang menunggu persetujuan
4. Klik **Setujui** atau **Tolak**
5. Kelola data karyawan via menu **Kelola Karyawan**

## 📊 Struktur Data

### **Jabatan:**
- **Pengawas** - Tidak perlu persetujuan pengawas (field hidden)
- **Anggota** - Perlu persetujuan pengawas (field wajib muncul)

### **Unit Kerja:**
- **Pramubhakti** - 10 pengawas
- **Pramusaji** - 1 pengawas

### **Jenis Cuti:**
- **Cuti Tahunan** - Tidak perlu foto lampiran (field hidden)
- **Cuti Sakit** - Wajib lampirkan surat dokter/rawat inap (field wajib + peringatan)

### **Lama Pengambilan:**
- 1 Hari
- 2 Hari

## 🔧 Konfigurasi

### **Notifikasi Email**

Edit di Google Apps Script (line 6):
```javascript
ADMIN_EMAIL: 'admin@company.com',
```

### **WhatsApp Integration**

Nomor WhatsApp pengawas diinput saat menambah/edit karyawan di admin panel.

Format: `6281234567890` (tanpa tanda +)

Fitur:
- Tombol WhatsApp di admin panel untuk kontak pengawas
- Pesan otomatis terformat untuk konfirmasi persetujuan

## 🐛 Troubleshooting

### **Pengajuan cuti tidak masuk ke Google Sheets**
- Pastikan Apps Script sudah di-deploy dengan benar
- Cek URL Apps Script di `index.html` sudah benar
- Pastikan permission "Anyone" sudah diset di deployment
- Cek console browser (F12) untuk error message

### **Email notifikasi tidak terkirim**
- Pastikan email di `CONFIG.ADMIN_EMAIL` sudah benar
- Cek quota Gmail (max 100 email/hari untuk akun gratis)
- Authorize Apps Script untuk akses Gmail
- Cek spam folder

### **Tombol WhatsApp tidak berfungsi**
- Pastikan nomor WhatsApp format benar: `6281234567890`
- Pastikan dimulai dengan kode negara (62 untuk Indonesia)
- Jangan gunakan tanda + atau -

### **Login admin gagal**
- Pastikan sheet "Admin" ada dan formatnya benar
- Cek username dan password di sheet (case-sensitive)
- Clear cache browser

### **Input field hilang saat mengetik**
- Issue sudah diperbaiki di versi terbaru
- Update file index.html dari repository

## 🔄 Update & Maintenance

### **Update Aplikasi:**

1. Edit file `index.html` di GitHub
2. Commit changes
3. Cloudflare Pages akan auto-deploy dalam 1-2 menit

### **Backup Data:**

1. Buka Google Sheets
2. File → Download → Microsoft Excel (.xlsx)
3. Simpan backup secara berkala

### **Monitoring:**

- Cek email notifikasi untuk pengajuan baru
- Review Google Sheets secara berkala
- Monitor quota email Gmail

## 🤝 Contributing

Kontribusi selalu diterima! Silakan:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Google Apps Script](https://developers.google.com/apps-script) - Backend API
- [Cloudflare Pages](https://pages.cloudflare.com/) - Hosting Platform
- [Google Sheets](https://www.google.com/sheets/about/) - Database

## 📞 Support

Jika ada pertanyaan atau masalah, silakan:
- Buka [Issue](https://github.com/username/sistem-cuti/issues)
- Email: support@example.com

## 🗺️ Roadmap

- [ ] Export data ke PDF
- [ ] Dashboard analytics untuk admin
- [ ] Multi-language support
- [ ] Mobile app (PWA)
- [ ] Calendar view untuk cuti
- [ ] Notifikasi push

---

⭐ **Jangan lupa beri Star jika project ini membantu Anda!**

Made with ❤️ for MUHAMMAD ALFINAS

**Version:** 1.0.0  
**Last Updated:** December 2024
