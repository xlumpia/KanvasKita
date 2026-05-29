import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { registerUser, loginUser, loginWithOAuth, getCurrentUser } from '../services/db';
import { SEO } from '../components/SEO';

export const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const checkUserSession = async () => {
      const user = await getCurrentUser();
      if (user) {
        navigate('/profil');
      }
    };
    checkUserSession();
  }, [navigate]);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Form values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setErrorMsg('Kata sandi konfirmasi tidak cocok!');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Kata sandi harus minimal 6 karakter!');
        return;
      }

      setIsLoading(true);
      try {
        const res = await registerUser(name, email, password);
        if (typeof res === 'string') {
          setErrorMsg(res);
        } else {
          setSuccessMsg('Akun berhasil dibuat! Silakan masuk.');
          setMode('login');
          setPassword('');
          setConfirmPassword('');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Terjadi kesalahan saat registrasi.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const res = await loginUser(email, password);
        if (typeof res === 'string') {
          setErrorMsg(res);
        } else {
          // Trigger event to navbar/layout to reload session
          window.dispatchEvent(new Event('auth_change'));
          navigate('/profil');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Terjadi kesalahan saat login.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      await loginWithOAuth(provider);
      // OAuth will redirect the page, so loading will persist until redirection
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login OAuth.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-16 px-4 transition-colors duration-300">
      <SEO 
        title={`${mode === 'login' ? 'Masuk Sesi' : 'Daftar Akun'} - KanvasKita`} 
        description="Masuk atau daftarkan akun baru Anda di KanvasKita untuk menyimpan template desain pribadi." 
      />

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl transition-all relative overflow-hidden">
        
        {/* Toggle Mode Tab */}
        <div className="flex bg-slate-100 dark:bg-slate-950/60 p-1.5 rounded-2xl gap-2 mb-8 relative select-none">
          <button
            onClick={() => { setMode('login'); clearForm(); }}
            className={`flex-grow py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              mode === 'login' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Masuk Sesi
          </button>
          <button
            onClick={() => { setMode('register'); clearForm(); }}
            className={`flex-grow py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              mode === 'register' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Header Text */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-black text-slate-850 dark:text-white">
            {mode === 'login' ? 'Selamat Datang Kembali!' : 'Ayo Mulai Desain Anda'}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            {mode === 'login' 
              ? 'Silakan masuk untuk menyimpan, mempublikasikan, dan membagikan karya Anda.' 
              : 'Daftarkan email Anda untuk membuka galeri penyimpanan cloud pribadi.'}
          </p>
        </div>

        {/* Social Authentication Row */}
        <div className="flex flex-col gap-2.5 mb-6">
          <button
            onClick={() => handleOAuthLogin('google')}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-750 dark:text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Masuk dengan Google
          </button>
          <button
            onClick={() => handleOAuthLogin('github')}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-950 dark:bg-black dark:hover:bg-slate-950 border border-slate-850 dark:border-slate-850 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.527-10-10-10z" />
            </svg>
            Masuk dengan GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6 select-none">
          <div className="flex-grow h-[1px] bg-slate-200 dark:bg-slate-800" />
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">atau</span>
          <div className="flex-grow h-[1px] bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Message Panels */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[11px] font-bold text-center mb-4">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[11px] font-bold text-center mb-4">
            {successMsg}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleManualAuth} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-[10px] font-black text-slate-450 uppercase mb-1">Nama Lengkap</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  placeholder="Nama Lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-450 uppercase mb-1">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail size={14} />
              </span>
              <input
                type="email"
                required
                disabled={isLoading}
                placeholder="email@alamat.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-450 uppercase mb-1">Kata Sandi</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock size={14} />
              </span>
              <input
                type="password"
                required
                disabled={isLoading}
                placeholder="Min. 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[10px] font-black text-slate-450 uppercase mb-1">Konfirmasi Kata Sandi</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  placeholder="Ulangi kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
