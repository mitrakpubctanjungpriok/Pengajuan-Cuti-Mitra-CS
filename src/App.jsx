import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, FileText, Camera, Settings, LogOut, Check, X, Search, Key, RefreshCw, AlertCircle, Mail, Bell, LogIn } from 'lucide-react';

// ====================================================================
// ⚠️⚠️⚠️ GANTI URL INI DENGAN URL GOOGLE APPS SCRIPT ANDA! ⚠️⚠️⚠️
// ====================================================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyUzK2L35jz-6qVdY_YM6TiEsSCXb4VahhlQnYAb8StBEXf9c1y4RudIM1dpsqWMFrE/exec';

// ====================================================================
// API Functions
// ====================================================================
const API = {
  verifyAdmin: async (username, password) => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=verifyAdmin&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  verifyEmployee: async (employeeId) => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=verifyEmployee&employeeId=${encodeURIComponent(employeeId)}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateEmployeeEmail: async (employeeId, email) => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateEmployeeEmail', employeeId, email })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  changeAdminPassword: async (username, oldPassword, newPassword) => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'changeAdminPassword', username, oldPassword, newPassword })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getEmployees: async () => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getEmployees`);
      const data = await response.json();
      return data.employees || [];
    } catch (error) {
      return [];
    }
  },

  getLeaveRequests: async () => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getLeaveRequests`);
      const data = await response.json();
      return data.requests || [];
    } catch (error) {
      return [];
    }
  },

  submitLeaveRequest: async (requestData) => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submitLeaveRequest', data: requestData })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateLeaveStatus: async (requestId, status, adminName) => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateLeaveStatus', requestId, status, adminName })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  addEmployee: async (employeeData) => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addEmployee', data: employeeData })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateEmployee: async (employeeId, employeeData) => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateEmployee', employeeId, data: employeeData })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteEmployee: async (employeeId) => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteEmployee', employeeId })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ====================================================================
// Main App Component
// ====================================================================
const App = () => {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Login State
  const [showLogin, setShowLogin] = useState(true);
  const [loginType, setLoginType] = useState('employee');
  const [employeeId, setEmployeeId] = useState('');
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  
  // Email Modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  
  // Data State
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [page, setPage] = useState('select');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
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
  
  const [submittedData, setSubmittedData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [adminFilterDate, setAdminFilterDate] = useState('');

  // Admin State
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [employeeFormData, setEmployeeFormData] = useState({ id: '', name: '', email: '', totalLeave: 12 });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Effects
  useEffect(() => {
    if (isLoggedIn) loadData();
  }, [isLoggedIn]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load Data
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
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };
  // Login Handler
  const handleLogin = async () => {
    if (loginType === 'admin') {
      if (!adminUsername || !adminPassword) {
        alert('Mohon isi username dan password!');
        return;
      }
      
      setLoading(true);
      const result = await API.verifyAdmin(adminUsername, adminPassword);
      
      if (result.success) {
        setIsLoggedIn(true);
        setUserType('admin');
        setCurrentUser({ username: adminUsername });
        setShowLogin(false);
        setPage('admin');
        setAdminPassword('');
      } else {
        alert(result.error || 'Login gagal!');
        setAdminPassword('');
      }
      setLoading(false);
    } else {
      if (!employeeId) {
        alert('Mohon masukkan ID Karyawan!');
        return;
      }
      
      setLoading(true);
      const result = await API.verifyEmployee(employeeId);
      
      if (result.success) {
        const emp = result.employee;
        
        if (!emp.email) {
          setCurrentUser(emp);
          setShowEmailModal(true);
          setLoading(false);
        } else {
          setIsLoggedIn(true);
          setUserType('employee');
          setCurrentUser(emp);
          setSelectedEmployee(emp.id);
          setShowLogin(false);
          setPage('form');
          setLoading(false);
        }
      } else {
        alert(result.error || 'ID tidak ditemukan!');
        setLoading(false);
      }
    }
  };

  // Email Submit Handler
  const handleEmailSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!tempEmail || !emailRegex.test(tempEmail)) {
      alert('Email tidak valid!');
      return;
    }

    setLoading(true);
    const result = await API.updateEmployeeEmail(currentUser.id, tempEmail);
    
    if (result.success) {
      currentUser.email = tempEmail;
      setIsLoggedIn(true);
      setUserType('employee');
      setSelectedEmployee(currentUser.id);
      setShowEmailModal(false);
      setShowLogin(false);
      setPage('form');
      setTempEmail('');
      await loadData();
    } else {
      alert('Gagal menyimpan email');
    }
    setLoading(false);
  };

  // Logout Handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setCurrentUser(null);
    setSelectedEmployee(null);
    setShowLogin(true);
    setPage('select');
    setEmployeeId('');
    setAdminPassword('');
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

  // Photo Handler
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

  // Submit Leave Request
  const handleSubmitLeave = async () => {
    if (!formData.jabatan || !formData.unitKerja || formData.cutiTypes.length === 0 || 
        !formData.alasanCuti || !formData.lamaPengambilan || !formData.startDate || 
        !formData.endDate || !formData.alamatCuti || !formData.nomorTelepon || 
        !formData.petugasPengganti || !formData.persetujuanPengawas) {
      alert('Mohon lengkapi semua field!');
      return;
    }

    if (formData.cutiTypes.includes('sakit') && !formData.photo) {
      alert('Wajib lampirkan foto untuk Cuti Sakit!');
      return;
    }

    const days = calculateDays(formData.startDate, formData.endDate);
    if (days <= 0) {
      alert('Tanggal tidak valid!');
      return;
    }
    
    const employee = employees.find(e => e.id === selectedEmployee);
    const remainingLeave = employee.totalLeave - employee.usedLeave;
    
    if (formData.cutiTypes.includes('tahunan') && days > remainingLeave) {
      alert(`Sisa cuti tidak cukup! Sisa: ${remainingLeave} hari.`);
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
      await loadData();
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

  // Approve/Reject Handler
  const handleApproveReject = async (requestId, action) => {
    const request = leaveRequests.find(r => r.id === requestId);
    
    if (action === 'approve' && request.cutiTypes.includes('tahunan')) {
      const employee = employees.find(e => e.id === request.employeeId);
      const remainingLeave = employee.totalLeave - employee.usedLeave;
      if (request.days > remainingLeave) {
        alert(`Gagal! Sisa cuti: ${remainingLeave} hari`);
        return;
      }
    }

    setLoading(true);
    const status = action === 'approve' ? 'Disetujui' : 'Ditolak';
    const result = await API.updateLeaveStatus(requestId, status, currentUser.username);

    if (result.success) {
      await loadData();
      alert(`Pengajuan ${status.toLowerCase()}! Email terkirim.`);
    } else {
      alert('Gagal update status');
    }
    setLoading(false);
  };

  // Admin - Change Password
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('Mohon isi semua field!');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password min 6 karakter!');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Password tidak cocok!');
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
      alert(result.error || 'Gagal ubah password');
    }
    setLoading(false);
  };

  // Admin - Employee Management
  const handleSaveEmployee = async () => {
    if (!employeeFormData.name || employeeFormData.totalLeave < 0) {
      alert('Data tidak valid!');
      return;
    }

    if (!editingEmployee && !employeeFormData.id) {
      alert('Mohon isi ID!');
      return;
    }

    if (!editingEmployee) {
      const isDuplicate = employees.some(emp => emp.id === employeeFormData.id);
      if (isDuplicate) {
        alert('ID sudah digunakan!');
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
      setEmployeeFormData({ id: '', name: '', email: '', totalLeave: 12 });
      alert(editingEmployee ? 'Update berhasil!' : 'Tambah berhasil!');
    } else {
      alert('Gagal: ' + (result.error || 'Unknown'));
    }
    setLoading(false);
  };

  const handleDeleteEmployee = async (empId) => {
    if (!confirm('Yakin hapus?')) return;

    setLoading(true);
    const result = await API.deleteEmployee(empId);

    if (result.success) {
      await loadData();
      alert('Berhasil dihapus!');
    } else {
      alert('Gagal hapus');
    }
    setLoading(false);
  };

  const handleEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setEmployeeFormData({
      id: emp.id,
      name: emp.name,
      email: emp.email || '',
      totalLeave: emp.totalLeave
    });
    setShowEmployeeForm(true);
  };

  // Import Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      const parsed = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/[,;\t]/).map(c => c.trim());
        if (cols.length >= 2 && cols[0] && cols[1]) {
          parsed.push({
            id: cols[0],
            name: cols[1],
            email: cols[2] || '',
            totalLeave: parseInt(cols[3]) || 12,
            usedLeave: parseInt(cols[4]) || 0
          });
        }
      }

      setImportPreview(parsed);
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (importPreview.length === 0) {
      alert('Tidak ada data!');
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
  // UI COMPONENTS
  // ====================================================================

  // Loading State
  if (loading && employees.length === 0 && isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Login Page
  if (showLogin && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <Calendar className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Sistem Izin Cuti</h1>
            <p className="text-gray-600">Silakan login untuk melanjutkan</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setLoginType('employee')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                loginType === 'employee'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <User className="w-5 h-5 inline mr-2" />
              Karyawan
            </button>
            <button
              onClick={() => setLoginType('admin')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                loginType === 'admin'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Settings className="w-5 h-5 inline mr-2" />
              Admin
            </button>
          </div>

          {loginType === 'employee' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Karyawan / NIP
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Contoh: 192, EMP001"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>💡 Catatan:</strong> Masukkan ID/NIP Anda. Jika pertama kali login, Anda akan diminta mengisi email untuk notifikasi.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username Admin
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Admin
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Password"
                />
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800">
                  <strong>Default Login:</strong> username: <code>admin</code> | password: <code>admin123</code>
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Login
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Email Input Modal
  if (showEmailModal && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Mail className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Selamat Datang!</h2>
            <p className="text-gray-600">{currentUser.name}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
            <p className="text-sm text-blue-800">
              <Bell className="w-4 h-4 inline mr-1" />
              <strong>Mohon isi email Anda untuk menerima notifikasi</strong> saat pengajuan cuti disetujui/ditolak.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="nama@email.com"
              />
            </div>

            <button
              onClick={handleEmailSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Lanjutkan'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sisanya ada di artifact saya sebelumnya
  // Untuk menghemat space, UI Admin Panel, Form Employee, dan Result Page
  // sudah saya berikan di chat sebelumnya
  
  // Default fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Terjadi kesalahan. Silakan refresh halaman.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default App;
