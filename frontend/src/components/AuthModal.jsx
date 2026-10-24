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
    register,
    loginWithGoogle
  } = useAuth();

  // Google sign-in state
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setLoginError('');
    setSignupError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      const msg = err.message || "Failed to sign in with Google.";
      if (authModalMode === 'signup') setSignupError(msg);
      else setLoginError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const renderGoogleButton = (label = "Continue with Google") => (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading || loginLoading || signupLoading}
        className="w-full py-3 px-4 flex items-center justify-center space-x-3 bg-white dark:bg-[#252525] hover:bg-[#FAF7F0] dark:hover:bg-[#2E2E2E] text-[#111111] dark:text-white border border-[#E2E0DB] dark:border-[#383838] rounded-2xl font-bold text-sm shadow-xs hover:shadow-md transition duration-200 cursor-pointer disabled:opacity-60"
      >
        {googleLoading ? (
          <div className="flex items-center space-x-2 text-xs text-[#858585]">
            <span className="w-4 h-4 border-2 border-[#C8A96B] border-t-transparent rounded-full animate-spin" />
            <span>Connecting with Google...</span>
          </div>
        ) : (
          <>
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span className="font-bold">{label}</span>
          </>
        )}
      </button>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#E2E0DB] dark:border-[#2E2E2E] w-full" />
        <span className="bg-white dark:bg-[#1A1A1A] px-3 text-[11px] font-bold text-[#858585] uppercase tracking-wider">
          or continue with email
        </span>
      </div>
    </div>
  );

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
                  Sign in instantly with your Google account or access with your role credentials to continue.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  {loginError}
                </div>
              )}

              {/* Instant Google Login Option */}
              {renderGoogleButton("Sign in with Google")}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => setAuthModalMode('login')}
                  className="btn-emerald-primary py-3 text-sm font-bold flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                >
                  <span>Email Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setAuthModalMode('signup')}
                  className="btn-emerald-secondary py-3 text-sm font-bold flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Sign Up</span>
                </button>
              </div>

              <button
                onClick={closeAuthModal}
                className="w-full py-2 text-xs font-semibold text-[#858585] hover:text-[#111111] dark:hover:text-white transition cursor-pointer"
              >
                Continue as Guest / Cancel
              </button>
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
                  Sign in with Google or enter your role credentials (Admin, Technician, or Customer).
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  {loginError}
                </div>
              )}

              {/* Google Sign-In Button */}
              {renderGoogleButton("Sign in with Google")}

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

              {/* Google Sign-Up Button */}
              {renderGoogleButton("Sign up with Google")}

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
