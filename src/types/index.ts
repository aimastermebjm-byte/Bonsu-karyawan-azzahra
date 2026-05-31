export interface ProductionEntry {
  id: string;
  date: string;
  boxSize: string;
  production: number;
  karyawanId: string;
  karyawanNama: string;
  createdAt: string;
}

export interface BonusCalculation {
  tier1: number;
  tier2: number;
  tier3: number;
  total: number;
}

export interface DailyBonusData {
  date: string;
  totalProduction: number;
  bonus: BonusCalculation;
}

export interface BonusFormula {
  id?: string;
  name: string;
  tiers: { min: number; max: number; rate: number }[];
  description: string;
  isDefault?: boolean;
}

export interface Employee {
  id?: string;
  nama: string;
  password: string;
  isActive: boolean;
  createdAt: string;
}

export type UserRole = 'employee' | 'owner';

export interface User {
  role: UserRole;
  name: string;
  karyawanId?: string;
  karyawanNama?: string;
}