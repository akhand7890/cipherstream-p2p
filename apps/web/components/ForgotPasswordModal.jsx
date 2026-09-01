'use client';

import React, { useState } from 'react';
import { KeyRound, Mail, CheckCircle2, ArrowRight, X, RefreshCw, Send, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { resetPassword, getAllUsers } from '@/lib/authDb';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {(user: any) => void} props.onSuccess
 */
export const ForgotPasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Email Input, 2: OTP + New Password
  const [email, setEmail] = useState('');
  const [sentCode, setSentCode] = useState(null);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setError('');
    setDeliveryStatus('');
    setIsSending(true);

    const cleanEmail = email.trim().toLowerCase();
    const users = getAllUsers();
    let existingUser = users.find((u) => u.email === cleanEmail);

    if (!existingUser) {
      try {
        const checkRes = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email: cleanEmail, password: '' }),
        });
        if (checkRes.status === 401) {
          existingUser = { email: cleanEmail, name: 'User' };
        }
      } catch (err) {}
    }

    if (!existingUser) {
      setIsSending(false);
      setError('No registered account found with this email address. Please sign up first.');
      return;
    }

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: generatedCode }),
      });
      const data = await res.json();

      setSentCode(generatedCode);
      setIsSending(false);
      setStep(2);

      if (data.delivered) {
        setDeliveryStatus(`Reset OTP email sent to ${cleanEmail} via Resend API! 📩`);
      } else {
        setDeliveryStatus(`Demo OTP Code: ${generatedCode}`);
      }
    } catch (err) {
      console.warn('Failed to call send-otp API:', err);
      setSentCode(generatedCode);
      setIsSending(false);
      setStep(2);
      setDeliveryStatus(`Demo OTP Code: ${generatedCode}`);
    }
  };

  /**
   * @param {number} index
   * @param {string} value
   */
  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < 5) {
      document.getElementById(`reset-otp-${index + 1}`)?.focus();
    }
  };

  /**
   * @param {number} index
   * @param {React.KeyboardEvent} e
   */
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      document.getElementById(`reset-otp-${index - 1}`)?.focus();
    }
  };

  const fullCode = digits.join('');

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (fullCode !== sentCode) {
      setError(`Invalid OTP code. Use code: ${sentCode}`);
      return;
    }

    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    const result = await resetPassword(email, newPassword);
    if (!result.success) {
      setError(result.error || 'Failed to reset password.');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      onSuccess(result.user || { email, name: 'User', emailVerified: true });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-8 border border-purple-500/30 bg-gradient-to-b from-purple-950/30 via-slate-950/90 to-slate-950 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="space-y-4 py-6 text-center animate-in fade-in zoom-in-90 duration-300">
            <div className="h-20 w-20 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Password Reset Successful!</h3>
              <p className="text-xs text-emerald-400 font-mono">
                Logging you into your account...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Icon Header */}
            <div className="h-16 w-16 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <KeyRound className="h-8 w-8" />
            </div>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400">
                PASSWORD RECOVERY
              </span>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">Forgot Password</h3>
              <p className="text-xs text-slate-400">
                {step === 1
                  ? 'Enter your account email to receive a 6-digit reset code.'
                  : `Enter the OTP code sent to ${email} and your new password.`}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Account Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition pl-10"
                    required
                  />
                  <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-bold text-sm transition shadow-lg shadow-purple-600/35 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Checking Account & Sending OTP...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Reset OTP Code
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                {deliveryStatus && (
                  <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-500/30 text-xs text-purple-300 font-mono text-center">
                    {deliveryStatus}
                  </div>
                )}

                {/* 6-Digit OTP Code Input */}
                <div className="flex justify-center gap-2">
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`reset-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-13 text-center text-2xl font-extrabold font-mono bg-slate-900/90 text-purple-400 border border-slate-700 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 focus:outline-none transition"
                    />
                  ))}
                </div>

                {/* New Password */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition pr-10 pl-10"
                    required
                  />
                  <Lock className="h-3.5 w-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Confirm New Password */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition pr-10 pl-10"
                    required
                  />
                  <Lock className="h-3.5 w-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>

                <button
                  type="submit"
                  disabled={fullCode.length !== 6 || !newPassword}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm transition shadow-lg shadow-purple-600/35 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Reset Password & Log In
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
