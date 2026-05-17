import React, { useState, useEffect } from 'react';
import { Package, CreditCard as Edit3, Trash2, Filter, Save, X, Calendar } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { ProductionEntry } from '../types';
import { formatDate } from '../utils/bonusCalculator';
import { useFirebase } from '../context/FirebaseContext';

export default function ProductionTab() {
  const { isConnected } = useFirebase();
  const [productionData, setProductionData] = useState<ProductionEntry[]>([]);
  const [filteredData, setFilteredData] = useState<ProductionEntry[]>([]);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    date: '',
    boxSize: '',
    production: ''
  });

  const boxSizes = [
    '10.10.8', '11.11.5', '12.12.10', '12.12.8', '12.6.6',
    '13.6.8', '13.9.6', '15.10.10', '17.9.6', '18.10.8',
    '18.11.11', '20.11.11', '20.15.10', '20.20.15', '30.11.11', '8.8.15'
  ];

  useEffect(() => {
    if (isConnected) {
      loadProductionData();
    }
  }, [isConnected]);

  useEffect(() => {
    applyFilters();
  }, [productionData, filterMonth, filterYear]);

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
      filtered = productionData.filter(entry => {
        const entryDate = new Date(entry.date);
        const monthMatch = filterMonth === "" || entryDate.getMonth() === parseInt(filterMonth);
        const yearMatch = filterYear === "" || entryDate.getFullYear() === parseInt(filterYear);
        return monthMatch && yearMatch;
      });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
          <Package className="w-6 h-6" />
          <span>Data Produksi</span>
        </h2>
      </div>

      {/* Filters & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter Data</span>
            </h4>
            <div className="space-y-3">
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
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
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">{totalBoxTypes}</p>
                  <p className="text-orange-100">Jenis Kardus</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">{totalBoxes.toLocaleString()}</p>
                  <p className="text-blue-100">Total Kardus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Production Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Data Produksi Detail</h3>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Memuat data...</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Belum ada data produksi</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ukuran Kardus
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((entry) => (
                  <tr key={entry.id} className={`transition-colors ${editingId === entry.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === entry.id ? (
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        formatDate(entry.date)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === entry.id ? (
                        <select
                          value={editForm.boxSize}
                          onChange={(e) => setEditForm({...editForm, boxSize: e.target.value})}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Pilih Ukuran</option>
                          {boxSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {entry.boxSize}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                      {editingId === entry.id ? (
                        <input
                          type="number"
                          value={editForm.production}
                          onChange={(e) => setEditForm({...editForm, production: e.target.value})}
                          min="1"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                        />
                      ) : (
                        `${entry.production.toLocaleString()} pcs`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {editingId === entry.id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Simpan"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Batal"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}