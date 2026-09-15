import React, { useState } from 'react';
import { X, Lock, User, Mail, Phone, MapPin, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { 
    authModalOpen, 
    authModalMode, 
    setAuthModalMode, 
    closeAuthModal, 
    login, 
    register 
  } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup form state
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  if (!authModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter both email and password.");
      return;
    }
    setLoginLoading(true);
    setLoginError('');
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setLoginError(err.message || "Failed to sign in. Please check your email and password.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!name || !signupEmail || !signupPassword) {
      setSignupError("Please provide your name, email, and password.");
      return;
    }
    setSignupLoading(true);
    setSignupError('');
    try {
      await register({
        name,
        email: signupEmail,
        password: signupPassword,
        phone: phone || "+91 9876543210",
        address: address || "Connaught Place, New Delhi",
        role: "customer"
      });
    } catch (err) {
      setSignupError(err.message || "Failed to create account.");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#111111] via-[#C8A96B] to-[#111111]" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header with Close */}
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F0] dark:bg-[#252525] border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B]">
              <Lock className="w-5 h-5" />
            </div>
            <button
              onClick={closeAuthModal}
              className="p-1.5 rounded-xl hover:bg-[#FAF7F0] dark:hover:bg-[#252525] text-[#858585] hover:text-[#111111] dark:hover:text-white transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MODE 1: "Please Sign In" Prompt */}
          {authModalMode === 'prompt' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#C8A96B] uppercase tracking-wider">Authentication Required</span>
                <h2 className="text-2xl font-black text-[#111111] dark:text-white tracking-tight">
                  Please Sign In
                </h2>
                <p className="text-sm text-[#555555] dark:text-[#858585] leading-relaxed">
                  Please sign in with your email and password or create a new account to continue.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setAuthModalMode('login')}
                  className="btn-emerald-primary w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2 shadow-sm"
                >
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setAuthModalMode('signup')}
                  className="btn-emerald-secondary w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2"
                >
                  <span>Sign Up</span>
                </button>

                <button
                  onClick={closeAuthModal}
                  className="w-full py-2.5 text-sm font-semibold text-[#858585] hover:text-[#111111] dark:hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: Login Form */}
          {authModalMode === 'login' && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#C8A96B] uppercase tracking-wider">Welcome Back</span>
                <h2 className="text-2xl font-black text-[#111111] dark:text-white tracking-tight">
                  Sign In
                </h2>
                <p className="text-xs text-[#858585]">
                  Enter your email and password to access your role account (Admin, Technician, or Customer).
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-sm">
                {/* 2-Column Email and Password Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-[#111111] dark:text-white mb-1.5 text-xs">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#858585] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. admin@coolinghub.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#333333] rounded-xl text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#111111] dark:text-white mb-1.5 text-xs">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#858585] absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#333333] rounded-xl text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="btn-emerald-primary w-full py-3 text-sm font-bold shadow-sm"
                >
                  {loginLoading ? "Signing In..." : "Sign In to Account"}
                </button>
              </form>

              {/* Demo Credentials Reference Guide (Informational Only - No Direct Login) */}
              <div className="pt-3 border-t border-[#E2E0DB] dark:border-[#2E2E2E] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#858585] uppercase tracking-wider">
                    Role Credentials Reference:
                  </span>
                  <span className="text-[10px] text-[#C8A96B] font-semibold">Type Email & Password</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2 rounded-xl bg-[#FAF7F0] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#333333]">
                    <span className="block text-[10px] font-extrabold text-[#C8A96B] uppercase">Admin Role</span>
                    <span className="block text-[11px] font-bold text-[#111111] dark:text-white truncate">admin@coolinghub.com</span>
                    <span className="block text-[10px] text-[#858585]">Pass: admin123</span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#FAF7F0] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#333333]">
                    <span className="block text-[10px] font-extrabold text-[#C8A96B] uppercase">Technician</span>
                    <span className="block text-[11px] font-bold text-[#111111] dark:text-white truncate">tech@coolinghub.com</span>
                    <span className="block text-[10px] text-[#858585]">Pass: tech123</span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#FAF7F0] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#333333]">
                    <span className="block text-[10px] font-extrabold text-[#C8A96B] uppercase">Customer</span>
                    <span className="block text-[11px] font-bold text-[#111111] dark:text-white truncate">kavan@example.com</span>
                    <span className="block text-[10px] text-[#858585]">Pass: password123</span>
                  </div>
                </div>
              </div>

              {/* Footer Switch */}
              <div className="pt-2 text-center text-xs text-[#858585]">
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthModalMode('signup')}
                  className="font-bold text-[#111111] dark:text-[#C8A96B] hover:underline ml-1"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}

          {/* MODE 3: Sign Up Form */}
          {authModalMode === 'signup' && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#C8A96B] uppercase tracking-wider">New Customer</span>
                <h2 className="text-2xl font-black text-[#111111] dark:text-white tracking-tight">
                  Create Account
                </h2>
                <p className="text-xs text-[#858585]">
                  Join Cooling Hub with your email and password for bookings and warranties.
                </p>
              </div>

              {signupError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  {signupError}
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-sm">
                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1 text-xs">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#858585] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Kavan Sharma"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#333333] rounded-xl text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
                      required
                    />
                  </div>
                </div>

                {/* 2-Column Email Address and Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-[#111111] dark:text-white mb-1 text-xs">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#858585] absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="e.g. kavan@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#333333] rounded-xl text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#111111] dark:text-white mb-1 text-xs">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#858585] absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#333333] rounded-xl text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Phone and Delivery City / Address in 2 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-[#111111] dark:text-white mb-1 text-xs">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#858585] absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#333333] rounded-xl text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#111111] dark:text-white mb-1 text-xs">
                      Delivery Address / City
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#858585] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. New Delhi"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#333333] rounded-xl text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={signupLoading}
                  className="btn-emerald-primary w-full py-3.5 text-sm font-bold mt-2"
                >
                  {signupLoading ? "Creating Account..." : "Create Account & Sign In"}
                </button>
              </form>

              {/* Footer Switch */}
              <div className="pt-2 text-center text-xs text-[#858585]">
                Already have an account?{' '}
                <button
                  onClick={() => setAuthModalMode('login')}
                  className="font-bold text-[#111111] dark:text-[#C8A96B] hover:underline ml-1"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
