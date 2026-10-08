import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { store } from '../../services/marketplaceStore';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { isDark } = useTheme();

  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const slogan = store.getSlogan();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = login(username, password);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Giriş başarısız!');
      }
    }, 350);
  };

  const handleQuickDemoLogin = () => {
    setUsername('demo');
    setPassword('demo');
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      login('demo', 'demo');
      setIsLoading(false);
    }, 250);
  };

  return (
    <div className={`relative min-h-screen w-full flex flex-col justify-between overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#0B0F19] text-[#F8FAFC]' : 'bg-[#F8FAFC] text-[#14171A]'
    }`}>
      {/* 1. Animated Ambient Aurora Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-Left Glowing Neon Lime Blob */}
        <div
          className={`absolute -top-24 -left-24 w-96 h-96 sm:w-[520px] sm:h-[520px] rounded-full blur-[100px] sm:blur-[130px] animate-float-slow opacity-60 dark:opacity-25 ${
            isDark ? 'bg-[#9FE870]' : 'bg-[#9FE870]'
          }`}
        />

        {/* Bottom-Right Glowing Cyan/Emerald Blob */}
        <div
          className={`absolute -bottom-28 -right-28 w-96 h-96 sm:w-[550px] sm:h-[550px] rounded-full blur-[110px] sm:blur-[140px] animate-float-reverse opacity-55 dark:opacity-20 ${
            isDark ? 'bg-[#06B6D4]' : 'bg-[#38BDF8]'
          }`}
        />

        {/* Center-Top Ambient Indigo Blob */}
        <div
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 sm:w-[480px] sm:h-[480px] rounded-full blur-[120px] sm:blur-[150px] animate-float-diagonal opacity-45 dark:opacity-20 ${
            isDark ? 'bg-[#6366F1]' : 'bg-[#818CF8]'
          }`}
        />

        {/* Center Card Radial Pulse Light */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] rounded-full blur-[90px] animate-pulse-glow bg-[#9FE870]/20 dark:bg-[#9FE870]/10"
        />

        {/* 2. Geometric Cyber Grid Overlay */}
        <div className="absolute inset-0 login-bg-grid opacity-80" />

        {/* 3. Subtle Radial Vignette */}
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/10 dark:to-black/50" />
      </div>

      {/* Top Spacing / Spacer */}
      <div className="pt-4 sm:pt-8" />

      {/* Center Auth Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md">
          {/* Main Glassmorphic Login Card */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-xl transition-all duration-300 ${
            isDark
              ? 'bg-[#151D2A]/90 border-slate-700/80 shadow-black/50 ring-1 ring-white/5'
              : 'bg-white/95 border-slate-200/90 shadow-slate-200/80 ring-1 ring-black/5'
          }`}>
            {/* Jiguli Logo & Slogan inside card */}
            <div className="text-center space-y-1.5 mb-6">
              <div className="flex items-center justify-center text-3xl sm:text-4xl font-black tracking-tight">
                <span className="text-[#163300] dark:text-white mr-1.5 font-bold brand-logo-arrow">↗</span>
                <span className={isDark ? 'text-white' : 'text-[#14171A]'}>Jiguli</span>
              </div>
              <p className="text-xs font-semibold text-slate-400 tracking-tight">
                "{slogan}"
              </p>
            </div>

            {/* Quick Demo Info Box */}
            <div className={`p-3.5 rounded-2xl border mb-5 flex items-start gap-3 transition-colors ${
              isDark
                ? 'bg-[#111827]/90 border-slate-700/80 text-slate-300'
                : 'bg-[#FAFCF8] border-[#9FE870]/40 text-[#163300]'
            }`}>
              <Sparkles className="w-4 h-4 text-[#9FE870] shrink-0 mt-0.5" />
              <div className="text-xs flex-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>Demo Giriş Bilgileri</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#9FE870]/40 text-[#163300] font-mono">
                    Hazır
                  </span>
                </div>
                <div className="mt-1 text-[11px] opacity-90 space-y-0.5 font-mono">
                  <div>Kullanıcı: <strong className="text-[#9FE870]">demo</strong></div>
                  <div>Şifre: <strong className="text-[#9FE870]">demo</strong></div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="px-2.5 py-1 rounded-xl bg-[#9FE870] hover:bg-[#8de058] text-[#163300] text-[11px] font-bold transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
              >
                Hızlı Doldur
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2 mb-4 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 flex items-center justify-between">
                  <span>Kullanıcı Adı</span>
                  <span className="text-[10px] text-slate-500 font-normal">Varsayılan: demo</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="demo"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-[#9FE870]/50 ${
                      isDark
                        ? 'bg-[#111827] border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 flex items-center justify-between">
                  <span>Şifre</span>
                  <span className="text-[10px] text-slate-500 font-normal">Varsayılan: demo</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="demo"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl text-xs font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-[#9FE870]/50 ${
                      isDark
                        ? 'bg-[#111827] border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#163300] accent-[#9FE870] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400 font-medium">Beni hatırla</span>
                </label>

                <span className="text-xs text-[#9FE870] font-semibold hover:underline cursor-pointer">
                  Şifremi unuttum?
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#9FE870] hover:bg-[#8de058] active:scale-[0.98] text-[#163300] font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#163300] border-t-transparent rounded-full animate-spin" />
                    <span>Giriş Yapılıyor...</span>
                  </>
                ) : (
                  <>
                    <span>Panele Giriş Yap</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400">
        Jiguli © 2026 · Güvenli E-Ticaret Otomasyon Platformu
      </footer>
    </div>
  );
};
