'use client';

import React from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {string | null} props.errorMessage
 * @param {() => void} props.onClose
 */
export const ErrorModal = ({ isOpen, errorMessage, onClose }) => {
  if (!isOpen || !errorMessage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-8 border border-rose-500/40 bg-gradient-to-b from-rose-950/30 via-slate-950/90 to-slate-950 shadow-2xl space-y-6 text-center">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Glowing Red Warning Icon */}
        <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <AlertTriangle className="h-8 w-8 text-rose-400 animate-bounce" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/30 text-[10px] font-bold text-rose-300 uppercase tracking-wider">
            <ShieldAlert className="h-3 w-3" />
            <span>SESSION AUTHENTICATION ERROR</span>
          </div>

          <h3 className="text-2xl font-extrabold text-white tracking-tight">Invalid Code or PIN</h3>
          <p className="text-xs text-slate-300 leading-relaxed px-2">
            {errorMessage}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold text-sm transition shadow-lg shadow-rose-600/30 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};
