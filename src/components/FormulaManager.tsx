import React, { useState } from 'react';
import { useFormula } from '../context/FormulaContext';
import { Plus, Trash2, Check, X, Settings } from 'lucide-react';

export default function FormulaManager() {
  const { formulas, addFormula, deleteFormula, setDefaultFormula, isLoadingFormulas } = useFormula();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newFormulaName, setNewFormulaName] = useState('');
  const [newFormulaDesc, setNewFormulaDesc] = useState('');
  const [tiers, setTiers] = useState([{ min: 1, max: 999999, rate: 100 }]);

  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1];
    setTiers([...tiers, { min: lastTier.max + 1, max: 999999, rate: lastTier.rate + 50 }]);
  };

  const handleRemoveTier = (index: number) => {
    const newTiers = tiers.filter((_, i) => i !== index);
    setTiers(newTiers);
  };

  const updateTier = (index: number, field: keyof typeof tiers[0], value: number) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
  };

  const handleSaveFormula = async () => {
    if (!newFormulaName.trim()) {
      alert("Nama formula tidak boleh kosong");
      return;
    }
    
    for (let i = 0; i < tiers.length; i++) {
      if (tiers[i].min > tiers[i].max) {
        alert(`Minimum tidak boleh lebih besar dari maksimum pada tingkat ${i + 1}`);
        return;
      }
    }

    try {
      let desc = newFormulaDesc;
      if (!desc.trim()) {
        desc = tiers.map((t, idx) => 
          `Tingkat ${idx + 1}: ${t.min}-${t.max === 999999 ? '∞' : t.max} pcs → Rp ${t.rate}/pcs`
        ).join('\n');
      }

      await addFormula({
        name: newFormulaName,
        description: desc,
        tiers: tiers,
        isDefault: formulas.length === 0
      });
      setIsAdding(false);
      setNewFormulaName('');
      setNewFormulaDesc('');
      setTiers([{ min: 1, max: 999999, rate: 100 }]);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan formula");
    }
  };

  if (isLoadingFormulas) {
    return (
      <div className="loading-state">
        <div className="spinner-lg" />
        <span>Memuat Data Formula...</span>
      </div>
    );
  }

  return (
    <div className="content-section">
      <div className="section-header">
        <h2 className="section-title">
          <Settings className="w-6 h-6" />
          <span>Formula Bonus</span>
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`btn-sm ${isAdding ? 'btn-danger' : 'btn-primary-sm'}`}
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? 'Batal' : 'Buat Baru'}</span>
        </button>
      </div>

      {isAdding && (
        <div className="card animate-in">
          <h3 className="card-title">Buat Formula Baru</h3>
          
          <div className="form-stack">
            <div className="input-group">
              <label className="input-label">Nama Formula</label>
              <input 
                type="text" 
                value={newFormulaName}
                onChange={e => setNewFormulaName(e.target.value)}
                className="input-field"
                placeholder="Contoh: Bonus Spesial Lebaran"
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Deskripsi (Opsional)</label>
              <textarea 
                value={newFormulaDesc}
                onChange={e => setNewFormulaDesc(e.target.value)}
                className="input-field textarea"
                placeholder="Penjelasan singkat..."
                rows={2}
              />
            </div>

            <div className="tier-section">
              <h4 className="tier-title">Tingkatan Bonus</h4>
              <p className="input-hint">Gunakan 999999 untuk batas "tanpa batas".</p>
              
              {tiers.map((tier, index) => (
                <div key={index} className="tier-row">
                  <div className="tier-inputs">
                    <div className="input-group">
                      <label className="input-label-sm">Min</label>
                      <input type="number" value={tier.min} onChange={e => updateTier(index, 'min', parseInt(e.target.value) || 0)} className="input-field" />
                    </div>
                    <div className="input-group">
                      <label className="input-label-sm">Max</label>
                      <input type="number" value={tier.max} onChange={e => updateTier(index, 'max', parseInt(e.target.value) || 0)} className="input-field" />
                    </div>
                    <div className="input-group">
                      <label className="input-label-sm">Rp/pcs</label>
                      <input type="number" value={tier.rate} onChange={e => updateTier(index, 'rate', parseInt(e.target.value) || 0)} className="input-field" />
                    </div>
                  </div>
                  {tiers.length > 1 && (
                    <button onClick={() => handleRemoveTier(index)} className="action-btn action-danger">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <button onClick={handleAddTier} className="btn-link">
                <Plus className="w-4 h-4" /> Tambah Tingkatan
              </button>
            </div>
            
            <button onClick={handleSaveFormula} className="btn-success">
              Simpan Formula
            </button>
          </div>
        </div>
      )}

      <div className="formula-grid">
        {formulas.map(formula => (
          <div key={formula.id} className={`card formula-card ${formula.isDefault ? 'card-active' : ''}`}>
            <div className="formula-card-header">
              <div>
                <h3 className="formula-card-name">{formula.name}</h3>
                {formula.isDefault && (
                  <span className="badge-active">🟢 Aktif</span>
                )}
              </div>
              <div className="formula-card-actions">
                {!formula.isDefault && (
                  <button onClick={() => formula.id && setDefaultFormula(formula.id)} className="action-btn action-success" title="Jadikan Default">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {!formula.isDefault && formulas.length > 1 && (
                  <button onClick={() => {
                    if (window.confirm('Yakin ingin menghapus formula ini?')) {
                      formula.id && deleteFormula(formula.id);
                    }
                  }} className="action-btn action-danger" title="Hapus">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <p className="formula-card-desc">{formula.description}</p>
            
            <div className="formula-card-tiers">
              <h4 className="tier-detail-title">Detail Tingkatan:</h4>
              <ul className="tier-detail-list">
                {formula.tiers.map((t, idx) => (
                  <li key={idx} className="tier-detail-item">
                    <span>{t.min} - {t.max === 999999 ? '∞' : t.max} pcs</span>
                    <span className="tier-detail-rate">Rp {t.rate}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
