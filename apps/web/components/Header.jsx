'use client';

import React from 'react';
import { Shield, Lock, Zap, ArrowLeftRight } from 'lucide-react';

/**
 * @param {Object} props
 * @param {'sender' | 'receiver'} props.mode
 * @param {(mode: 'sender' | 'receiver') => void} props.setMode
 * @param {boolean} props.isConnected
 */
export const Header = ({ mode, setMode, isConnected }) => {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ArrowLeftRight className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">CipherStream</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                P2P JSDoc
              </span>
            </div>
            <p className="text-xs text-slate-400">Zero-Cloud Direct Browser Transfers</p>
          </div>
        </div>

        {/* Mode Selector & Status Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-xs font-mono text-slate-300">
              {isConnected ? 'PEER CONNECTED' : 'SIGNALING READY'}
            </span>
          </div>

          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMode('sender')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                mode === 'sender'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              SENDER MODE
            </button>
            <button
              onClick={() => setMode('receiver')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                mode === 'receiver'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              RECEIVER MODE
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
