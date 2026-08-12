'use client';

import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Lock, Sparkles, Hash } from 'lucide-react';

/**
 * @param {Object} props
 * @param {(code: string, pin?: string) => void} props.onJoinSession
 * @param {boolean} props.isLoading
 */
export const ReceiverView = ({ onJoinSession, isLoading }) => {
  const [useVanityMode, setUseVanityMode] = useState(false);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [customCodeInput, setCustomCodeInput] = useState('');
  const [pin, setPin] = useState('');

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
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  /**
   * @param {number} index
   * @param {React.KeyboardEvent} e
   */
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  const fullCode = useVanityMode ? customCodeInput.trim().toUpperCase() : digits.join('');

  /**
   * @param {React.FormEvent} e
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (fullCode.length >= 4) {
      onJoinSession(fullCode, pin);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">
          Connect directly to the sender
        </span>
        <h2 className="text-4xl font-extrabold text-white tracking-tight">Join Session</h2>
        <p className="text-sm text-slate-400">
          Enter the 6-digit code or custom vanity room alias provided by the sender.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
        {/* Toggle between 6-Digit Code and Custom Vanity Alias */}
        <div className="flex justify-center gap-4 text-xs font-semibold text-slate-400 border-b border-slate-800/80 pb-4">
          <button
            type="button"
            onClick={() => setUseVanityMode(false)}
            className={`flex items-center gap-1.5 pb-1 transition cursor-pointer ${
              !useVanityMode ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <Hash className="h-4 w-4" />
            <span>6-Digit Code</span>
          </button>
          <button
            type="button"
            onClick={() => setUseVanityMode(true)}
            className={`flex items-center gap-1.5 pb-1 transition cursor-pointer ${
              useVanityMode ? 'text-cyan-400 border-b-2 border-cyan-500 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Custom Vanity Alias</span>
          </button>
        </div>

        {useVanityMode ? (
          <div className="max-w-md mx-auto space-y-2">
            <input
              type="text"
              placeholder="e.g. CIPHER-99"
              value={customCodeInput}
              onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase())}
              className="w-full py-3.5 px-4 text-center text-xl font-bold font-mono bg-slate-900/90 text-cyan-300 border border-slate-700 rounded-2xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none transition"
            />
          </div>
        ) : (
          <div className="flex justify-center gap-3">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                id={`digit-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-14 h-16 text-center text-3xl font-extrabold font-mono bg-slate-900/90 text-indigo-400 border border-slate-700/80 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none transition shadow-inner"
              />
            ))}
          </div>
        )}

        {/* Optional Security PIN Input */}
        <div className="max-w-xs mx-auto space-y-1 text-center pt-2">
          <label className="text-xs font-semibold text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-indigo-400" />
            <span>Optional Security PIN (if set by sender)</span>
          </label>
          <input
            type="text"
            maxLength={4}
            placeholder="e.g. 4829"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full px-3 py-2 text-center rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={fullCode.length < 4 || isLoading}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-base transition shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            'Securing Peer Connection...'
          ) : (
            <>
              Join Session & Decrypt Payload
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        Zero-Knowledge Signaling Gateway • Direct WebRTC Connection
      </div>
    </div>
  );
};
