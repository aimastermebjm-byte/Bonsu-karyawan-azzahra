import React from 'react';
import { BarChart3, Package, DollarSign, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Tab {
  id: string;
  name: string;
  icon: React.ReactNode;
  requiresOwner?: boolean;
}

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs: Tab[] = [
  {
    id: 'bonus',
    name: 'Input Bonus',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: 'production',
    name: 'Data Produksi',
    icon: <Package className="w-5 h-5" />,
    requiresOwner: true,
  },
  {
    id: 'salary',
    name: 'Gaji Karyawan',
    icon: <DollarSign className="w-5 h-5" />,
    requiresOwner: true,
  },
  {
    id: 'formulas',
    name: 'Atur Formula',
    icon: <Settings className="w-5 h-5" />,
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
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}