import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, FileText, Camera, Settings, LogOut, Check, X, Search, Key, RefreshCw, AlertCircle } from 'lucide-react';

// ====================================================================
// KONFIGURASI GOOGLE APPS SCRIPT
// ====================================================================
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE'; // Ganti dengan URL Web App Anda

// ====================================================================
// API Functions - Komunikasi dengan Google Sheets
// ====================================================================
const API = {
  // Verifikasi login admin
  verifyAdmin: async (username, password) => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=verifyAdmin&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying admin:', error);
      return { success: false, error: error.message };
    }
  },

  // Ganti password admin
  changeAdminPassword: async (username, oldPassword, newPassword) => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'changeAdminPassword',
          username,
          oldPassword,
          newPassword
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error: error.message };
    }
  },

  // Ambil daftar karyawan
  getEmployees: async () => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getEmployees`);
      const data = await response.json();
      return data.employees || [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  },

  // Ambil pengajuan cuti
  getLeaveRequests: async () => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getLeaveRequests`);
      const data = await response.json();
      return data.requests || [];
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      return [];
    }
  },

  // Submit pengajuan cuti baru
  submitLeaveRequest: async (requestData) => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submitLeaveRequest',
          data: requestData
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      return { success: false, error: error.message };
    }
  },

  // Update status pengajuan (approve/reject)
  updateLeaveStatus: async (requestId, status, adminName) => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateLeaveStatus',
          requestId,
          status,
          adminName
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating status:', error);
      return { success: false, error: error.message };
    }
  },

  // Tambah karyawan baru (admin)
  addEmployee: async (employeeData) => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addEmployee',
          data: employeeData
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding employee:', error);
      return { success: false, error: error.message };
    }
  },

  // Update data karyawan (admin)
  updateEmployee: async (employeeId, employeeData) => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateEmployee',
          employeeId,
          data: employeeData
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating employee:', error);
      return { success: false, error: error.message };
    }
  },

  // Hapus karyawan (admin)
  deleteEmployee: async (employeeId) => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteEmployee',
          employeeId
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting employee:', error);
      return { success: false, error: error.message };
    }
  }
};

