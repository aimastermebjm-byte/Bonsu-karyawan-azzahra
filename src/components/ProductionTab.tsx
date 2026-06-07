import React, { useState, useEffect } from 'react';
import { Package, CreditCard as Edit3, Trash2, Filter, Save, X, Calendar, Users } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc, where } from 'firebase/firestore';
import { ProductionEntry, Employee } from '../types';
import { formatDate } from '../utils/bonusCalculator';
import { useFirebase } from '../context/FirebaseContext';

export default function ProductionTab() {
  const { isConnected } = useFirebase();
  const [productionData, setProductionData] = useState<ProductionEntry[]>([]);
  const [filteredData, setFilteredData] = useState<ProductionEntry[]>([]);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterKaryawanId, setFilterKaryawanId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ date: '', boxSize: '', production: '' });
  const [employees, setEmployees] = useState<Employee[]>([]);

  const boxSizes = [
    '10.10.8', '11.11.5', '12.12.10', '12.12.8', '12.6.6',
    '13.6.8', '13.9.6', '15.10.10', '17.9.6', '18.10.8',
    '18.11.11', '20.11.11', '20.15.10', '20.20.15', '30.11.11', '8.8.15'
  ];

  useEffect(() => {
    if (isConnected) {
      loadProductionData();
      loadEmployees();
    }
  }, [isConnected]);

  useEffect(() => {
    applyFilters();
  }, [productionData, filterMonth, filterYear, filterKaryawanId]);

  const loadEmployees = async () => {
    try {
      const q = query(collection(db, 'karyawan'), orderBy('nama'));
      const snapshot = await getDocs(q);
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadProductionData = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "produksi"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data: ProductionEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as ProductionEntry);
      });

      setProductionData(data);
    } catch (error) {
      console.error("Error loading production data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = productionData;
    
    if (filterMonth !== "" || filterYear !== "") {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        const monthMatch = filterMonth === "" || entryDate.getMonth() === parseInt(filterMonth);
        const yearMatch = filterYear === "" || entryDate.getFullYear() === parseInt(filterYear);
        return monthMatch && yearMatch;
      });
    }

    if (filterKaryawanId) {
      filtered = filtered.filter(entry => entry.karyawanId === filterKaryawanId);
    }
    
    setFilteredData(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("❌ Yakin ingin menghapus data ini?")) return;
    
    try {
      await deleteDoc(doc(db, "produksi", id));
      await loadProductionData();
      alert('🗑️ Data berhasil dihapus!');
    } catch (error) {
      console.error("Error deleting document:", error);
      alert('❌ Gagal menghapus data.');
    }
  };

  const handleEdit = (entry: ProductionEntry) => {
    setEditingId(entry.id);
    setEditForm({
      date: entry.date,
      boxSize: entry.boxSize,
      production: entry.production.toString()
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.date || !editForm.boxSize || !editForm.production) {
      alert('⚠️ Semua field harus diisi!');
      return;
    }

    try {
      await updateDoc(doc(db, "produksi", editingId), {
        date: editForm.date,
        boxSize: editForm.boxSize,
        production: parseInt(editForm.production),
        updatedAt: new Date().toISOString()
      });
      
      setEditingId(null);
      setEditForm({ date: '', boxSize: '', production: '' });
      await loadProductionData();
      alert('✅ Data berhasil diupdate!');
    } catch (error) {
      console.error("Error updating document:", error);
      alert('❌ Gagal mengupdate data.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ date: '', boxSize: '', production: '' });
  };

  // Statistics
  const totalBoxTypes = new Set(filteredData.map(entry => entry.boxSize)).size;
  const totalBoxes = filteredData.reduce((sum, entry) => sum + entry.production, 0);

  // Grouping logic for rendering
  const groupedData: Record<string, {
    date: string;
    karyawanId: string;
    karyawanNama: string;
    totalProduction: number;
    entries: ProductionEntry[];
  }> = {};

  filteredData.forEach(entry => {
    const key = `${entry.date}_${entry.karyawanId}`;
    if (!groupedData[key]) {
      groupedData[key] = {
        date: entry.date,
        karyawanId: entry.karyawanId,
        karyawanNama: entry.karyawanNama || '',
        totalProduction: 0,
        entries: []
      };
    }
    groupedData[key].entries.push(entry);
    groupedData[key].totalProduction += entry.production;
  });
  
  const sortedGroupedData = Object.values(groupedData).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="content-section">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          <Package className="w-6 h-6" />
          <span>Data Produksi</span>
        </h2>
      </div>

      {/* Filters */}
      <div className="card animate-in">
        <h3 className="card-title">
          <Filter className="w-5 h-5" />
          <span>Filter Data</span>
        </h3>
        <div className="form-stack">
          <div className="input-group">
            <label className="input-label">
              <Users className="input-icon" />
              Karyawan
            </label>
            <select
              value={filterKaryawanId}
              onChange={(e) => setFilterKaryawanId(e.target.value)}
              className="input-field"
            >
              <option value="">Semua Karyawan</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nama}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="input-field"
            >
              <option value="">Semua Bulan</option>
              {Array.from({length: 12}, (_, i) => (
                <option key={i} value={i}>
                  {new Date(0, i).toLocaleDateString('id-ID', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="input-field"
            >
              <option value="">Semua Tahun</option>
              {Array.from({length: 10}, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-row">
        <div className="stat-card stat-orange">
          <Package className="w-6 h-6" />
          <div>
            <p className="stat-value">{totalBoxTypes}</p>
            <p className="stat-label">Jenis Kardus</p>
          </div>
        </div>
        <div className="stat-card stat-blue">
          <Package className="w-6 h-6" />
          <div>
            <p className="stat-value">{totalBoxes.toLocaleString()}</p>
            <p className="stat-label">Total Kardus</p>
          </div>
        </div>
      </div>

      {/* Production Data - Card Layout */}
      <div className="card animate-in">
        <h3 className="card-title">Data Produksi Detail</h3>
        
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner-lg" />
            <span>Memuat data...</span>
          </div>
        ) : sortedGroupedData.length === 0 ? (
          <div className="empty-state">
            <Package className="w-12 h-12" />
            <p>Belum ada data produksi</p>
          </div>
        ) : (
          <div className="production-list">
            {sortedGroupedData.map((group, gIndex) => (
              <div key={gIndex} className="production-item">
                <div className="production-item-top" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <span className="production-date">{formatDate(group.date)}</span>
                  {group.karyawanNama && (
                    <span className="production-karyawan">{group.karyawanNama}</span>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {group.entries.map((entry) => (
                    <div key={entry.id} className={editingId === entry.id ? 'editing' : ''}>
                      {editingId === entry.id ? (
                        <div className="production-edit-form" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <input
                            type="date"
                            value={editForm.date}
                            onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                            className="input-field"
                            style={{ marginBottom: '12px' }}
                          />
                          <select
                            value={editForm.boxSize}
                            onChange={(e) => setEditForm({...editForm, boxSize: e.target.value})}
                            className="input-field"
                            style={{ marginBottom: '12px' }}
                          >
                            <option value="">Pilih Ukuran</option>
                            {boxSizes.map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            value={editForm.production}
                            onChange={(e) => setEditForm({...editForm, production: e.target.value})}
                            min="1"
                            className="input-field"
                            style={{ marginBottom: '16px' }}
                          />
                          <div className="production-edit-actions" style={{ display: 'flex', gap: '12px', borderTop: 'none', padding: 0, margin: 0 }}>
                            <button onClick={handleSaveEdit} className="btn-success" style={{ flex: 1, padding: '10px' }}>
                              <Save className="w-4 h-4" /> Simpan
                            </button>
                            <button onClick={handleCancelEdit} className="action-btn" style={{ flex: 1, padding: '10px' }}>
                              <X className="w-4 h-4" /> Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span className="production-box-badge">{entry.boxSize}</span>
                            <span className="production-qty" style={{ fontSize: '15px' }}>{entry.production.toLocaleString()} pcs</span>
                          </div>
                          <div className="production-item-actions" style={{ margin: 0, padding: 0, border: 'none' }}>
                            <button onClick={() => handleEdit(entry)} className="action-btn action-edit" title="Edit" style={{ padding: '8px' }}>
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(entry.id)} className="action-btn action-danger" title="Hapus" style={{ padding: '8px' }}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Hari Ini</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--accent-light)' }}>{group.totalProduction.toLocaleString()} pcs</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}