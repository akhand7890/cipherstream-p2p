'use client';

import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';

/**
 * @param {Object} props
 * @param {() => void} props.onSendFiles
 * @param {() => void} props.onJoinSession
 */
export const Hero = ({ onSendFiles, onJoinSession }) => {
  return (
    <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6 pt-6">
      {/* Top Pill Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-purple-500/30 text-xs font-semibold text-purple-300 shadow-lg shadow-purple-500/10">
        <Lock className="h-3.5 w-3.5 text-purple-400" />
        <span>PEER-TO-PEER FILE TRANSFER PLATFORM • ZERO CLOUD STORAGE</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
        If privacy and speed matter, your files deserve a{' '}
        <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          direct connection.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
        Share files directly between web browsers with end-to-end WebCrypto encryption. Zero cloud storage, zero file size limits.
      </p>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <button
          onClick={onSendFiles}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-bold text-sm transition-all duration-300 shadow-xl shadow-purple-600/35 flex items-center gap-2 transform hover:-translate-y-0.5"
        >
          Send Files Now
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          onClick={onJoinSession}
          className="px-8 py-3.5 rounded-2xl glass-panel hover:bg-slate-800/60 text-slate-200 hover:text-white font-bold text-sm transition-all duration-300 border border-slate-700/80 shadow-lg"
        >
          Join Session
        </button>
      </div>
    </div>
  );
};
