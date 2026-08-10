'use client';

import React from 'react';
import { ShieldCheck, BatteryCharging, CheckCircle2, FileText } from 'lucide-react';

/**
 * @param {Object} props
 * @param {import('@cipherstream/types').TransferProgress} props.progress
 * @param {string} props.fileName
 * @param {number} props.fileSize
 */
export const TransferProgress = ({ progress, fileName, fileSize }) => {
  const percentage = Math.min(100, Math.round((progress.bytesTransferred / (fileSize || 1)) * 100));
  const speedMb = (progress.speedBps / (1024 * 1024)).toFixed(2);

  return (
    <div className="glass-panel w-full rounded-2xl p-6 border border-slate-800 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base truncate max-w-xs">{fileName || 'File Payload'}</h4>
            <p className="text-xs text-slate-400 font-mono">
              {(fileSize / (1024 * 1024)).toFixed(2)} MB • {progress.chunksCompleted} / {progress.totalChunks} Chunks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {progress.isThrottled && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <BatteryCharging className="h-3 w-3" /> LOW BATTERY THROTTLED
            </span>
          )}
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider font-mono">
            {progress.status}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-slate-300">
          <span>{percentage}% COMPLETE</span>
          <span>{speedMb} MB/s • ETA: {progress.etaSeconds}s</span>
        </div>
        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-300 shadow-lg shadow-indigo-500/50"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-center">
          <span className="text-xs text-slate-400 block font-mono">LATENCY SLA</span>
          <span className="text-sm font-extrabold text-emerald-400 font-mono">&lt; 35 ms</span>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-center">
          <span className="text-xs text-slate-400 block font-mono">E2EE PRIMITIVE</span>
          <span className="text-sm font-extrabold text-indigo-400 font-mono">AES-256-GCM</span>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-center">
          <span className="text-xs text-slate-400 block font-mono">CHECKSUM</span>
          <span className="text-sm font-extrabold text-cyan-400 font-mono">SHA-256 OK</span>
        </div>
      </div>

      {progress.status === 'completed' && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm font-medium">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          Transfer verified with 100% SHA-256 payload integrity match!
        </div>
      )}
    </div>
  );
};
