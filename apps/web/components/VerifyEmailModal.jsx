'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, ShieldCheck, ArrowRight, X, RefreshCw, Send, AlertTriangle } from 'lucide-react';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {string} props.email
 * @param {() => void} props.onClose
 * @param {() => void} props.onVerificationSuccess
 */
export const VerifyEmailModal = ({
  isOpen,
  email,
  onClose,
  onVerificationSuccess,
}) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [sentCode, setSentCode] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [resendNotice, setResendNotice] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendCode = async () => {
    setIsSending(true);
    setError('');
    setDeliveryStatus('');
    setResendNotice('');

    // Generate random 6-digit OTP code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: generatedCode }),
      });
      const data = await res.json();

      setSentCode(generatedCode);
      setIsSending(false);

      if (data.delivered) {
        setDeliveryStatus(`Real OTP email sent to ${email} via Resend API! 📩 Check your inbox.`);
      } else if (data.error) {
        setResendNotice(`Resend API Notice: ${data.error}`);
        setDeliveryStatus(`Demo OTP Code: ${generatedCode}`);
      } else {
        setResendNotice('RESEND_API_KEY is not set in apps/web/.env.local (Restart pnpm dev after adding key).');
        setDeliveryStatus(`Demo OTP Code: ${generatedCode}`);
      }
    } catch (err) {
      console.warn('Failed to call send-otp API:', err);
      setSentCode(generatedCode);
      setIsSending(false);
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
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  /**
   * @param {number} index
   * @param {React.KeyboardEvent} e
   */
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const fullCode = digits.join('');

  /**
   * @param {React.FormEvent} e
   */
  const handleVerify = (e) => {
    e.preventDefault();
    if (fullCode.length !== 6) return;

    if (sentCode && fullCode !== sentCode) {
      setError(`Invalid verification code. Use code: ${sentCode}`);
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      onVerificationSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-8 border border-cyan-500/30 bg-gradient-to-b from-cyan-950/30 via-slate-950/90 to-slate-950 shadow-2xl space-y-6 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="space-y-4 py-6 animate-in fade-in zoom-in-90 duration-300">
            <div className="h-20 w-20 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Email Verified!</h3>
              <p className="text-xs text-emerald-400 font-mono">
                Account Trust Tier Upgraded to <span className="font-bold">Verified Member 🛡️</span>
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Icon Header */}
            <div className="h-16 w-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Mail className="h-8 w-8" />
            </div>

            {/* Header Text */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3 text-cyan-400" />
                <span>RESEND API EMAIL VERIFICATION</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">Verify Your Email</h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                We send a 6-digit OTP code to <span className="text-cyan-400 font-mono font-semibold">{email || 'your email'}</span>.
              </p>
            </div>

            {/* Send Code Section */}
            {!sentCode ? (
              <div className="space-y-4 pt-2">
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSending}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-sm transition shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Sending OTP Email...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send 6-Digit OTP Email
                    </>
                  )}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerify} className="space-y-6 pt-2">
                {/* Resend Notice */}
                {resendNotice && (
                  <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs text-amber-300 font-mono flex items-center gap-2 text-left">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>{resendNotice}</span>
                  </div>
                )}

                {/* Delivery Status Banner */}
                {deliveryStatus && (
                  <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-xs text-cyan-300 font-mono leading-relaxed">
                    {deliveryStatus}
                  </div>
                )}

                {/* 6-Digit Code Input */}
                <div className="flex justify-center gap-2">
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 text-center text-2xl font-extrabold font-mono bg-slate-900/90 text-cyan-400 border border-slate-700 rounded-xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none transition shadow-inner"
                    />
                  ))}
                </div>

                {error && <p className="text-xs text-rose-400 font-semibold">{error}</p>}

                <button
                  type="submit"
                  disabled={fullCode.length !== 6}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm transition shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Verify Code & Upgrade Trust Tier
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
