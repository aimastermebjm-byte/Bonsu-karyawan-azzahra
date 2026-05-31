import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, Calendar, Users, TrendingUp } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { ProductionEntry, Employee } from '../types';
import { calculateBonus, formatCurrency } from '../utils/bonusCalculator';
import { useFirebase } from '../context/FirebaseContext';
import { useFormula } from '../context/FormulaContext';

export default function SalaryTab() {
  const { isConnected } = useFirebase();
  const { defaultFormula } = useFormula();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [absentDays, setAbsentDays] = useState('');
  const [kasbonAmount, setKasbonAmount] = useState('');
  const [deductionDays, setDeductionDays] = useState('');
  const [selectedKaryawanId, setSelectedKaryawanId] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryData, setSalaryData] = useState({
    totalBonus: 0,
    workingDays: 0,
    totalProduction: 0,
    baseSalary: 1500000,
    absentDeduction: 0,
    kasbonDeduction: 0,
    customDeduction: 0,
    totalDeduction: 0,
    finalSalary: 1500000
  });

  useEffect(() => {
    if (isConnected) {
      loadEmployees();
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected && selectedKaryawanId) {
      calculateSalary();
    }
  }, [isConnected, selectedMonth, selectedYear, absentDays, kasbonAmount, deductionDays, selectedKaryawanId, defaultFormula]);

  const loadEmployees = async () => {
    try {
      const q = query(collection(db, 'karyawan'), orderBy('nama'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(data.filter(e => e.isActive));
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const calculateSalary = async () => {
    if (!selectedKaryawanId) return;

    try {
      const q = query(
        collection(db, "produksi"),
        where("karyawanId", "==", selectedKaryawanId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      let data: ProductionEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as ProductionEntry);
      });

      // Filter by selected month and year
      const monthlyData = data.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === selectedMonth && entryDate.getFullYear() === selectedYear;
      });

      // Group by date and calculate daily totals
      const dailyTotals: Record<string, number> = {};
      monthlyData.forEach(entry => {
        if (!dailyTotals[entry.date]) {
          dailyTotals[entry.date] = 0;
        }
        dailyTotals[entry.date] += entry.production;
      });

      // Calculate total bonus for the month
      let totalBonus = 0;
      let totalProduction = 0;
      let workingDays = 0;

      Object.keys(dailyTotals).forEach(date => {
        const dailyProduction = dailyTotals[date];
        const bonus = calculateBonus(dailyProduction, defaultFormula);
        totalBonus += bonus.total;
        totalProduction += dailyProduction;
        workingDays++;
      });

      // Calculate salary
      const baseSalary = 1500000;
      const absentValue = parseFloat(String(absentDays).replace(',', '.')) || 0;
      const absentDeduction = absentValue * 60000;
      const kasbonDeduction = parseFloat(String(kasbonAmount)) || 0;
      
      let customDeduction = 0;
      if (deductionDays) {
        const deductionValue = parseFloat(deductionDays.replace(',', '.'));
        if (!isNaN(deductionValue)) {
          customDeduction = deductionValue * 60000;
        }
      }
      
      const totalDeduction = absentDeduction + kasbonDeduction + customDeduction;
      const finalSalary = baseSalary + totalBonus - totalDeduction;

      setSalaryData({
        totalBonus, workingDays, totalProduction, baseSalary,
        absentDeduction, kasbonDeduction, customDeduction, totalDeduction, finalSalary
      });
    } catch (error) {
      console.error("Error calculating salary:", error);
    }
  };

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const selectedEmployee = employees.find(e => e.id === selectedKaryawanId);

  return (
    <div className="content-section">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          <DollarSign className="w-6 h-6" />
          <span>Gaji Karyawan</span>
        </h2>
      </div>

      {/* Pilih Karyawan */}
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
          <option value="">-- Pilih Karyawan --</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.nama}</option>
          ))}
        </select>
      </div>

      {selectedKaryawanId && (
        <>
          {/* Salary Configuration */}
          <div className="card animate-in">
            <h3 className="card-title">
              <Calculator className="w-5 h-5" />
              <span>Pengaturan Gaji — {selectedEmployee?.nama}</span>
            </h3>
            
            <div className="form-stack">
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">
                    <Calendar className="input-icon" />
                    Bulan
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="input-field"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">
                    <Calendar className="input-icon" />
                    Tahun
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="input-field"
                  >
                    {Array.from({length: 10}, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>
              </div>
              
              <div className="input-group">
                <label className="input-label">Hari Izin/Sakit</label>
                <input
                  type="text"
                  value={absentDays}
                  onChange={(e) => setAbsentDays(e.target.value.replace(/[^0-9,\.]/g, ''))}
                  className="input-field"
                  placeholder="Contoh: 0,5 atau 2"
                />
                <p className="input-hint">💡 0,5 = Rp 30.000 | 2 = Rp 120.000</p>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Kasbon (Rp)</label>
                  <input
                    type="number"
                    value={kasbonAmount}
                    onChange={(e) => setKasbonAmount(e.target.value)}
                    min="0"
                    step="1000"
                    className="input-field"
                    placeholder="Jumlah kasbon"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Potongan Lain (hari)</label>
                  <input
                    type="text"
                    value={deductionDays}
                    onChange={(e) => setDeductionDays(e.target.value.replace(/[^0-9,\.]/g, ''))}
                    className="input-field"
                    placeholder="Contoh: 0,5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Salary Summary */}
          <div className="salary-summary animate-in">
            <h3 className="salary-summary-title">
              <DollarSign className="w-6 h-6" />
              <span>Rincian Gaji — {selectedEmployee?.nama}</span>
            </h3>
            <p className="salary-summary-period">{monthNames[selectedMonth]} {selectedYear}</p>
            
            <div className="salary-items">
              <div className="salary-item">
                <span className="salary-item-label">💵 Gaji Pokok</span>
                <span className="salary-item-value">{formatCurrency(salaryData.baseSalary)}</span>
              </div>
              <div className="salary-item">
                <span className="salary-item-label">🎯 Total Bonus</span>
                <span className="salary-item-value text-green">+{formatCurrency(salaryData.totalBonus)}</span>
              </div>
              <div className="salary-item">
                <span className="salary-item-label">❌ Potongan Izin</span>
                <span className="salary-item-value text-red">-{formatCurrency(salaryData.absentDeduction)}</span>
              </div>
              <div className="salary-item">
                <span className="salary-item-label">💳 Kasbon</span>
                <span className="salary-item-value text-red">-{formatCurrency(salaryData.kasbonDeduction)}</span>
              </div>
              <div className="salary-item">
                <span className="salary-item-label">➖ Potongan Lain</span>
                <span className="salary-item-value text-red">-{formatCurrency(salaryData.customDeduction)}</span>
              </div>
              <div className="salary-total">
                <span className="salary-total-label">💰 TOTAL GAJI</span>
                <span className="salary-total-value">{formatCurrency(salaryData.finalSalary)}</span>
              </div>
            </div>
          </div>

          {/* Monthly Statistics */}
          <div className="stats-grid-4">
            <div className="stat-card stat-blue">
              <Calendar className="w-5 h-5" />
              <div>
                <p className="stat-value">{salaryData.workingDays}</p>
                <p className="stat-label">Hari Kerja</p>
              </div>
            </div>
            <div className="stat-card stat-purple">
              <TrendingUp className="w-5 h-5" />
              <div>
                <p className="stat-value">{salaryData.totalProduction.toLocaleString()}</p>
                <p className="stat-label">Produksi</p>
              </div>
            </div>
            <div className="stat-card stat-emerald">
              <DollarSign className="w-5 h-5" />
              <div>
                <p className="stat-value">{formatCurrency(salaryData.totalBonus)}</p>
                <p className="stat-label">Bonus</p>
              </div>
            </div>
            <div className="stat-card stat-red">
              <Users className="w-5 h-5" />
              <div>
                <p className="stat-value">{formatCurrency(salaryData.totalDeduction)}</p>
                <p className="stat-label">Potongan</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}