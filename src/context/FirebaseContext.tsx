import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

interface FirebaseContextType {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'error';
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    const testConnection = async () => {
      try {
        setConnectionStatus('connecting');
        console.log('Testing Firebase connection...');
        
        // Test actual Firestore connection
        const testQuery = query(collection(db, "produksi"), limit(1));
        await getDocs(testQuery);
        
        setIsConnected(true);
        setConnectionStatus('connected');
        console.log('✅ Firebase connected successfully!');
      } catch (error) {
        console.error('❌ Firebase connection failed:', error);
        setIsConnected(false);
        setConnectionStatus('error');
      }
    };

    testConnection();
  }, []);

  return (
    <FirebaseContext.Provider value={{ isConnected, connectionStatus }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}