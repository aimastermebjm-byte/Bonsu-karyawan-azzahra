import React from 'react';
import { X, Award, Sparkles, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/bonusCalculator';

interface BonusPopupProps {
  isOpen: boolean;
  onClose: () => void;
  bonusAmount: number;
  totalProduction: number;
}

export default function BonusPopup({ isOpen, onClose, bonusAmount, totalProduction }: BonusPopupProps) {
  if (!isOpen) return null;

  const hasBonus = bonusAmount > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className={`
        relative max-w-sm w-full rounded-[24px] shadow-2xl transform transition-all duration-300 scale-100 overflow-hidden
        ${hasBonus ? 'bg-white' : 'bg-white'}
      `}>
        {/* Header Background */}
        <div className={`absolute top-0 left-0 right-0 h-32 ${hasBonus ? 'bg-teal-500' : 'bg-slate-500'}`}></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-2 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative pt-12 px-6 pb-8 text-center">
          {hasBonus ? (
            <>
              {/* Success Icon */}
              <div className="flex justify-center mb-4">
                <div className="relative bg-white p-4 rounded-full shadow-lg border-4 border-white">
                  <Award className="w-12 h-12 text-teal-500" />
                  <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1 animate-bounce" />
                </div>
              </div>

              {/* Congratulations Message */}
              <h2 className="text-2xl font-extrabold text-slate-800 mb-1 tracking-tight">
                Selamat! 🎉
              </h2>
              
              <p className="text-sm font-medium text-slate-500 mb-6">
                Anda mendapatkan bonus hari ini
              </p>

              {/* Bonus Amount */}
              <div className="bg-teal-50 rounded-2xl p-5 mb-5 border border-teal-100/50">
                <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Total Bonus</p>
                <p className="text-3xl font-black text-teal-700">
                  {formatCurrency(bonusAmount)}
                </p>
              </div>

              {/* Production Info */}
              <div className="flex justify-between items-center bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                <p className="text-sm font-semibold text-slate-600">Total Produksi</p>
                <p className="text-lg font-bold text-slate-800">{totalProduction.toLocaleString()} pcs</p>
              </div>
            </>
          ) : (
            <>
              {/* No Bonus Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-full shadow-lg border-4 border-white">
                  <TrendingUp className="w-12 h-12 text-slate-400" />
                </div>
              </div>

              {/* Motivational Message */}
              <h2 className="text-2xl font-extrabold text-slate-800 mb-1 tracking-tight">
                Tetap Semangat!
              </h2>
              
              <p className="text-sm font-medium text-slate-500 mb-6">
                Belum mencapai target bonus hari ini
              </p>

              {/* Production Info */}
              <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Produksi Hari Ini</p>
                <p className="text-3xl font-black text-slate-700">{totalProduction.toLocaleString()} pcs</p>
              </div>
            </>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className={`w-full font-bold py-3.5 px-8 rounded-xl transition-colors ${
              hasBonus 
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20' 
                : 'bg-slate-800 hover:bg-slate-900 text-white shadow-md shadow-slate-900/20'
            }`}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}