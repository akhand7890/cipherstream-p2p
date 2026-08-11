'use client';

import React from 'react';
import { MoreHorizontal, CheckCircle2, Zap } from 'lucide-react';

/**
 * @param {Object} props
 * @param {import('@cipherstream/types').TransferProgress | null} [props.progress]
 */
export const TelemetryWidget = ({ progress }) => {
  const fileName = progress?.fileId || 'ubuntu-24.04-desktop.iso';
  const percent = progress
    ? Math.min(100, Math.round((progress.bytesTransferred / progress.totalBytes) * 100))
    : 68;
  
  const transferredGB = progress
    ? (progress.bytesTransferred / (1024 * 1024 * 1024)).toFixed(1)
    : '3.2';
  
  const totalGB = progress
    ? (progress.totalBytes / (1024 * 1024 * 1024)).toFixed(1)
    : '4.7';

  const speedBps = progress?.speedBps
    ? (progress.speedBps / (1024 * 1024)).toFixed(1)
    : '24.5';

  const eta = progress?.etaSeconds
    ? `00:${String(progress.etaSeconds).padStart(2, '0')}`
    : '00:15';

  return (
    <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-slate-950/40 space-y-5 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-lg tracking-tight">Live Telemetry Dashboard</h3>
        <button className="text-slate-400 hover:text-white transition">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Main File Stats Card */}
      <div className="glass-panel p-4 rounded-xl space-y-3 border border-slate-700/60 bg-slate-900/70">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-semibold text-slate-200 truncate max-w-[180px]">
            {fileName}
          </span>
          <span className="font-mono text-slate-400">ETA: {eta}</span>
        </div>

        {/* Custom Glowing Cyan/Purple Progress Bar */}
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-300 rounded-full shadow-lg shadow-cyan-500/50"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-cyan-400">{percent}%</span>
          <span className="text-slate-300">{transferredGB} GB / {totalGB} GB</span>
          <span className="font-bold text-purple-300">{speedBps} MB/s</span>
        </div>
      </div>

      {/* Status Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-bold text-emerald-400 shadow-sm">
          <CheckCircle2 className="h-3 w-3" />
          <span>SHA-256 INTEGRITY VERIFIED</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-[10px] font-bold text-amber-400 shadow-sm">
          <Zap className="h-3 w-3 fill-amber-400" />
          <span>LOW BATTERY THROTTLED</span>
        </div>
      </div>

      {/* Real-time SVG Wave Sparkline Chart */}
      <div className="pt-2">
        <svg className="w-full h-12 stroke-cyan-400 fill-none pulse-sparkline" viewBox="0 0 300 50">
          <defs>
            <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 35 Q 25 15, 50 30 T 100 20 T 150 40 T 200 15 T 250 30 T 300 20 L 300 50 L 0 50 Z"
            fill="url(#sparklineGrad)"
            stroke="none"
          />
          <path
            d="M0 35 Q 25 15, 50 30 T 100 20 T 150 40 T 200 15 T 250 30 T 300 20"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};
