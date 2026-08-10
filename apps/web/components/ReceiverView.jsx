'use client';

import React, { useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

/**
 * @param {Object} props
 * @param {(code: string) => void} props.onJoinSession
 * @param {boolean} props.isLoading
 */
export const ReceiverView = ({ onJoinSession, isLoading }) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);

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

  const fullCode = digits.join('');

  /**
   * @param {React.FormEvent} e
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (fullCode.length === 6) {
      onJoinSession(fullCode);
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
          Enter the 6-digit code provided by the sender to initiate peer connection.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
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

        <button
          type="submit"
          disabled={fullCode.length !== 6 || isLoading}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-base transition shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
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