// ====================================================================
// Komponen Utama Aplikasi
// ====================================================================
const App = () => {
  // State Management
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('admin'); // Default username
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // Password Change Modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [page, setPage] = useState('select');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    jabatan: '',
    unitKerja: '',
    cutiTypes: [], // Array untuk multiple selection
    alasanCuti: '',
    lamaPengambilan: '',
    startDate: '',
    endDate: '',
    alamatCuti: '',
    nomorTelepon: '',
    petugasPengganti: '',
    persetujuanPengawas: '',
    photo: null
  });
  const [submittedData, setSubmittedData] = useState(null);

  // Realtime & Filter
  const [currentTime, setCurrentTime] = useState(new Date());
  const [adminFilterDate, setAdminFilterDate] = useState('');

  // Employee Management (Admin)
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [employeeFormData, setEmployeeFormData] = useState({
    id: '',
    name: '',
    totalLeave: 12
  });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);

  // Load data saat aplikasi dimulai
  useEffect(() => {
    loadData();
  }, []);

  // Update jam realtime
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fungsi Load Data dari Google Sheets
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [employeesData, requestsData] = await Promise.all([
        API.getEmployees(),
        API.getLeaveRequests()
      ]);
      setEmployees(employeesData);
      setLeaveRequests(requestsData);
    } catch (err) {
      setError('Gagal memuat data dari Google Sheets. Pastikan URL Script sudah benar.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Utility Functions
  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (startDate > endDate) return 0;
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Disetujui': return 'bg-green-100 text-green-800 border-green-200';
      case 'Ditolak': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Handler - Photo Capture
  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData({...formData, photo: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler - Submit Leave Request
  const handleSubmitLeave = async () => {
    // Validasi field wajib
    if (!formData.jabatan) {
      alert('Mohon isi Jabatan!');
      return;
    }
    if (!formData.unitKerja) {
      alert('Mohon isi Unit Kerja!');
      return;
    }
    if (formData.cutiTypes.length === 0) {
      alert('Mohon pilih minimal satu jenis cuti!');
      return;
    }
    if (!formData.alasanCuti) {
      alert('Mohon isi Alasan Cuti!');
      return;
    }
    if (!formData.lamaPengambilan) {
      alert('Mohon pilih Lama Pengambilan Cuti!');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      alert('Mohon isi Tanggal Mulai dan Selesai!');
      return;
    }
    if (!formData.alamatCuti) {
      alert('Mohon isi Alamat Selama Menjalani Cuti!');
      return;
    }
    if (!formData.nomorTelepon) {
      alert('Mohon isi Nomor Telepon!');
      return;
    }
    if (!formData.petugasPengganti) {
      alert('Mohon isi Petugas Pengganti!');
      return;
    }
    if (!formData.persetujuanPengawas) {
      alert('Mohon pilih status persetujuan pengawas!');
      return;
    }

    // Validasi wajib lampiran untuk Cuti Sakit
    if (formData.cutiTypes.includes('sakit') && !formData.photo) {
      alert('Wajib lampirkan foto/surat dokter untuk Cuti Sakit!');
      return;
    }

    const days = calculateDays(formData.startDate, formData.endDate);
    if (days <= 0) {
      alert('Tanggal mulai harus sebelum atau sama dengan tanggal selesai!');
      return;
    }
    
    const employee = employees.find(e => e.id === selectedEmployee);
    const remainingLeave = employee.totalLeave - employee.usedLeave;
    
    // Validasi sisa cuti jika mengambil cuti tahunan
    if (formData.cutiTypes.includes('tahunan') && days > remainingLeave) {
      alert(`Sisa cuti tahunan tidak mencukupi! Sisa: ${remainingLeave} hari.`);
      return;
    }

    setLoading(true);
    const requestData = {
      employeeId: selectedEmployee,
      employeeName: employee.name,
      jabatan: formData.jabatan,
      unitKerja: formData.unitKerja,
      cutiTypes: formData.cutiTypes,
      alasanCuti: formData.alasanCuti,
      lamaPengambilan: formData.lamaPengambilan,
      startDate: formData.startDate,
      endDate: formData.endDate,
      alamatCuti: formData.alamatCuti,
      nomorTelepon: formData.nomorTelepon,
      petugasPengganti: formData.petugasPengganti,
      persetujuanPengawas: formData.persetujuanPengawas,
      days: days,
      photo: formData.photo
    };

    const result = await API.submitLeaveRequest(requestData);
    
    if (result.success) {
      await loadData(); // Refresh data
      setSubmittedData({
        employee: employee,
        request: result.request,
        remainingLeave: employee.totalLeave - (employee.usedLeave + (formData.cutiTypes.includes('tahunan') ? days : 0))
      });
      setPage('result');
    } else {
      alert('Gagal mengajukan cuti: ' + (result.error || 'Unknown error'));
    }
    setLoading(false);
  };

  // Handler - Select Employee
  const handleSelectEmployee = (empId) => {
    setSelectedEmployee(empId);
    setPage('form');
    setFormData({
      jabatan: '',
      unitKerja: '',
      cutiTypes: [],
      alasanCuti: '',
      lamaPengambilan: '',
      startDate: '',
      endDate: '',
      alamatCuti: '',
      nomorTelepon: '',
      petugasPengganti: '',
      persetujuanPengawas: '',
      photo: null
    });
    setPhotoPreview(null);
  };

  // Handler - Back to Select
  const handleBackToSelect = () => {
    setPage('select');
    setSelectedEmployee(null);
    setSubmittedData(null);
    setSearchTerm('');
  };

  // Handler - Approve/Reject
  const handleApproveReject = async (requestId, action) => {
    const request = leaveRequests.find(r => r.id === requestId);
    
    if (action === 'approve' && request.cutiTypes.includes('tahunan')) {
      const employee = employees.find(e => e.id === request.employeeId);
      const remainingLeave = employee.totalLeave - employee.usedLeave;
      if (request.days > remainingLeave) {
        alert(`Gagal menyetujui: Sisa cuti tahunan ${employee.name} tidak mencukupi (${remainingLeave} hari)!`);
        return;
      }
    }

    setLoading(true);
    const status = action === 'approve' ? 'Disetujui' : 'Ditolak';
    const result = await API.updateLeaveStatus(requestId, status, 'Admin');

    if (result.success) {
      await loadData();
      alert(`Pengajuan cuti ${status.toLowerCase()}!`);
    } else {
      alert('Gagal memperbarui status: ' + (result.error || 'Unknown error'));
    }
    setLoading(false);
  };

  // Handler - Admin Login
  const handleAdminLogin = async () => {
    if (!adminUsername || !adminPassword) {
      alert('Mohon isi username dan password!');
      return;
    }

    setLoading(true);
    const result = await API.verifyAdmin(adminUsername, adminPassword);
    
    if (result.success) {
      setIsAdminLoggedIn(true);
      setShowAdminLogin(false);
      setPage('admin');
      setAdminPassword('');
    } else {
      alert(result.error || 'Username atau password salah!');
      setAdminPassword('');
    }
    setLoading(false);
  };

  // Handler - Admin Logout
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setPage('select');
    setAdminUsername('admin');
    setShowChangePassword(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Handler - Change Password
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('Mohon isi semua field!');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password baru harus minimal 6 karakter!');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Password baru dan konfirmasi tidak cocok!');
      return;
    }

    setLoading(true);
    const result = await API.changeAdminPassword(adminUsername, oldPassword, newPassword);
    
    if (result.success) {
      alert('Password berhasil diubah!');
      setShowChangePassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      alert(result.error || 'Gagal mengubah password!');
    }
    setLoading(false);
  };

  // Handler - Add/Update Employee
  const handleSaveEmployee = async () => {
    if (!employeeFormData.name || employeeFormData.totalLeave < 0) {
      alert('Mohon isi nama dan jumlah cuti yang valid!');
      return;
    }

    // Validasi ID wajib untuk karyawan baru
    if (!editingEmployee && !employeeFormData.id) {
      alert('Mohon isi ID Karyawan (NIP/NIK)!');
      return;
    }

    // Cek duplikasi ID untuk karyawan baru
    if (!editingEmployee) {
      const isDuplicate = employees.some(emp => emp.id === employeeFormData.id);
      if (isDuplicate) {
        alert(`ID "${employeeFormData.id}" sudah digunakan! Gunakan ID yang berbeda.`);
        return;
      }
    }

    setLoading(true);
    let result;
    
    if (editingEmployee) {
      result = await API.updateEmployee(editingEmployee.id, employeeFormData);
    } else {
      result = await API.addEmployee(employeeFormData);
    }

    if (result.success) {
      await loadData();
      setShowEmployeeForm(false);
      setEditingEmployee(null);
      setEmployeeFormData({ id: '', name: '', totalLeave: 12 });
      alert(editingEmployee ? 'Karyawan berhasil diupdate!' : 'Karyawan berhasil ditambahkan!');
    } else {
      alert('Gagal menyimpan data: ' + (result.error || 'Unknown error'));
    }
    setLoading(false);
  };

  // Handler - Delete Employee
  const handleDeleteEmployee = async (empId) => {
    if (!confirm('Yakin ingin menghapus karyawan ini?')) return;

    setLoading(true);
    const result = await API.deleteEmployee(empId);

    if (result.success) {
      await loadData();
      alert('Karyawan berhasil dihapus!');
    } else {
      alert('Gagal menghapus karyawan: ' + (result.error || 'Unknown error'));
    }
    setLoading(false);
  };

  // Handler - Edit Employee
  const handleEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setEmployeeFormData({
      id: emp.id,
      name: emp.name,
      totalLeave: emp.totalLeave
    });
    setShowEmployeeForm(true);
  };

  // Handler - Import CSV/Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Parse CSV (skip header)
      const parsed = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/[,;\t]/).map(c => c.trim());
        if (cols.length >= 2 && cols[0] && cols[1]) {
          parsed.push({
            id: cols[0],
            name: cols[1],
            totalLeave: parseInt(cols[2]) || 12,
            usedLeave: parseInt(cols[3]) || 0
          });
        }
      }

      setImportPreview(parsed);
    };

    reader.readAsText(file);
  };

  // Handler - Confirm Import
  const handleConfirmImport = async () => {
    if (importPreview.length === 0) {
      alert('Tidak ada data untuk diimport!');
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const emp of importPreview) {
      const result = await API.addEmployee(emp);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    await loadData();
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
    setLoading(false);

    alert(`Import selesai!\n✅ Berhasil: ${successCount}\n❌ Gagal: ${errorCount}`);
  };

  // Filtered Data
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredProcessedRequests = leaveRequests
    .filter(r => r.status !== 'Menunggu')
    .filter(r => {
      if (!adminFilterDate) return true;
      const requestDate = new Date(r.submittedAt).toISOString().split('T')[0];
      return requestDate === adminFilterDate;
    })
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  // Format Time
  const formattedTime = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // ====================================================================
  // UI: Loading State
  // ====================================================================
  if (loading && employees.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data dari Google Sheets...</p>
        </div>
      </div>
    );
  }

  // ====================================================================
  // UI: Error State
  // ====================================================================
  if (error && employees.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Kesalahan Koneksi</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button
            onClick={loadData}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // ====================================================================
  // UI: Admin Login Modal
  // ====================================================================
  if (showAdminLogin && !isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Login Admin</h2>
            <button
              onClick={() => setShowAdminLogin(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Masukkan username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Masukkan password"
              />
            </div>
            
            <button
              onClick={handleAdminLogin}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Memverifikasi...' : 'Login'}
            </button>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>Default Login:</strong><br/>
                Username: admin<br/>
                Password: admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================================
  // UI: Admin Panel
  // ====================================================================
  if (page === 'admin' && isAdminLoggedIn) {
    const pendingRequests = leaveRequests.filter(r => r.status === 'Menunggu');

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8 border-b pb-4">
              <div className="flex items-center gap-3">
                <Settings className="w-10 h-10 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-800">Panel Admin</h1>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                <div className="text-right text-sm text-gray-600">
                  <p className="font-semibold text-gray-800">{formattedDate}</p>
                  <p>{formattedTime} WIB</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Import Excel/CSV
                  </button>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <Key className="w-4 h-4" />
                    Ganti Password
                  </button>
                  <button
                    onClick={() => setShowEmployeeForm(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <User className="w-4 h-4" />
                    Kelola Karyawan
                  </button>
                  <button
                    onClick={handleAdminLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Ganti Password */}
            {showChangePassword && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Ganti Password Admin</h3>
                    <button
                      onClick={() => {
                        setShowChangePassword(false);
                        setOldPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Username</label>
                      <input
                        type="text"
                        value={adminUsername}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Password Lama</label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Masukkan password lama"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Password Baru</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Minimal 6 karakter"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Konfirmasi Password Baru</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ulangi password baru"
                      />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => {
                          setShowChangePassword(false);
                          setOldPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Password'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Import Excel/CSV */}
            {showImportModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Import Data Karyawan dari Excel/CSV</h3>
                    <button
                      onClick={() => {
                        setShowImportModal(false);
                        setImportFile(null);
                        setImportPreview([]);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Instruksi */}
                  <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">📋 Format File CSV/Excel:</h4>
                    <pre className="text-xs bg-white p-2 rounded border border-blue-200 overflow-x-auto">
ID,Nama,Total Cuti,Cuti Terpakai
192,SANDI ALJABAR,12,0
2,AHMAD SYAIFUL,12,0
89,AJI KURNIA RAMADHAN,12,0
                    </pre>
                    <p className="text-sm text-blue-700 mt-2">
                      <strong>Catatan:</strong> Kolom 3 & 4 opsional (default: 12, 0)
                    </p>
                  </div>

                  {/* Upload File */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Upload File CSV/Excel</label>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: CSV, TXT (delimiter: koma, titik koma, atau tab)
                    </p>
                  </div>

                  {/* Preview Data */}
                  {importPreview.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">
                        Preview Data ({importPreview.length} karyawan)
                      </h4>
                      <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="p-2 text-left border-b">ID</th>
                              <th className="p-2 text-left border-b">Nama</th>
                              <th className="p-2 text-left border-b">Total Cuti</th>
                              <th className="p-2 text-left border-b">Cuti Terpakai</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importPreview.map((emp, idx) => (
                              <tr key={idx} className="border-b hover:bg-gray-50">
                                <td className="p-2">{emp.id}</td>
                                <td className="p-2">{emp.name}</td>
                                <td className="p-2">{emp.totalLeave}</td>
                                <td className="p-2">{emp.usedLeave}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowImportModal(false);
                        setImportFile(null);
                        setImportPreview([]);
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleConfirmImport}
                      disabled={loading || importPreview.length === 0}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
                    >
                      {loading ? 'Mengimport...' : `Import ${importPreview.length} Karyawan`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Kelola Karyawan */}
            {showEmployeeForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">
                      {editingEmployee ? 'Edit Karyawan' : 'Kelola Karyawan'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowEmployeeForm(false);
                        setEditingEmployee(null);
                        setEmployeeFormData({ name: '', totalLeave: 12 });
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Form Tambah/Edit */}
                  <div className="bg-indigo-50 p-4 rounded-lg mb-4 border border-indigo-200">
                    <h4 className="font-semibold mb-3">
                      {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className={editingEmployee ? 'opacity-50' : ''}>
                        <label className="block text-sm font-medium mb-2">
                          ID Karyawan (NIP/NIK) {!editingEmployee && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="text"
                          value={employeeFormData.id}
                          onChange={(e) => setEmployeeFormData({...employeeFormData, id: e.target.value.toUpperCase()})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="Contoh: EMP001, NIP12345"
                          disabled={editingEmployee}
                        />
                        {editingEmployee && (
                          <p className="text-xs text-gray-500 mt-1">ID tidak bisa diubah saat edit</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nama Karyawan <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={employeeFormData.name}
                          onChange={(e) => setEmployeeFormData({...employeeFormData, name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="Nama lengkap"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Total Cuti Tahunan <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={employeeFormData.totalLeave}
                          onChange={(e) => setEmployeeFormData({...employeeFormData, totalLeave: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => {
                          setEditingEmployee(null);
                          setEmployeeFormData({ id: '', name: '', totalLeave: 12 });
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSaveEmployee}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
                      >
                        {loading ? 'Menyimpan...' : (editingEmployee ? 'Update' : 'Tambah')}
                      </button>
                    </div>
                  </div>

                  {/* Daftar Karyawan */}
                  <div>
                    <h4 className="font-semibold mb-3">Daftar Karyawan ({employees.length})</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {employees.map(emp => (
                        <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div>
                            <p className="font-semibold text-gray-800">{emp.name}</p>
                            <p className="text-xs text-gray-500">ID: {emp.id}</p>
                            <p className="text-sm text-gray-600">
                              Total: {emp.totalLeave} hari | Terpakai: {emp.usedLeave} hari | Sisa: {emp.totalLeave - emp.usedLeave} hari
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditEmployee(emp)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="mb-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-100 p-4 rounded-xl border border-yellow-200">
                  <p className="text-sm text-yellow-800">Menunggu Persetujuan</p>
                  <p className="text-3xl font-bold text-yellow-900">{pendingRequests.length}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-xl border border-green-200">
                  <p className="text-sm text-green-800">Disetujui</p>
                  <p className="text-3xl font-bold text-green-900">
                    {leaveRequests.filter(r => r.status === 'Disetujui').length}
                  </p>
                </div>
                <div className="bg-red-100 p-4 rounded-xl border border-red-200">
                  <p className="text-sm text-red-800">Ditolak</p>
                  <p className="text-3xl font-bold text-red-900">
                    {leaveRequests.filter(r => r.status === 'Ditolak').length}
                  </p>
                </div>
              </div>

              {/* Pending Requests */}
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Pengajuan Cuti Menunggu Persetujuan ({pendingRequests.length})
              </h2>
              {pendingRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                  Tidak ada pengajuan cuti yang menunggu
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="border-2 border-yellow-300 bg-yellow-50 rounded-xl p-6 shadow-md">
                      <div className="flex items-start justify-between mb-4 pb-2 border-b border-yellow-200">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{req.employeeName}</h3>
                          <p className="text-sm text-gray-600">
                            Diajukan: <span className="font-medium">{new Date(req.submittedAt).toLocaleString('id-ID')}</span>
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Jabatan</p>
                          <p className="font-semibold text-gray-800">{req.jabatan || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Unit Kerja</p>
                          <p className="font-semibold text-gray-800">{req.unitKerja || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Jenis Cuti</p>
                          <p className="font-semibold text-gray-800">
                            {Array.isArray(req.cutiTypes) ? req.cutiTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ') : req.cutiTypes}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Durasi</p>
                          <p className="font-semibold text-gray-800">{req.days} hari ({req.lamaPengambilan || '-'})</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-sm text-gray-600">Tanggal</p>
                          <p className="font-semibold text-gray-800">{req.startDate} s/d {req.endDate}</p>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <p className="text-sm text-gray-600">Alasan</p>
                          <p className="font-semibold text-gray-800">{req.alasanCuti || req.reason}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">No. Telepon</p>
                          <p className="font-semibold text-gray-800">{req.nomorTelepon || '-'}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-sm text-gray-600">Alamat Selama Cuti</p>
                          <p className="font-semibold text-gray-800">{req.alamatCuti || '-'}</p>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <p className="text-sm text-gray-600">Petugas Pengganti</p>
                          <p className="font-semibold text-gray-800">{req.petugasPengganti || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Persetujuan Pengawas</p>
                          <p className="font-semibold text-gray-800">{req.persetujuanPengawas || '-'}</p>
                        </div>
                      </div>

                      {req.photo && (
                        <div className="mt-4 pt-4 border-t border-yellow-200">
                          <p className="text-sm text-gray-600 mb-2">Foto Lampiran:</p>
                          <img 
                            src={req.photo}
                            alt="Lampiran Pengajuan Cuti" 
                            className="w-full max-w-md rounded-lg shadow-md cursor-pointer hover:opacity-80 transition-opacity" 
                            onClick={() => window.open(req.photo, '_blank')}
                          />
                          <p className="text-xs text-gray-500 mt-1">Klik gambar untuk melihat ukuran penuh</p>
                        </div>
                      )}

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => handleApproveReject(req.id, 'approve')}
                          disabled={loading}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Check className="w-5 h-5" />
                          Setujui
                        </button>
                        <button
                          onClick={() => handleApproveReject(req.id, 'reject')}
                          disabled={loading}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <X className="w-5 h-5" />
                          Tolak
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Pengajuan Cuti</h2>
              
              <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <FileText className="w-6 h-6 text-indigo-600" />
                <label className="text-sm font-medium text-gray-700">Filter Tanggal Diajukan:</label>
                <input
                  type="date"
                  value={adminFilterDate}
                  onChange={(e) => setAdminFilterDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={() => setAdminFilterDate('')}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
              </div>

              {filteredProcessedRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                  {adminFilterDate ? `Tidak ada riwayat pengajuan pada tanggal ${adminFilterDate}` : 'Belum ada riwayat pengajuan'}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredProcessedRequests.map(req => (
                    <div key={req.id} className={`rounded-xl p-4 shadow-sm border ${getStatusColor(req.status)}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-gray-800">{req.employeeName}</h4>
                          <p className="text-sm text-gray-600">
                            {req.startDate} s/d {req.endDate} ({req.days} hari - {Array.isArray(req.cutiTypes) ? req.cutiTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ') : req.cutiTypes || req.type})
                          </p>
                          <p className="text-xs text-gray-500">Diajukan: {new Date(req.submittedAt).toLocaleString('id-ID')}</p>
                          {req.jabatan && <p className="text-xs text-gray-500">Jabatan: {req.jabatan} | Unit: {req.unitKerja}</p>}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">Alasan: {req.alasanCuti || req.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================================
  // UI: Result Page
  // ====================================================================
  if (page === 'result' && submittedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-green-100 p-4 rounded-full mb-4">
                <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Pengajuan Berhasil!</h2>
              <p className="text-gray-600">Cuti Anda telah diajukan dan menunggu persetujuan admin</p>
              <p className="text-sm text-gray-500 mt-2">{formattedDate} | {formattedTime} WIB</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border border-indigo-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">{submittedData.employee.name}</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Total Cuti</p>
                  <p className="text-2xl font-bold text-blue-600">{submittedData.employee.totalLeave} hari</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Cuti Terpakai</p>
                  <p className="text-2xl font-bold text-purple-600">{submittedData.employee.totalLeave - submittedData.remainingLeave} hari</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Sisa Cuti</p>
                  <p className="text-2xl font-bold text-green-600">{submittedData.remainingLeave} hari</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Detail Pengajuan</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jabatan:</span>
                  <span className="font-semibold">{submittedData.request.jabatan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit Kerja:</span>
                  <span className="font-semibold">{submittedData.request.unitKerja}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jenis Cuti:</span>
                  <span className="font-semibold">
                    {Array.isArray(submittedData.request.cutiTypes) 
                      ? submittedData.request.cutiTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')
                      : submittedData.request.cutiTypes}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tanggal:</span>
                  <span className="font-semibold">{submittedData.request.startDate} s/d {submittedData.request.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Durasi:</span>
                  <span className="font-semibold">{submittedData.request.days} hari ({submittedData.request.lamaPengambilan})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(submittedData.request.status)}`}>
                    {submittedData.request.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-2">Alasan Cuti:</span>
                  <p className="bg-gray-50 p-3 rounded-lg border border-gray-200">{submittedData.request.alasanCuti}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-2">Alamat Selama Cuti:</span>
                  <p className="bg-gray-50 p-3 rounded-lg border border-gray-200">{submittedData.request.alamatCuti}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nomor Telepon:</span>
                  <span className="font-semibold">{submittedData.request.nomorTelepon}</span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-2">Petugas Pengganti:</span>
                  <p className="bg-gray-50 p-3 rounded-lg border border-gray-200">{submittedData.request.petugasPengganti}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Persetujuan Pengawas:</span>
                  <span className="font-semibold">{submittedData.request.persetujuanPengawas}</span>
                </div>
                {submittedData.request.photo && (
                  <div>
                    <span className="text-gray-600 block mb-2">Foto Lampiran:</span>
                    <img src={submittedData.request.photo} alt="Lampiran" className="w-full max-w-md rounded-lg shadow-md border border-gray-200" />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleBackToSelect}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Kembali ke Halaman Utama
            </button>
          </div>
        </div>
      </div>
    );
  }

  // UI: Form Page
  // ====================================================================
  if (page === 'form' && selectedEmployee) {
    const employee = employees.find(e => e.id === selectedEmployee);
    
    const handleCheckboxChange = (type) => {
      const newTypes = formData.cutiTypes.includes(type)
        ? formData.cutiTypes.filter(t => t !== type)
        : [...formData.cutiTypes, type];
      setFormData({...formData, cutiTypes: newTypes});
    };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">Pengajuan Cuti</h2>
              <button
                onClick={handleBackToSelect}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl mb-6 border border-indigo-200">
              <p className="font-bold text-indigo-800 mb-1">Karyawan: {employee.name}</p>
              <p className="text-sm text-gray-600">
                Sisa Cuti Tahunan: <span className="font-semibold text-green-700">{employee.totalLeave - employee.usedLeave} hari</span>
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Jabatan */}
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jabatan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.jabatan}
                  onChange={(e) => setFormData({...formData, jabatan: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Pilih</option>
                  <option value="Staff">Staff</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Manager">Manager</option>
                  <option value="Direktur">Direktur</option>
                </select>
                {!formData.jabatan && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Pertanyaan ini wajib diisi
                  </p>
                )}
              </div>

              {/* Unit Kerja */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Kerja <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unitKerja}
                  onChange={(e) => setFormData({...formData, unitKerja: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Pilih</option>
                  <option value="HRD">HRD</option>
                  <option value="IT">IT</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              {/* Cuti Yang Diambil - Checkbox */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuti Yang Diambil <span className="text-red-500">* pilih sesuai keadaan</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cutiTypes.includes('tahunan')}
                      onChange={() => handleCheckboxChange('tahunan')}
                      className="mt-1 w-4 h-4 text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">Cuti Tahunan</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cutiTypes.includes('sakit')}
                      onChange={() => handleCheckboxChange('sakit')}
                      className="mt-1 w-4 h-4 text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">Cuti Sakit (Wajib melampirkan surat dokter)</span>
                  </label>
                </div>
              </div>

              {/* Alasan Cuti */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Cuti <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.alasanCuti}
                  onChange={(e) => setFormData({...formData, alasanCuti: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                  placeholder="Jawaban Anda"
                />
              </div>

              {/* Lama Pengambilan Cuti */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lama Pengambilan Cuti <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.lamaPengambilan}
                  onChange={(e) => setFormData({...formData, lamaPengambilan: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Pilih</option>
                  <option value="1 Hari">1 Hari</option>
                  <option value="2-3 Hari">2-3 Hari</option>
                  <option value="4-7 Hari">4-7 Hari</option>
                  <option value="Lebih dari 7 Hari">Lebih dari 7 Hari</option>
                </select>
              </div>

              {/* Tanggal Mulai dan Selesai */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terhitung Mulai Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sampai Dengan Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Alamat Selama Menjalani Cuti */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Selama Menjalani Cuti <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.alamatCuti}
                  onChange={(e) => setFormData({...formData, alamatCuti: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                  placeholder="Jawaban Anda"
                />
              </div>

              {/* Nomor Telepon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.nomorTelepon}
                  onChange={(e) => setFormData({...formData, nomorTelepon: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Jawaban Anda"
                />
              </div>

              {/* Petugas Pengganti */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Siapa Petugas yang menggantikan anda selama anda menjalani cuti? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.petugasPengganti}
                  onChange={(e) => setFormData({...formData, petugasPengganti: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="2"
                  placeholder="Jawaban Anda"
                />
              </div>

              {/* Persetujuan Pengawas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apakah Pengajuan cuti anda mendapat persetujuan dari pengawas <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="persetujuan"
                      value="Ya Sudah"
                      checked={formData.persetujuanPengawas === 'Ya Sudah'}
                      onChange={(e) => setFormData({...formData, persetujuanPengawas: e.target.value})}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">Ya Sudah</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="persetujuan"
                      value="Belum"
                      checked={formData.persetujuanPengawas === 'Belum'}
                      onChange={(e) => setFormData({...formData, persetujuanPengawas: e.target.value})}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">Belum</span>
                  </label>
                </div>
              </div>

              {/* Surat Keterangan, Jika Cuti Sakit dan Izin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Surat Keterangan, Jika Cuti Sakit dan Izin <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Petugas dapat melampirkan bukti photo surat dokter atau lain nya
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Jenis file yang didukung: Document, Drawing, Image, atau Spreadsheet. Maks 10 MB.
                </p>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                      <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-indigo-600 font-medium">Tambahkan file</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      capture="environment"
                      onChange={handlePhotoCapture}
                      className="hidden"
                    />
                  </label>
                </div>
                {photoPreview && (
                  <div className="mt-4">
                    <img src={photoPreview} alt="Preview" className="w-full rounded-lg shadow-md border border-gray-200" />
                    <button
                      onClick={() => {setPhotoPreview(null); setFormData({...formData, photo: null});}}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Hapus file
                    </button>
                  </div>
                )}
                {formData.cutiTypes.includes('sakit') && !formData.photo && (
                  <p className="text-sm text-red-500 mt-2">Mohon lampirkan foto/dokumen pendukung untuk Cuti Sakit.</p>
                )}
              </div>

              {formData.startDate && formData.endDate && calculateDays(formData.startDate, formData.endDate) > 0 && (
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-gray-700 flex justify-between">
                    <span>Durasi Pengajuan:</span> 
                    <span className="font-bold text-indigo-800">{calculateDays(formData.startDate, formData.endDate)} hari</span>
                  </p>
                </div>
              )}

              <button
                onClick={handleSubmitLeave}
                disabled={loading || (formData.cutiTypes.includes('sakit') && !formData.photo)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Mengajukan...' : 'Kirim'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================================
  // UI: Select Employee Page (Main)
  // ====================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 border-b pb-4">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <Calendar className="w-10 h-10 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Sistem Izin Cuti</h1>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-right text-sm text-gray-600">
                <p className="font-semibold text-gray-800">{formattedDate}</p>
                <p>{formattedTime} WIB</p>
              </div>
              <button
                onClick={() => setShowAdminLogin(true)}
                className="mt-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Settings className="w-5 h-5" />
                Admin
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama karyawan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <p className="text-gray-600 mb-4 font-medium">Pilih nama karyawan untuk mengajukan cuti:</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2 border border-gray-200 rounded-xl bg-gray-50">
            {filteredEmployees.map(emp => (
              <button
                key={emp.id}
                onClick={() => handleSelectEmployee(emp.id)}
                className="bg-white hover:bg-indigo-50 border-2 border-gray-200 hover:border-indigo-400 p-4 rounded-xl transition-all text-left group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 group-hover:bg-indigo-200 p-3 rounded-full">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800 block">{emp.name}</span>
                    <span className="text-xs text-gray-500">Sisa Cuti: {emp.totalLeave - emp.usedLeave} hari</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <p className="text-center text-gray-500 py-8">Tidak ada karyawan ditemukan</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
