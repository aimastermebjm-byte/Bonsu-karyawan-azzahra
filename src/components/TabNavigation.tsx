import React from 'react';
import { Home, Box, Wallet, Settings, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Tab {
  id: string;
  name: string;
  shortName: string;
  icon: (isActive: boolean) => React.ReactNode;
  requiresOwner?: boolean;
}

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs: Tab[] = [
  {
    id: 'bonus',
    name: 'Beranda',
    shortName: 'Beranda',
    icon: (isActive) => <Home className="w-6 h-6" fill={isActive ? 'currentColor' : 'none'} strokeWidth={isActive ? 2 : 1.5} />,
  },
  {
    id: 'production',
    name: 'Data Produksi',
    shortName: 'Produksi',
    icon: (isActive) => <Box className="w-6 h-6" fill={isActive ? 'currentColor' : 'none'} strokeWidth={isActive ? 2 : 1.5} />,
    requiresOwner: true,
  },
  {
    id: 'salary',
    name: 'Gaji Karyawan',
    shortName: 'Gaji',
    icon: (isActive) => <Wallet className="w-6 h-6" fill={isActive ? 'currentColor' : 'none'} strokeWidth={isActive ? 2 : 1.5} />,
    requiresOwner: true,
  },
  {
    id: 'employees',
    name: 'Kelola Karyawan',
    shortName: 'Karyawan',
    icon: (isActive) => <Users className="w-6 h-6" fill={isActive ? 'currentColor' : 'none'} strokeWidth={isActive ? 2 : 1.5} />,
    requiresOwner: true,
  },
  {
    id: 'formulas',
    name: 'Atur Formula',
    shortName: 'Formula',
    icon: (isActive) => <Settings className="w-6 h-6" fill={isActive ? 'currentColor' : 'none'} strokeWidth={isActive ? 2 : 1.5} />,
    requiresOwner: true,
  },
];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const { user } = useAuth();

  // Filter tabs based on user role
  const visibleTabs = tabs.filter(tab => {
    if (tab.requiresOwner && user?.role !== 'owner') {
      return false;
    }
    return true;
  });

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="bottom-nav-icon">{tab.icon(isActive)}</span>
              <span className="bottom-nav-label">{tab.shortName}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}