import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Eye, EyeOff, Copy, UserPlus, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { Employee } from '../types';

export default function EmployeeManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'karyawan'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data: Employee[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Employee));
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !newPassword.trim()) {
      alert('⚠️ Nama dan password harus diisi!');
      return;
    }

    // Cek duplikat nama
    const duplicate = employees.find(emp => 
      emp.nama.toLowerCase() === newNama.trim().toLowerCase()
    );
    if (duplicate) {
      alert('⚠️ Nama karyawan sudah terdaftar!');
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, 'karyawan'), {
        nama: newNama.trim(),
        password: newPassword.trim(),
        isActive: true,
        createdAt: new Date().toISOString()
      });
      
      setNewNama('');
      setNewPassword('');
      setShowAddForm(false);
      await loadEmployees();
      alert('✅ Karyawan berhasil ditambahkan!');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('❌ Gagal menambahkan karyawan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`❌ Yakin ingin menghapus karyawan "${nama}"? Data produksi karyawan ini tetap tersimpan.`)) return;
    
    try {
      await deleteDoc(doc(db, 'karyawan', id));
      await loadEmployees();
      alert('🗑️ Karyawan berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('❌ Gagal menghapus karyawan.');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'karyawan', id), { isActive: !currentStatus });
      await loadEmployees();
    } catch (error) {
      console.error('Error toggling employee status:', error);
    }
  };

  const copyCredentials = (nama: string, password: string) => {
    const text = `Nama: ${nama}\nPassword: ${password}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('📋 Data login berhasil dicopy!');
    }).catch(() => {
      prompt('Copy data login:', text);
    });
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="content-section">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          <Users className="w-6 h-6" />
          <span>Kelola Karyawan</span>
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`btn-sm ${showAddForm ? 'btn-danger' : 'btn-primary-sm'}`}
        >
          {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>{showAddForm ? 'Batal' : 'Tambah'}</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="card animate-in">
          <h3 className="card-title">
            <UserPlus className="w-5 h-5" />
            <span>Tambah Karyawan Baru</span>
          </h3>
          <form onSubmit={handleAdd} className="form-stack">
            <div className="input-group">
              <label className="input-label">Nama Karyawan</label>
              <input
                type="text"
                value={newNama}
                onChange={(e) => setNewNama(e.target.value)}
                className="input-field"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="Buat password untuk karyawan"
                required
              />
              <p className="input-hint">💡 Berikan password ini ke karyawan untuk login</p>
            </div>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? (
                <div className="btn-loading"><div className="spinner" /><span>Menyimpan...</span></div>
              ) : (
                <div className="btn-content"><Plus className="w-5 h-5" /><span>Tambah Karyawan</span></div>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card stat-indigo">
          <Users className="w-6 h-6" />
          <div>
            <p className="stat-value">{employees.filter(e => e.isActive).length}</p>
            <p className="stat-label">Karyawan Aktif</p>
          </div>
        </div>
        <div className="stat-card stat-slate">
          <Users className="w-6 h-6" />
          <div>
            <p className="stat-value">{employees.length}</p>
            <p className="stat-label">Total Terdaftar</p>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="card">
        <h3 className="card-title">Daftar Karyawan</h3>
        
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner-lg" />
            <span>Memuat data...</span>
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <Users className="w-12 h-12" />
            <p>Belum ada karyawan terdaftar</p>
            <p className="text-sm">Klik "Tambah" untuk mendaftarkan karyawan baru</p>
          </div>
        ) : (
          <div className="employee-list">
            {employees.map((emp) => (
              <div key={emp.id} className={`employee-item ${!emp.isActive ? 'inactive' : ''}`}>
                <div className="employee-info">
                  <div className="employee-avatar">
                    {emp.nama.charAt(0).toUpperCase()}
                  </div>
                  <div className="employee-details">
                    <h4 className="employee-name">{emp.nama}</h4>
                    <div className="employee-password">
                      <span className="text-xs text-gray-500">Password: </span>
                      <span className="text-xs font-mono">
                        {showPasswords[emp.id!] ? emp.password : '••••••'}
                      </span>
                    </div>
                    <span className={`employee-badge ${emp.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {emp.isActive ? '🟢 Aktif' : '🔴 Nonaktif'}
                    </span>
                  </div>
                </div>
                <div className="employee-actions">
                  <button
                    onClick={() => togglePasswordVisibility(emp.id!)}
                    className="action-btn"
                    title={showPasswords[emp.id!] ? 'Sembunyikan' : 'Lihat password'}
                  >
                    {showPasswords[emp.id!] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyCredentials(emp.nama, emp.password)}
                    className="action-btn"
                    title="Copy data login"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(emp.id!, emp.isActive)}
                    className="action-btn"
                    title={emp.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {emp.isActive ? '🔒' : '🔓'}
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id!, emp.nama)}
                    className="action-btn action-danger"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
