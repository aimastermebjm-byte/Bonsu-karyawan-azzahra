import React, { useState, useEffect } from 'react';
import { Calendar, Package, Plus, Award, TrendingUp, BarChart, Users } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { ProductionEntry, DailyBonusData, Employee } from '../types';
import { calculateBonus, formatCurrency, formatDate } from '../utils/bonusCalculator';
import { useAuth } from '../context/AuthContext';
import { useFirebase } from '../context/FirebaseContext';
import { useFormula } from '../context/FormulaContext';
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
  const [summaryStats, setSummaryStats] = useState({ todayProd: 0, todayBonus: 0, monthProd: 0, monthBonus: 0 });
  const { formulas, defaultFormula, setDefaultFormula } = useFormula();
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [showBonusPopup, setShowBonusPopup] = useState(false);
  const [bonusPopupData, setBonusPopupData] = useState({ bonusAmount: 0, totalProduction: 0 });
  const [previewFormulaId, setPreviewFormulaId] = useState<string | null>(null);

  // Owner: pilih karyawan
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedKaryawanId, setSelectedKaryawanId] = useState<string>('');

  const isOwner = user?.role === 'owner';
  const activeKaryawanId = isOwner ? selectedKaryawanId : user?.karyawanId || '';

  useEffect(() => {
    if (isOwner && isConnected) {
      loadEmployees();
    }
  }, [isOwner, isConnected]);

  useEffect(() => {
    if (isConnected) {
      loadBonusData();
    }
  }, [isConnected, filterMonth, filterYear, activeKaryawanId]);

  useEffect(() => {
    if (previewFormulaId !== null) {
      const pFormula = formulas.find(f => f.id === previewFormulaId) || null;
      loadBonusDataWithFormula(pFormula);
    } else {
      loadBonusData();
    }
  }, [previewFormulaId, defaultFormula, formulas]);

  const loadEmployees = async () => {
    try {
      const q = query(collection(db, 'karyawan'), orderBy('nama'));
      const snapshot = await getDocs(q);
      const data: Employee[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Employee));
      setEmployees(data.filter(e => e.isActive));
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadBonusDataWithFormula = async (formulaToUse: any) => {
    try {
      let q;
      if (activeKaryawanId) {
        q = query(
          collection(db, "produksi"),
          where("karyawanId", "==", activeKaryawanId),
          orderBy("createdAt", "desc")
        );
      } else if (!isOwner && user?.karyawanId) {
        q = query(
          collection(db, "produksi"),
          where("karyawanId", "==", user.karyawanId),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(collection(db, "produksi"), orderBy("createdAt", "desc"));
      }

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

      // Calculate absolute Today and This Month stats (ignoring UI filter)
      const todayDate = new Date();
      // Use local timezone to get today's date string matching input type="date"
      const offset = todayDate.getTimezoneOffset() * 60000;
      const todayStr = new Date(todayDate.getTime() - offset).toISOString().split('T')[0];
      const currentMonth = todayDate.getMonth();
      const currentYear = todayDate.getFullYear();
      
      const todayTotalsMap: Record<string, number> = {};
      const monthTotalsMap: Record<string, number> = {};

      data.forEach(entry => {
        const entryDate = new Date(entry.date);
        
        // Today
        if (entry.date === todayStr) {
           if(!todayTotalsMap[entry.date]) todayTotalsMap[entry.date] = 0;
           todayTotalsMap[entry.date] += entry.production;
        }

        // This month
        if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
           if(!monthTotalsMap[entry.date]) monthTotalsMap[entry.date] = 0;
           monthTotalsMap[entry.date] += entry.production;
        }
      });

      let tProd = 0; let tBonus = 0;
      Object.keys(todayTotalsMap).forEach(d => {
        tProd += todayTotalsMap[d];
        tBonus += calculateBonus(todayTotalsMap[d], formulaToUse).total;
      });

      let mProd = 0; let mBonus = 0;
      Object.keys(monthTotalsMap).forEach(d => {
        mProd += monthTotalsMap[d];
        mBonus += calculateBonus(monthTotalsMap[d], formulaToUse).total;
      });

      setSummaryStats({ todayProd: tProd, todayBonus: tBonus, monthProd: mProd, monthBonus: mBonus });

    } catch (error) {
      console.error("Error loading bonus data:", error);
    }
  };

  const loadBonusData = async () => {
    await loadBonusDataWithFormula(defaultFormula);
  };

  const makeDefault = async (formulaId: string) => {
    await setDefaultFormula(formulaId);
    setPreviewFormulaId(null);
    alert(`✅ Formula berhasil dijadikan default!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    // Owner harus pilih karyawan
    if (isOwner && !selectedKaryawanId) {
      alert('⚠️ Pilih karyawan terlebih dahulu!');
      return;
    }

    const karyawanId = isOwner ? selectedKaryawanId : user?.karyawanId || '';
    const karyawanNama = isOwner 
      ? employees.find(e => e.id === selectedKaryawanId)?.nama || ''
      : user?.karyawanNama || user?.name || '';

    if (!karyawanId) {
      alert('⚠️ Data karyawan tidak valid!');
      return;
    }

    setIsLoading(true);

    try {
      const today = date;
      let totalDailyProduction = parseInt(production);
      
      // Get existing data for the same day + same karyawan
      const q = query(
        collection(db, "produksi"),
        where("karyawanId", "==", karyawanId),
        where("date", "==", today)
      );
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as ProductionEntry;
        totalDailyProduction += data.production;
      });

      await addDoc(collection(db, "produksi"), {
        date,
        boxSize,
        production: parseInt(production),
        karyawanId,
        karyawanNama,
        createdAt: new Date().toISOString()
      });

      // Show bonus popup
      const dailyBonus = calculateBonus(totalDailyProduction, defaultFormula);
      setBonusPopupData({
        bonusAmount: dailyBonus.total,
        totalProduction: totalDailyProduction
      });
      setShowBonusPopup(true);
      
      setBoxSize('');
      setProduction('');
      
      await loadBonusData();
    } catch (error: any) {
      console.error("Error adding production:", error);
      alert(`❌ Gagal menyimpan data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // UI Variables
  const currentDisplayFormula = previewFormulaId ? formulas.find(f => f.id === previewFormulaId) : defaultFormula;
  const isPreviewMode = previewFormulaId !== null;

  return (
    <div className="content-section">
      {/* Owner: Pilih Karyawan */}
      {isOwner && (
        <div className="card animate-in">
          <h3 className="card-title">
            <Users className="w-5 h-5" />
            <span>Pilih Karyawan</span>
          </h3>
          <select
            value={selectedKaryawanId}
            onChange={(e) => setSelectedKaryawanId(e.target.value)}
            className="input-field"
          >
            <option value="">-- Semua Karyawan --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nama}</option>
            ))}
          </select>
        </div>
      )}

      {/* Formula Info - Collapsible on mobile */}
      {isOwner && (
        <div className={`card animate-in ${isPreviewMode ? 'card-warning' : 'card-info'}`}>
          <div className="card-title-row">
            <h3 className={`card-title ${isPreviewMode ? 'text-orange' : 'text-indigo'}`}>
              <Award className="w-5 h-5" />
              <span>
                {isPreviewMode 
                  ? `Preview: ${currentDisplayFormula?.name}` 
                  : `Formula Aktif: ${currentDisplayFormula?.name || 'Tidak ada'}`}
              </span>
            </h3>
          </div>
          
          <div className="formula-controls">
            <div className="input-group">
              <label className="input-label">Pilih Formula:</label>
              <select
                value={currentDisplayFormula?.id || ''}
                onChange={(e) => {
                  const selectedFormulaId = e.target.value;
                  if (selectedFormulaId === defaultFormula?.id) {
                    setPreviewFormulaId(null);
                  } else {
                    setPreviewFormulaId(selectedFormulaId);
                  }
                }}
                className="input-field"
              >
                <option value="" disabled>Pilih Formula</option>
                {formulas.map((formula) => (
                  <option key={formula.id} value={formula.id}>{formula.name}</option>
                ))}
              </select>
            </div>
            
            {isPreviewMode && currentDisplayFormula?.id && (
              <button
                onClick={() => makeDefault(currentDisplayFormula.id!)}
                className="btn-success"
              >
                Tetapkan Default
              </button>
            )}
          </div>

          {isPreviewMode && (
            <div className="alert-warning">
              ⚠️ Mode Preview — klik "Tetapkan Default" untuk menggunakan formula ini.
            </div>
          )}
          
          <div className="formula-desc">
            {currentDisplayFormula?.description?.split('\n').map((line, index) => (
              <div key={index} className="formula-line">{line}</div>
            )) || <div className="text-muted">Belum ada deskripsi formula.</div>}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="card animate-in">
        <h3 className="card-title">
          <Plus className="w-5 h-5" />
          <span>Tambah Data Produksi</span>
        </h3>
        
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="input-group">
            <label className="input-label">
              <Calendar className="input-icon" />
              Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <label className="input-label">
                <Package className="input-icon" />
                Ukuran Kardus
              </label>
              <select
                value={boxSize}
                onChange={(e) => setBoxSize(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Pilih Ukuran</option>
                {boxSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            
            <div className="input-group">
              <label className="input-label">
                <BarChart className="input-icon" />
                Jumlah
              </label>
              <input
                type="number"
                value={production}
                onChange={(e) => setProduction(e.target.value)}
                placeholder="Jumlah produksi"
                min="1"
                className="input-field"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !isConnected}
            className={`btn-primary ${(isLoading || !isConnected) ? 'btn-disabled' : ''}`}
          >
            {isLoading ? (
              <div className="btn-loading"><div className="spinner" /><span>Menyimpan...</span></div>
            ) : !isConnected ? (
              <div className="btn-content"><span>❌ Tidak Terhubung</span></div>
            ) : (
              <div className="btn-content"><Plus className="w-5 h-5" /><span>Tambah Data</span></div>
            )}
          </button>
        </form>
      </div>

      {/* Filter */}
      <div className="card animate-in">
        <h3 className="card-title">Filter Data</h3>
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

      {/* Statistics */}
      <div className="stats-grid-4">
        <div className="stat-card stat-emerald">
          <Calendar className="w-5 h-5" />
          <div>
            <p className="stat-value">{summaryStats.todayProd.toLocaleString()}</p>
            <p className="stat-label">Produksi Hari Ini</p>
          </div>
        </div>
        <div className="stat-card stat-blue">
          <Award className="w-5 h-5" />
          <div>
            <p className="stat-value">{formatCurrency(summaryStats.todayBonus)}</p>
            <p className="stat-label">Bonus Hari Ini</p>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <Package className="w-5 h-5" />
          <div>
            <p className="stat-value">{summaryStats.monthProd.toLocaleString()}</p>
            <p className="stat-label">Produksi Bulan Ini</p>
          </div>
        </div>
        <div className="stat-card stat-indigo">
          <TrendingUp className="w-5 h-5" />
          <div>
            <p className="stat-value">{formatCurrency(summaryStats.monthBonus)}</p>
            <p className="stat-label">Bonus Bulan Ini</p>
          </div>
        </div>
      </div>

      {/* Bonus Data List */}
      <div className="card animate-in">
        <h3 className="card-title">Data Bonus Harian</h3>
        
        {dailyBonusData.length === 0 ? (
          <div className="empty-state">
            <Package className="w-12 h-12" />
            <p>Belum ada data produksi</p>
          </div>
        ) : (
          <div className="bonus-list">
            {dailyBonusData.map((entry, index) => (
              <div key={index} className="bonus-item">
                <div className="bonus-item-header">
                  <span className="bonus-date">📅 {formatDate(entry.date)}</span>
                  <span className="bonus-production">📦 {entry.totalProduction.toLocaleString()} pcs</span>
                </div>
                
                {entry.bonus.total > 0 && (
                  <div className="bonus-tiers">
                    {entry.bonus.tier1 > 0 && (
                      <div className="bonus-tier-row">
                        <span>🥉 Tingkat 1</span>
                        <span>{formatCurrency(entry.bonus.tier1)}</span>
                      </div>
                    )}
                    {entry.bonus.tier2 > 0 && (
                      <div className="bonus-tier-row">
                        <span>🥈 Tingkat 2</span>
                        <span>{formatCurrency(entry.bonus.tier2)}</span>
                      </div>
                    )}
                    {entry.bonus.tier3 > 0 && (
                      <div className="bonus-tier-row">
                        <span>🥇 Tingkat 3</span>
                        <span>{formatCurrency(entry.bonus.tier3)}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className={`bonus-total ${entry.bonus.total > 0 ? 'has-bonus' : ''}`}>
                  💰 Total Bonus: {formatCurrency(entry.bonus.total)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bonus Popup */}
      <BonusPopup
        isOpen={showBonusPopup}
        onClose={() => setShowBonusPopup(false)}
        bonusAmount={bonusPopupData.bonusAmount}
        totalProduction={bonusPopupData.totalProduction}
      />
    </div>
  );
}