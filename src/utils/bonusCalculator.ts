import { BonusFormula, BonusCalculation } from '../types';

export const bonusFormulas: Record<number, BonusFormula> = {
  1: {
    name: "Formula 1 (Standard)",
    tiers: [
      { min: 301, max: 400, rate: 100 },
      { min: 401, max: 500, rate: 150 },
      { min: 501, max: 999999, rate: 200 }
    ],
    description: "Tingkat 1: 301-400 pcs → Rp 100/pcs\nTingkat 2: 401-500 pcs → Rp 150/pcs\nTingkat 3: > 500 pcs → Rp 200/pcs"
  },
  2: {
    name: "Formula 2 (Medium)",
    tiers: [
      { min: 301, max: 400, rate: 100 },
      { min: 401, max: 500, rate: 125 },
      { min: 501, max: 999999, rate: 150 }
    ],
    description: "Tingkat 1: 301-400 pcs → Rp 100/pcs\nTingkat 2: 401-500 pcs → Rp 125/pcs\nTingkat 3: > 500 pcs → Rp 150/pcs"
  },
  3: {
    name: "Formula 3 (Simple)",
    tiers: [
      { min: 326, max: 999999, rate: 100 }
    ],
    description: "Tingkat 1: > 326 pcs → Rp 100/pcs"
  },
  4: {
    name: "Formula 4 (Basic)",
    tiers: [
      { min: 301, max: 999999, rate: 100 }
    ],
    description: "Tingkat 1: > 300 pcs → Rp 100/pcs"
  },
  5: {
    name: "Formula 5 (Progressive)",
    tiers: [
      { min: 326, max: 400, rate: 100 },
      { min: 401, max: 500, rate: 125 },
      { min: 501, max: 999999, rate: 150 }
    ],
    description: "Tingkat 1: 326-400 pcs → Rp 100/pcs\nTingkat 2: 401-500 pcs → Rp 125/pcs\nTingkat 3: > 500 pcs → Rp 150/pcs"
  }
};

export function calculateBonus(production: number, formulaNumber: number = 3): BonusCalculation {
  const formula = bonusFormulas[formulaNumber];
  let tier1 = 0, tier2 = 0, tier3 = 0;
  
  // Check minimum thresholds for each formula
  if (formulaNumber === 1 || formulaNumber === 2) {
    if (production <= 300) {
      return { tier1: 0, tier2: 0, tier3: 0, total: 0 };
    }
  } else if (formulaNumber === 3) {
    if (production <= 325) {
      return { tier1: 0, tier2: 0, tier3: 0, total: 0 };
    }
  } else if (formulaNumber === 4) {
    if (production <= 300) {
      return { tier1: 0, tier2: 0, tier3: 0, total: 0 };
    }
  } else if (formulaNumber === 5) {
    if (production <= 325) {
      return { tier1: 0, tier2: 0, tier3: 0, total: 0 };
    }
  }

  formula.tiers.forEach((tier, index) => {
    if (production >= tier.min) {
      const maxForTier = tier.max === 999999 ? production : Math.min(production, tier.max);
      const tierProduction = maxForTier - tier.min + 1;
      const bonus = tierProduction * tier.rate;
      
      if (index === 0) tier1 = bonus;
      else if (index === 1) tier2 = bonus;
      else if (index === 2) tier3 = bonus;
    }
  });
  
  return {
    tier1,
    tier2,
    tier3,
    total: tier1 + tier2 + tier3
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}