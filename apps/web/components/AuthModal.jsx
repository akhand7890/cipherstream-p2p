'use client';

import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { loginUser, registerUser } from '@/lib/authDb';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {'login' | 'signup'} props.initialTab
 * @param {() => void} props.onClose
 * @param {(userData: { name: string, email: string, emailVerified: boolean }, rememberMe?: boolean) => void} props.onSuccess
 * @param {() => void} [props.onOpenForgotPassword]
 */
export const AuthModal = ({ isOpen, initialTab = 'login', onClose, onSuccess, onOpenForgotPassword }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
    if (isOpen) {
      setError('');
      setLoginEmail('');
      setLoginPassword('');
      setFirstName('');
      setLastName('');
      setSignupEmail('');
      setSignupPassword('');
      setAgreedTerms(false);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await loginUser({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      setError(result.error || 'Login failed');
      return;
    }

    onSuccess(result.user, rememberMe);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await registerUser({
      name: `${firstName} ${lastName}`.trim(),
      email: signupEmail,
      password: signupPassword,
    });

    if (!result.success) {
      setError(result.error || 'Signup failed');
      return;
    }

    onSuccess(result.user, true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl border border-purple-500/40 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/60 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* LEFT PANEL: LOG IN (Purple Theme) */}
        <div
          className={`p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80 bg-gradient-to-b from-purple-950/30 via-slate-950/40 to-slate-950/60 transition-all duration-300 ${
            activeTab === 'login' ? 'ring-2 ring-purple-500/50 bg-purple-950/20' : 'opacity-80 hover:opacity-100'
          }`}
          onClick={() => {
            setActiveTab('login');
            setError('');
          }}
        >
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400">
                LOG IN
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">Welcome Back</h2>
            </div>

            {/* Glowing P2P Logo */}
            <div className="h-16 w-16 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <ArrowLeftRight className="h-8 w-8 text-purple-400" />
            </div>

            {error && activeTab === 'login' && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-purple-500 focus:ring-purple-500"
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenForgotPassword?.();
                  }}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-bold text-sm transition shadow-lg shadow-purple-600/35 cursor-pointer"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: CREATE ACCOUNT (Cyan Theme) */}
        <div
          className={`p-8 md:p-10 flex flex-col justify-between bg-gradient-to-b from-cyan-950/30 via-slate-950/40 to-slate-950/60 transition-all duration-300 ${
            activeTab === 'signup' ? 'ring-2 ring-cyan-500/50 bg-cyan-950/20' : 'opacity-80 hover:opacity-100'
          }`}
          onClick={() => {
            setActiveTab('signup');
            setError('');
          }}
        >
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                CREATE ACCOUNT
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
                Join CipherStream
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Unlock direct, end-to-end encrypted sharing.
              </p>
            </div>

            {error && activeTab === 'signup' && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              <input
                type="email"
                placeholder="Email Address"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  required
                />
                <span>
                  I agree to the{' '}
                  <a href="#" className="text-cyan-400 hover:underline">
                    Terms of Service & Privacy Policy
                  </a>
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm transition shadow-lg shadow-cyan-500/30 mt-2 cursor-pointer"
              >
                Create Free Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
