import React, { useState } from 'react';
import { LogIn, Package, User, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginForm() {
  const [nama, setNama] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOwnerLogin, setShowOwnerLogin] = useState(false);
  const { loginWithGoogle, loginAsEmployee } = useAuth();

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!nama.trim() || !password.trim()) {
      setError('Nama dan password harus diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginAsEmployee(nama.trim(), password);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat masuk.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const success = await loginWithGoogle();
      if (!success) {
        setError('Gagal masuk menggunakan Google.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat masuk.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo & Title */}
        <div className="login-header">
          <div className="login-logo">
            <Package className="login-logo-icon" />
          </div>
          <h1 className="login-title">Azzahra Packing</h1>
          <p className="login-subtitle">Sistem Bonus & Gaji Karyawan</p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          {!showOwnerLogin ? (
            <>
              <div className="login-card-header">
                <User className="login-card-icon" />
                <h2 className="login-card-title">Login Karyawan</h2>
                <p className="login-card-desc">Masukkan nama dan password dari atasan</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="login-error">
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleEmployeeLogin} className="login-form">
                <div className="input-group">
                  <label className="input-label">
                    <User className="input-icon" />
                    Nama Karyawan
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="input-field"
                    placeholder="Masukkan nama"
                    autoComplete="username"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">
                    <Lock className="input-icon" />
                    Password
                  </label>
                  <div className="input-password-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field input-password"
                      placeholder="Masukkan password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? (
                    <div className="btn-loading">
                      <div className="spinner" />
                      <span>Masuk...</span>
                    </div>
                  ) : (
                    <div className="btn-content">
                      <LogIn className="w-5 h-5" />
                      <span>Masuk</span>
                    </div>
                  )}
                </button>
              </form>

              <div className="login-divider">
                <span>atau</span>
              </div>

              <button
                onClick={() => setShowOwnerLogin(true)}
                className="btn-owner-toggle"
              >
                <Shield className="w-4 h-4" />
                <span>Login sebagai Owner</span>
              </button>
            </>
          ) : (
            <>
              <div className="login-card-header">
                <Shield className="login-card-icon owner" />
                <h2 className="login-card-title">Login Owner</h2>
                <p className="login-card-desc">Masuk menggunakan akun Google</p>
              </div>

              {error && (
                <div className="login-error">
                  <p>{error}</p>
                </div>
              )}

              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="btn-google"
              >
                {isLoading ? (
                  <div className="btn-loading">
                    <div className="spinner" />
                    <span>Masuk...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Masuk dengan Google</span>
                  </>
                )}
              </button>

              <div className="login-divider">
                <span>atau</span>
              </div>

              <button
                onClick={() => { setShowOwnerLogin(false); setError(''); }}
                className="btn-owner-toggle"
              >
                <User className="w-4 h-4" />
                <span>Login sebagai Karyawan</span>
              </button>
            </>
          )}
        </div>

        <p className="login-footer">© 2026 Azzahra Packing</p>
      </div>
    </div>
  );
}