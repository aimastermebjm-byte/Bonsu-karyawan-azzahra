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
import EmployeeManager from './components/EmployeeManager';
import { FormulaProvider } from './context/FormulaContext';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('bonus');

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner-lg" />
        <p>Memuat...</p>
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
      case 'employees':
        return user.role === 'owner' ? <EmployeeManager /> : <BonusTab />;
      case 'formulas':
        return user.role === 'owner' ? <FormulaManager /> : <BonusTab />;
      default:
        return <BonusTab />;
    }
  };

  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        {renderTabContent()}
      </main>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
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