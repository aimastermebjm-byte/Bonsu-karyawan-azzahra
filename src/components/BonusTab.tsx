import React, { useState, useEffect } from 'react';
import { Calendar, Package, Plus, Award, TrendingUp, BarChart } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ProductionEntry, DailyBonusData } from '../types';
import { calculateBonus, formatCurrency, formatDate, bonusFormulas } from '../utils/bonusCalculator';
import { useAuth } from '../context/AuthContext';
import { useFirebase } from '../context/FirebaseContext';
import BonusPopup from './BonusPopup';

const boxSizes = [
  '10.10.8', '11.11.5', '12.12.10', '12.12.8', '12.6.6',
  '13.6.8', '13.9.6', '15.10.10', '17.9.6', '18.10.8',
  '18.11.11', '20.11.11', '20.15.10', '20.20.15', '30.11.11', '8.8.15'
];

export default function BonusTab() {
  const { user } = useAuth();
  const { isConnected } = useFirebase();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [boxSize, setBoxSize] = useState('');
  const [production, setProduction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyBonusData, setDailyBonusData] = useState<DailyBonusData[]>([]);
  const [currentFormula, setCurrentFormula] = useState(3);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [showBonusPopup, setShowBonusPopup] = useState(false);
  const [bonusPopupData, setBonusPopupData] = useState({
    bonusAmount: 0,
    totalProduction: 0
  });
  const [previewFormula, setPreviewFormula] = useState<number | null>(null);

  useEffect(() => {
    if (isConnected) {
      loadBonusData();
    }
  }, [isConnected, filterMonth, filterYear]);

  useEffect(() => {
    // Load preview data when preview formula changes
    if (previewFormula !== null) {
      loadBonusDataWithFormula(previewFormula);
    } else {
      loadBonusData();
    }
  }, [previewFormula]);

  const loadBonusDataWithFormula = async (formulaToUse: number) => {
    try {
      const q = query(collection(db, "produksi"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data: ProductionEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as ProductionEntry);
      });

      // Filter by month and year
      let filteredData = data;
      if (filterMonth !== "" || filterYear !== "") {
        filteredData = data.filter(entry => {
          const entryDate = new Date(entry.date);
          const monthMatch = filterMonth === "" || entryDate.getMonth() === parseInt(filterMonth);
          const yearMatch = filterYear === "" || entryDate.getFullYear() === parseInt(filterYear);
          return monthMatch && yearMatch;
        });
      }

      // Group by date and calculate daily totals
      const dailyTotals: Record<string, number> = {};
      filteredData.forEach(entry => {
        if (!dailyTotals[entry.date]) {
          dailyTotals[entry.date] = 0;
        }
        dailyTotals[entry.date] += entry.production;
      });

      // Calculate bonus for each day
      const bonusData = Object.keys(dailyTotals).map(date => {
        const totalProduction = dailyTotals[date];
        const bonus = calculateBonus(totalProduction, formulaToUse);
        return { date, totalProduction, bonus };
      });

      setDailyBonusData(bonusData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error("Error loading bonus data:", error);
    }
  };

  const loadBonusData = async () => {
    const defaultFormula = getDefaultFormula();
    await loadBonusDataWithFormula(defaultFormula);
  };

  const getDefaultFormula = () => {
    const saved = localStorage.getItem('defaultBonusFormula');
    const defaultFormula = saved ? parseInt(saved) : 3;
    return defaultFormula;
  };

  const makeDefault = (formula: number) => {
    localStorage.setItem('defaultBonusFormula', formula.toString());
    setPreviewFormula(null); // Exit preview mode
    loadBonusData(); // Reload with new default
    alert(`✅ Formula ${formula} berhasil dijadikan default!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted:', { date, boxSize, production, isConnected });
    
    if (!isConnected) {
      alert('❌ Tidak terhubung ke database!');
      return;
    }

    if (!boxSize || !production) {
      alert('⚠️ Semua field harus diisi!');
      return;
    }

    if (parseInt(production) <= 0) {
      alert('⚠️ Jumlah produksi harus lebih dari 0!');
      return;
    }
    setIsLoading(true);

    try {
      // Calculate total production for the day
      const today = date;
      let totalDailyProduction = parseInt(production);
      
      // Get existing data for the same day
      const q = query(collection(db, "produksi"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as ProductionEntry;
        if (data.date === today) {
          totalDailyProduction += data.production;
        }
      });

      await addDoc(collection(db, "produksi"), {
        date,
        boxSize,
        production: parseInt(production),
        createdAt: new Date().toISOString()
      });

      // Show bonus popup
      const currentDefaultFormula = getDefaultFormula();
      const dailyBonus = calculateBonus(totalDailyProduction, currentDefaultFormula);
      setBonusPopupData({
        bonusAmount: dailyBonus.total,
        totalProduction: totalDailyProduction
      });
      setShowBonusPopup(true);
      
      // Reset form
      setBoxSize('');
      setProduction('');
      
      // Reload data
      await loadBonusData();
      
      console.log('Data berhasil disimpan');
      
    } catch (error) {
      console.error("Error adding production:", error);
      alert(`❌ Gagal menyimpan data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Statistics
  const totalEntries = dailyBonusData.length;
  const totalProduction = dailyBonusData.reduce((sum, entry) => sum + entry.totalProduction, 0);
  const totalBonus = dailyBonusData.reduce((sum, entry) => sum + entry.bonus.total, 0);

  const currentDisplayFormula = previewFormula || getDefaultFormula();
  const isPreviewMode = previewFormula !== null;

  return (
    <div className="space-y-6">
      {/* Formula Info */}
      <div className={`border rounded-xl p-6 ${
        isPreviewMode
          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold flex items-center space-x-2 ${
            isPreviewMode ? 'text-orange-800' : 'text-blue-800'
          }`}>
            <Award className="w-5 h-5" />
            <span>
              {isPreviewMode ? `Preview Formula ${currentDisplayFormula}` : `Formula Bonus Aktif (${currentDisplayFormula})`}
              {!isPreviewMode && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">DEFAULT</span>
              )}
            </span>
          </h3>
          {user?.role === 'owner' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700">Pilih Formula:</label>
                <select
                  value={currentDisplayFormula}
                  onChange={(e) => {
                    const selectedFormula = parseInt(e.target.value);
                    const defaultFormula = getDefaultFormula();
                    
                    if (selectedFormula === defaultFormula) {
                      setPreviewFormula(null); // Exit preview mode
                    } else {
                      setPreviewFormula(selectedFormula); // Enter preview mode
                    }
                  }}
                  className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(bonusFormulas).map(([key, formula]) => (
                    <option key={key} value={key}>{formula.name}</option>
                  ))}
                </select>
              </div>
              
              {isPreviewMode && (
                <button
                  onClick={() => makeDefault(currentDisplayFormula)}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  Tetapkan Default
                </button>
              )}
            </div>
          )}
        </div>
        
        {isPreviewMode && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-yellow-800 text-sm font-medium">
              ⚠️ Mode Preview: Perhitungan ini hanya untuk melihat hasil. Klik "Tetapkan Default" untuk menggunakan formula ini secara permanen.
            </p>
          </div>
        )}
        
        <div className={`bg-white p-4 rounded-lg border ${
          isPreviewMode ? 'border-orange-200' : 'border-blue-200'
        }`}>
          <div className="space-y-3">
            {bonusFormulas[currentDisplayFormula].description.split('\n').map((line, index) => (
              <div key={index} className={`text-sm font-medium p-2 rounded-md ${
                isPreviewMode ? 'text-orange-700 bg-orange-50' : 'text-blue-700 bg-blue-50'
              }`}>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Tambah Data Produksi</span>
        </h3>
        
        {/* Connection Status Debug */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Status: {isConnected ? '✅ Terhubung' : '❌ Tidak Terhubung'} | 
            Loading: {isLoading ? 'Ya' : 'Tidak'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline w-4 h-4 mr-1" />
                Tanggal Produksi
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Package className="inline w-4 h-4 mr-1" />
                Ukuran Kardus
              </label>
              <select
                value={boxSize}
                onChange={(e) => setBoxSize(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Pilih Ukuran</option>
                {boxSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <BarChart className="inline w-4 h-4 mr-1" />
                Jumlah Produksi
              </label>
              <input
                type="number"
                value={production}
                onChange={(e) => setProduction(e.target.value)}
                placeholder="Masukkan jumlah"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !isConnected}
            className={`w-full py-3 px-4 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
              isLoading || !isConnected
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 cursor-pointer'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </div>
            ) : !isConnected ? (
              <span className="flex items-center justify-center space-x-2">
                <span>❌ Tidak Terhubung</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Tambah Data</span>
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Filter & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="font-medium text-gray-800 mb-3">Filter Data</h4>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">{totalEntries}</p>
                  <p className="text-green-100">Total Entry</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">{totalProduction.toLocaleString()}</p>
                  <p className="text-blue-100">Total Produksi</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Award className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalBonus)}</p>
                  <p className="text-purple-100">Total Bonus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bonus Data List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Bonus Harian</h3>
        
        {dailyBonusData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Belum ada data produksi</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {dailyBonusData.map((entry, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-800">
                    📅 {formatDate(entry.date)}
                  </span>
                  <span className="text-blue-600 font-semibold">
                    📦 {entry.totalProduction.toLocaleString()} pcs
                  </span>
                </div>
                
                {entry.bonus.total > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      {entry.bonus.tier1 > 0 && (
                        <div className="flex justify-between">
                          <span>🥉 Tingkat 1:</span>
                          <span>{formatCurrency(entry.bonus.tier1)}</span>
                        </div>
                      )}
                      {entry.bonus.tier2 > 0 && (
                        <div className="flex justify-between">
                          <span>🥈 Tingkat 2:</span>
                          <span>{formatCurrency(entry.bonus.tier2)}</span>
                        </div>
                      )}
                      {entry.bonus.tier3 > 0 && (
                        <div className="flex justify-between">
                          <span>🥇 Tingkat 3:</span>
                          <span>{formatCurrency(entry.bonus.tier3)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className={`text-center py-2 px-4 rounded-lg font-semibold ${
                  entry.bonus.total > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  💰 Total Bonus: {formatCurrency(entry.bonus.total)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modern Bonus Popup */}
      <BonusPopup
        isOpen={showBonusPopup}
        onClose={() => setShowBonusPopup(false)}
        bonusAmount={bonusPopupData.bonusAmount}
        totalProduction={bonusPopupData.totalProduction}
      />
    </div>
  );
}