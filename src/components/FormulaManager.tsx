import React, { useState } from 'react';
import { useFormula } from '../context/FormulaContext';
import { Plus, Trash2, Check, X } from 'lucide-react';

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
    
    // Validasi tiers
    for (let i = 0; i < tiers.length; i++) {
      if (tiers[i].min > tiers[i].max) {
        alert(`Minimum tidak boleh lebih besar dari maksimum pada tingkat ${i + 1}`);
        return;
      }
    }

    try {
      // Auto-generate description if empty
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
    return <div className="text-center p-8">Memuat Data Formula...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Formula Bonus</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{isAdding ? 'Batal' : 'Buat Formula Baru'}</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow border border-blue-100">
          <h3 className="text-lg font-semibold mb-4">Buat Formula Baru</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Formula</label>
              <input 
                type="text" 
                value={newFormulaName}
                onChange={e => setNewFormulaName(e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder="Contoh: Bonus Spesial Lebaran"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Deskripsi (Opsional, akan diisi otomatis jika kosong)</label>
              <textarea 
                value={newFormulaDesc}
                onChange={e => setNewFormulaDesc(e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder="Penjelasan singkat tentang formula ini..."
                rows={2}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Tingkatan Bonus (Tiers)</h4>
              <p className="text-sm text-gray-500 mb-3">Gunakan angka 999999 untuk batas maksimal "tanpa batas".</p>
              
              {tiers.map((tier, index) => (
                <div key={index} className="flex flex-wrap sm:flex-nowrap gap-3 mb-3 items-end">
                  <div className="w-full sm:w-1/4">
                    <label className="block text-xs text-gray-500 mb-1">Min. Produksi</label>
                    <input type="number" value={tier.min} onChange={e => updateTier(index, 'min', parseInt(e.target.value) || 0)} className="w-full border rounded p-2" />
                  </div>
                  <div className="w-full sm:w-1/4">
                    <label className="block text-xs text-gray-500 mb-1">Max. Produksi</label>
                    <input type="number" value={tier.max} onChange={e => updateTier(index, 'max', parseInt(e.target.value) || 0)} className="w-full border rounded p-2" />
                  </div>
                  <div className="w-full sm:w-1/4">
                    <label className="block text-xs text-gray-500 mb-1">Tarif (Rp / pcs)</label>
                    <input type="number" value={tier.rate} onChange={e => updateTier(index, 'rate', parseInt(e.target.value) || 0)} className="w-full border rounded p-2" />
                  </div>
                  <div className="w-full sm:w-auto">
                    {tiers.length > 1 && (
                      <button onClick={() => handleRemoveTier(index)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <button onClick={handleAddTier} className="text-blue-600 text-sm font-medium mt-2 flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Tambah Tingkatan
              </button>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button onClick={handleSaveFormula} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">
                Simpan Formula
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formulas.map(formula => (
          <div key={formula.id} className={`bg-white rounded-xl shadow-sm border p-5 ${formula.isDefault ? 'border-green-400 ring-1 ring-green-400' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-800">{formula.name}</h3>
                {formula.isDefault && (
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium mt-1">
                    🟢 Sedang Digunakan (Aktif)
                  </span>
                )}
              </div>
              <div className="flex space-x-1">
                {!formula.isDefault && (
                  <button onClick={() => formula.id && setDefaultFormula(formula.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Jadikan Default">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {!formula.isDefault && formulas.length > 1 && (
                  <button onClick={() => {
                    if (window.confirm('Yakin ingin menghapus formula ini?')) {
                      formula.id && deleteFormula(formula.id);
                    }
                  }} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Hapus">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 whitespace-pre-line">
              {formula.description}
            </p>
            
            <div className="bg-gray-50 rounded p-3 text-sm">
              <h4 className="font-medium text-gray-700 mb-2">Detail Tingkatan:</h4>
              <ul className="space-y-1">
                {formula.tiers.map((t, idx) => (
                  <li key={idx} className="flex justify-between text-gray-600">
                    <span>{t.min} - {t.max === 999999 ? '∞' : t.max} pcs</span>
                    <span className="font-medium">Rp {t.rate}</span>
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
