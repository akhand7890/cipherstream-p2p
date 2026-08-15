'use client';

import React, { useState } from 'react';
import { Copy, Check, Download, ExternalLink, ShieldCheck, Share2, Link as LinkIcon } from 'lucide-react';

/**
 * @param {Object} props
 * @param {import('../../lib/transferVault').TransferRecord[]} [props.transferHistory]
 * @param {(roomCode: string) => void} [props.onReShare]
 */
export const SharedFilesView = ({ transferHistory = [], onReShare }) => {
  const [copiedId, setCopiedId] = useState(null);

  const sharedSessions = transferHistory.map((item) => ({
    id: item.id,
    code: item.roomCode,
    url: `http://localhost:3000/join?code=${item.roomCode}`,
    fileName: item.files?.[0]?.name || 'Encrypted Shared File',
    fileCount: item.fileCount,
    totalSize: item.totalSize,
    timestamp: item.timestamp,
  }));

  const handleCopy = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              DIRECT P2P LINKS
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
              Zero Server Storage
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">Shared Files Directory</h2>
          <p className="text-xs text-slate-400">Direct encrypted peer-to-peer session links generated for your transfers.</p>
        </div>
      </div>

      {/* Shared Links List */}
      <div className="space-y-4">
        {sharedSessions.length === 0 ? (
          <div className="p-16 text-center space-y-3 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800">
            <LinkIcon className="h-12 w-12 text-slate-500 mx-auto" />
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-200">No Active Shared Links</p>
              <p className="text-xs text-slate-400">
                Create a file transfer session to generate direct P2P shareable links!
              </p>
            </div>
          </div>
        ) : (
          sharedSessions.map((session) => (
            <div
              key={session.id}
              className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-3 hover:border-cyan-400/50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{session.fileName}</h4>
                    <p className="text-xs text-slate-400 font-mono">Room Code: <span className="text-cyan-400 font-bold">{session.code}</span></p>
                  </div>
                </div>

                <button
                  onClick={() => onReShare?.(session.code)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Join Session</span>
                </button>
              </div>

              {/* URL Field & Copy Button */}
              <div className="glass-card p-3 rounded-xl border border-slate-700/80 flex items-center justify-between gap-3 bg-slate-950/60">
                <span className="text-xs font-mono text-cyan-300 truncate max-w-lg">{session.url}</span>

                <button
                  onClick={() => handleCopy(session.id, session.url)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs text-slate-200 hover:text-white transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedId === session.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
