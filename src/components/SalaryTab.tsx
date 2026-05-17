import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, Calendar, Users, TrendingUp } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ProductionEntry } from '../types';
import { calculateBonus, formatCurrency } from '../utils/bonusCalculator';
import { useFirebase } from '../context/FirebaseContext';

export default function SalaryTab() {
  const { isConnected } = useFirebase();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [absentDays, setAbsentDays] = useState('');
  const [kasbonAmount, setKasbonAmount] = useState('');
  const [deductionDays, setDeductionDays] = useState('');
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
      calculateSalary();
    }
  }, [isConnected, selectedMonth, selectedYear, absentDays, kasbonAmount, deductionDays]);

  const calculateSalary = async () => {
    try {
      const getDefaultFormula = () => {
        const saved = localStorage.getItem('defaultBonusFormula');
        const defaultFormula = saved ? parseInt(saved) : 3;
        console.log('Salary calculation using formula:', defaultFormula);
        return defaultFormula;
      };

      const q = query(collection(db, "produksi"), orderBy("createdAt", "desc"));
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

      // Calculate total bonus for the month using default formula (3)
      let totalBonus = 0;
      let totalProduction = 0;
      let workingDays = 0;

      Object.keys(dailyTotals).forEach(date => {
        const dailyProduction = dailyTotals[date];
        const bonus = calculateBonus(dailyProduction, getDefaultFormula());
        totalBonus += bonus.total;
        totalProduction += dailyProduction;
        workingDays++;
      });

      // Calculate salary
      const baseSalary = 1500000;
      const absentValue = parseFloat(String(absentDays).replace(',', '.')) || 0;
      const absentDeduction = absentValue * 60000;
      const kasbonDeduction = parseFloat(String(kasbonAmount)) || 0;
      
      // Calculate custom deduction (support decimal with comma)
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
        totalBonus,
        workingDays,
        totalProduction,
        baseSalary,
        absentDeduction,
        kasbonDeduction,
        customDeduction,
        totalDeduction,
        finalSalary
      });

    } catch (error) {
      console.error("Error calculating salary:", error);
    }
  };

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
          <DollarSign className="w-6 h-6" />
          <span>Gaji Karyawan</span>
        </h2>
      </div>

      {/* Salary Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Calculator className="w-5 h-5" />
          <span>Pengaturan Perhitungan Gaji</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="inline w-4 h-4 mr-1" />
              Bulan Gaji
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="inline w-4 h-4 mr-1" />
              Tahun Gaji
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({length: 10}, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Users className="inline w-4 h-4 mr-1" />
              Jumlah Hari Izin/Sakit
            </label>
            <input
              type="text"
              value={absentDays}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9,\.]/g, '');
                setAbsentDays(value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Contoh: 0,5 atau 2"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Contoh: 0,5 = Rp 30.000 | 2 = Rp 120.000
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Jumlah Kasbon (Rp)
            </label>
            <input
              type="number"
              value={kasbonAmount}
              onChange={(e) => setKasbonAmount(e.target.value)}
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan jumlah kasbon"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Users className="inline w-4 h-4 mr-1" />
              Potongan Tambahan (hari)
            </label>
            <input
              type="text"
              value={deductionDays}
              onChange={(e) => {
                // Allow numbers, comma, and dot
                const value = e.target.value.replace(/[^0-9,\.]/g, '');
                setDeductionDays(value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Contoh: 0,5 atau 2,5"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Contoh: 0,5 = Rp 30.000 | 2,5 = Rp 150.000
            </p>
          </div>
        </div>
      </div>

      {/* Salary Summary */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
          <DollarSign className="w-6 h-6" />
          <span>Rincian Gaji Karyawan - {monthNames[selectedMonth]} {selectedYear}</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="text-sm text-green-100 mb-2">💵 Gaji Pokok</h4>
            <p className="text-2xl font-bold">{formatCurrency(salaryData.baseSalary)}</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="text-sm text-green-100 mb-2">🎯 Total Bonus</h4>
            <p className="text-2xl font-bold">{formatCurrency(salaryData.totalBonus)}</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="text-sm text-green-100 mb-2">❌ Potongan Izin</h4>
            <p className="text-2xl font-bold">-{formatCurrency(salaryData.absentDeduction)}</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="text-sm text-green-100 mb-2">💳 Potongan Kasbon</h4>
            <p className="text-2xl font-bold">-{formatCurrency(salaryData.kasbonDeduction)}</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="text-sm text-green-100 mb-2">➖ Potongan Lain</h4>
            <p className="text-2xl font-bold">-{formatCurrency(salaryData.customDeduction)}</p>
          </div>
          
          <div className="bg-white/20 rounded-lg p-4 border-2 border-white/30">
            <h4 className="text-sm text-green-100 mb-2">💰 TOTAL GAJI</h4>
            <p className="text-3xl font-bold">{formatCurrency(salaryData.finalSalary)}</p>
          </div>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8" />
            <div>
              <p className="text-2xl font-bold">{salaryData.workingDays}</p>
              <p className="text-blue-100">Hari Kerja</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8" />
            <div>
              <p className="text-2xl font-bold">{salaryData.totalProduction.toLocaleString()}</p>
              <p className="text-purple-100">Total Produksi</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8" />
            <div>
              <p className="text-2xl font-bold">{formatCurrency(salaryData.totalBonus)}</p>
              <p className="text-green-100">Bonus Bulan Ini</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8" />
            <div>
              <p className="text-2xl font-bold">{formatCurrency(salaryData.totalDeduction)}</p>
              <p className="text-red-100">Total Potongan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Calculation Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detail Perhitungan</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Gaji Pokok</span>
            <span className="font-medium">{formatCurrency(salaryData.baseSalary)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Total Bonus ({salaryData.workingDays} hari kerja)</span>
            <span className="font-medium text-green-600">+ {formatCurrency(salaryData.totalBonus)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Potongan Izin/Sakit ({absentDays || '0'} hari × Rp 60.000)</span>
            <span className="font-medium text-red-600">- {formatCurrency(salaryData.absentDeduction)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Potongan Kasbon</span>
            <span className="font-medium text-red-600">- {formatCurrency(salaryData.kasbonDeduction)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Potongan Tambahan ({deductionDays || '0'} hari × Rp 60.000)</span>
            <span className="font-medium text-red-600">- {formatCurrency(salaryData.customDeduction)}</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-t-2 border-gray-200">
            <span className="text-lg font-semibold text-gray-800">TOTAL GAJI</span>
            <span className="text-xl font-bold text-green-600">{formatCurrency(salaryData.finalSalary)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}