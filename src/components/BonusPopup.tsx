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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`
        relative max-w-md w-full rounded-2xl shadow-2xl transform transition-all duration-300 scale-100
        ${hasBonus 
          ? 'bg-gradient-to-br from-green-400 via-green-500 to-green-600' 
          : 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600'
        }
      `}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="p-8 text-center text-white">
          {hasBonus ? (
            <>
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Award className="w-20 h-20 text-yellow-300" />
                  <Sparkles className="w-8 h-8 text-yellow-200 absolute -top-2 -right-2 animate-pulse" />
                </div>
              </div>

              {/* Congratulations Message */}
              <h2 className="text-3xl font-bold mb-4">
                🎉 Selamat! 🎉
              </h2>
              
              <p className="text-xl mb-6 text-green-100">
                Anda mendapat bonus hari ini!
              </p>

              {/* Bonus Amount */}
              <div className="bg-white/20 rounded-xl p-6 mb-6">
                <p className="text-lg text-green-100 mb-2">💰 Bonus Anda:</p>
                <p className="text-4xl font-bold text-yellow-300">
                  {formatCurrency(bonusAmount)}
                </p>
              </div>

              {/* Production Info */}
              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <p className="text-green-100 mb-1">📦 Total Produksi Hari Ini:</p>
                <p className="text-2xl font-semibold">{totalProduction.toLocaleString()} pcs</p>
              </div>

              <p className="text-green-100">
                Kerja bagus! Terus pertahankan semangat! 💪
              </p>
            </>
          ) : (
            <>
              {/* No Bonus Icon */}
              <div className="flex justify-center mb-6">
                <TrendingUp className="w-20 h-20 text-blue-200" />
              </div>

              {/* Motivational Message */}
              <h2 className="text-3xl font-bold mb-4">
                💪 Tetap Semangat!
              </h2>
              
              <p className="text-xl mb-6 text-blue-100">
                Belum dapat bonus hari ini
              </p>

              {/* Production Info */}
              <div className="bg-white/20 rounded-xl p-6 mb-6">
                <p className="text-blue-100 mb-2">📦 Produksi Hari Ini:</p>
                <p className="text-3xl font-bold">{totalProduction.toLocaleString()} pcs</p>
              </div>

              <p className="text-blue-100 mb-4">
                Sedikit lagi untuk mencapai target bonus!
              </p>
              
              <p className="text-blue-100">
                Besok pasti bisa lebih baik! 🚀
              </p>
            </>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="mt-6 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}