import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loginWithGoogle: () => Promise<boolean>;
  loginAsEmployee: (nama: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmployeeLogin, setIsEmployeeLogin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Jika karyawan login (tanpa Google), jangan overwrite
      if (isEmployeeLogin) {
        setIsLoading(false);
        return;
      }

      if (firebaseUser) {
        const email = firebaseUser.email || '';
        // Cek apakah email yang login adalah email owner
        const ownerEmail = import.meta.env.VITE_OWNER_EMAIL;
        
        if (ownerEmail && email.toLowerCase() === ownerEmail.toLowerCase()) {
          setUser({
            name: firebaseUser.displayName || email.split('@')[0] || 'Owner',
            role: 'owner',
          });
        } else {
          // Jika login Google tapi BUKAN email owner, TOLAK AKSES!
          alert('❌ Akses Ditolak: Login Google HANYA diizinkan untuk Owner aplikasi.');
          signOut(auth);
          setUser(null);
        }
      } else {
        if (!isEmployeeLogin) {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isEmployeeLogin]);

  // Check localStorage for persisted employee session
  useEffect(() => {
    const savedEmployee = localStorage.getItem('employeeSession');
    if (savedEmployee) {
      try {
        const parsed = JSON.parse(savedEmployee);
        setUser({
          name: parsed.nama,
          role: 'employee',
          karyawanId: parsed.id,
          karyawanNama: parsed.nama,
        });
        setIsEmployeeLogin(true);
      } catch (e) {
        localStorage.removeItem('employeeSession');
      }
    }
    setIsLoading(false);
  }, []);

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsEmployeeLogin(false);
      localStorage.removeItem('employeeSession');
      return true;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return false;
    }
  };

  const loginAsEmployee = async (nama: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Query Firestore untuk cari karyawan
      const q = query(
        collection(db, 'karyawan'),
        where('nama', '==', nama.trim()),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { success: false, message: 'Nama karyawan tidak ditemukan.' };
      }

      const employeeDoc = snapshot.docs[0];
      const employeeData = employeeDoc.data();

      if (employeeData.password !== password) {
        return { success: false, message: 'Password salah.' };
      }

      const employeeUser: User = {
        name: employeeData.nama,
        role: 'employee',
        karyawanId: employeeDoc.id,
        karyawanNama: employeeData.nama,
      };

      setUser(employeeUser);
      setIsEmployeeLogin(true);
      
      // Simpan session di localStorage
      localStorage.setItem('employeeSession', JSON.stringify({
        id: employeeDoc.id,
        nama: employeeData.nama,
      }));

      return { success: true, message: 'Login berhasil!' };
    } catch (error) {
      console.error('Error login as employee:', error);
      return { success: false, message: 'Terjadi kesalahan saat login.' };
    }
  };

  const logout = async () => {
    try {
      if (isEmployeeLogin) {
        setUser(null);
        setIsEmployeeLogin(false);
        localStorage.removeItem('employeeSession');
      } else {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, loginAsEmployee, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}