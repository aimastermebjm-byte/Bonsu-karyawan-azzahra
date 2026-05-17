import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, onSnapshot, writeBatch } from 'firebase/firestore';
import { BonusFormula } from '../types';
import { bonusFormulas as oldHardcodedFormulas } from '../utils/bonusCalculator';

interface FormulaContextType {
  formulas: BonusFormula[];
  defaultFormula: BonusFormula | null;
  addFormula: (formula: Omit<BonusFormula, 'id'>) => Promise<void>;
  updateFormula: (id: string, formula: Partial<BonusFormula>) => Promise<void>;
  deleteFormula: (id: string) => Promise<void>;
  setDefaultFormula: (id: string) => Promise<void>;
  isLoadingFormulas: boolean;
}

const FormulaContext = createContext<FormulaContextType | undefined>(undefined);

export function FormulaProvider({ children }: { children: React.ReactNode }) {
  const [formulas, setFormulas] = useState<BonusFormula[]>([]);
  const [defaultFormula, setDefaultFormulaState] = useState<BonusFormula | null>(null);
  const [isLoadingFormulas, setIsLoadingFormulas] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;
    
    const initializeFormulas = async () => {
      try {
        const q = query(collection(db, 'formulas'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          console.log('Migrating hardcoded formulas to Firestore...');
          const batch = writeBatch(db);
          const formulasRef = collection(db, 'formulas');
          
          Object.entries(oldHardcodedFormulas).forEach(([key, formula]) => {
            const newDocRef = doc(formulasRef);
            const isDefault = parseInt(key) === 3; // Make formula 3 the default initially
            batch.set(newDocRef, { ...formula, isDefault });
          });
          
          await batch.commit();
          console.log('Migration completed successfully.');
        }
        
        // Listen to real-time updates
        unsubscribe = onSnapshot(q, (snapshot) => {
          let formulasData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as BonusFormula[];
          
          setFormulas(formulasData);
          
          const defaultF = formulasData.find(f => f.isDefault) || formulasData[0] || null;
          setDefaultFormulaState(defaultF);
          setIsLoadingFormulas(false);
        });
      } catch (error) {
        console.error("Error initializing formulas:", error);
        setIsLoadingFormulas(false);
      }
    };
    
    initializeFormulas();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const addFormula = async (formula: Omit<BonusFormula, 'id'>) => {
    // If it's the first formula being added, make it default automatically
    if (formulas.length === 0) {
      formula.isDefault = true;
    }
    await addDoc(collection(db, 'formulas'), formula);
  };

  const updateFormula = async (id: string, formula: Partial<BonusFormula>) => {
    const docRef = doc(db, 'formulas', id);
    await updateDoc(docRef, formula);
  };

  const deleteFormula = async (id: string) => {
    if (formulas.length <= 1) {
       throw new Error("Tidak bisa menghapus satu-satunya formula yang ada.");
    }
    const docRef = doc(db, 'formulas', id);
    
    // If deleting the default formula, set another one as default first
    const formulaToDelete = formulas.find(f => f.id === id);
    if (formulaToDelete?.isDefault) {
      const alternativeFormula = formulas.find(f => f.id !== id);
      if (alternativeFormula && alternativeFormula.id) {
        await setDefaultFormula(alternativeFormula.id);
      }
    }
    
    await deleteDoc(docRef);
  };

  const setDefaultFormula = async (id: string) => {
    const batch = writeBatch(db);
    
    formulas.forEach(f => {
      if (f.id) {
        const docRef = doc(db, 'formulas', f.id);
        if (f.id === id) {
          batch.update(docRef, { isDefault: true });
        } else if (f.isDefault) {
          batch.update(docRef, { isDefault: false });
        }
      }
    });
    
    await batch.commit();
  };

  return (
    <FormulaContext.Provider value={{ formulas, defaultFormula, addFormula, updateFormula, deleteFormula, setDefaultFormula, isLoadingFormulas }}>
      {children}
    </FormulaContext.Provider>
  );
}

export function useFormula() {
  const context = useContext(FormulaContext);
  if (context === undefined) {
    throw new Error('useFormula must be used within a FormulaProvider');
  }
  return context;
}
