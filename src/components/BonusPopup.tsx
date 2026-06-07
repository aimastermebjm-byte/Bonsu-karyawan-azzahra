import React, { useEffect } from 'react';
import { X, Award, Sparkles, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/bonusCalculator';

interface BonusPopupProps {
  isOpen: boolean;
  onClose: () => void;
  bonusAmount: number;
  totalProduction: number;
}

export default function BonusPopup({ isOpen, onClose, bonusAmount, totalProduction }: BonusPopupProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Auto close after 4 seconds to give them time to read
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasBonus = bonusAmount > 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className={`modal-header ${hasBonus ? 'success' : 'fail'}`}></div>
        
        <button onClick={onClose} className="modal-close">
          <X className="w-5 h-5" />
        </button>

        <div className="modal-body">
          {hasBonus ? (
            <>
              <div className="modal-icon-wrap success">
                <Award className="w-10 h-10" />
                <Sparkles className="w-6 h-6 absolute -top-2 -right-2 text-amber-400 animate-bounce" />
              </div>
              <h2 className="modal-title">Selamat! 🎉</h2>
              <p className="modal-desc">Keren, Anda dapat bonus hari ini!</p>

              <div className="modal-box success">
                <p className="modal-box-label">Total Bonus</p>
                <p className="modal-box-val">{formatCurrency(bonusAmount)}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>
                <span>Total Produksi:</span>
                <span style={{ color: 'white' }}>{totalProduction.toLocaleString()} pcs</span>
              </div>
            </>
          ) : (
            <>
              <div className="modal-icon-wrap fail">
                <TrendingUp className="w-10 h-10" />
              </div>
              <h2 className="modal-title">Terus Semangat! 💪</h2>
              <p className="modal-desc">Belum mencapai target bonus hari ini</p>

              <div className="modal-box fail">
                <p className="modal-box-label">Produksi Hari Ini</p>
                <p className="modal-box-val">{totalProduction.toLocaleString()} pcs</p>
              </div>
            </>
          )}
          
          <button onClick={onClose} className="btn-primary" style={{ marginTop: '24px' }}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}