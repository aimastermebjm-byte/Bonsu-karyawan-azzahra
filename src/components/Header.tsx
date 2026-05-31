import React from 'react';
import { Package, LogOut, Crown, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Logo & Title */}
        <div className="header-brand">
          <div className="header-logo">
            <Package className="w-5 h-5" />
          </div>
          <div className="header-title-wrap">
            <h1 className="header-title">Azzahra Packing</h1>
            <p className="header-subtitle">Bonus & Gaji</p>
          </div>
        </div>

        {/* User Info */}
        <div className="header-user">
          <div className="header-user-info">
            {user?.role === 'owner' ? (
              <Crown className="w-4 h-4 text-yellow-300" />
            ) : (
              <User className="w-4 h-4" />
            )}
            <div className="header-user-text">
              <span className="header-user-name">{user?.karyawanNama || user?.name}</span>
              <span className="header-user-role">{user?.role === 'owner' ? 'Owner' : 'Karyawan'}</span>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="header-logout"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}