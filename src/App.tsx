import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FirebaseProvider } from './context/FirebaseContext';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import BonusTab from './components/BonusTab';
import ProductionTab from './components/ProductionTab';
import SalaryTab from './components/SalaryTab';
import FormulaManager from './components/FormulaManager';
import { FormulaProvider } from './context/FormulaContext';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('bonus');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'bonus':
        return <BonusTab />;
      case 'production':
        return user.role === 'owner' ? <ProductionTab /> : <BonusTab />;
      case 'salary':
        return user.role === 'owner' ? <SalaryTab /> : <BonusTab />;
      case 'formulas':
        return user.role === 'owner' ? <FormulaManager /> : <BonusTab />;
      default:
        return <BonusTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderTabContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <FirebaseProvider>
        <FormulaProvider>
          <AppContent />
        </FormulaProvider>
      </FirebaseProvider>
    </AuthProvider>
  );
}

export default App;