import React from 'react';
import { Package, LogOut, User, Crown, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo & Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <Package className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-bold truncate">Azzahra Packing</h1>
              <p className="text-xs sm:text-sm text-blue-100 hidden sm:block">Sistem Bonus & Gaji Karyawan</p>
              <p className="text-xs text-blue-100 sm:hidden">Bonus & Gaji</p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">
              <div className="flex items-center space-x-1 sm:space-x-2">
                {user?.role === 'owner' ? (
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 flex-shrink-0" />
                ) : (
                  <User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate max-w-20 sm:max-w-none">{user?.name}</p>
                  <p className="text-xs text-blue-100 capitalize hidden sm:block">{user?.role}</p>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="p-1 sm:p-1.5 hover:bg-white/20 rounded-md transition-colors flex-shrink-0"
                title="Logout"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile subtitle */}
        <div className="pb-2 sm:hidden">
          <p className="text-xs text-blue-100 text-center">Sistem Bonus & Gaji Karyawan</p>
        </div>
      </div>
    </header>
  );
}