'use client';

import React, { useState } from 'react';
import {
  History,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Flame,
  Share2,
  Trash2,
  FileText,
  ShieldCheck,
  HardDrive,
  Activity,
} from 'lucide-react';

/**
 * Format bytes into human readable string
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format timestamp into relative time
 * @param {number} timestamp
 * @returns {string}
 */
function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Just now';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * @param {Object} props
 * @param {import('../../lib/transferVault').TransferRecord[]} [props.transferHistory]
 * @param {(roomCode: string) => void} [props.onReShare]
 * @param {() => void} [props.onClearHistory]
 */
export const HistoryView = ({ transferHistory = [], onReShare, onClearHistory }) => {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const totalBytesTransferred = transferHistory.reduce((sum, item) => sum + (item.totalSize || 0), 0);
  const totalSentCount = transferHistory.filter((item) => item.type === 'SENT').length;
  const totalReceivedCount = transferHistory.filter((item) => item.type === 'RECEIVED').length;

  const filteredHistory = transferHistory.filter((item) => {
    if (filter !== 'ALL' && item.type !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRoom = item.roomCode?.toLowerCase().includes(q);
      const matchFile = item.files?.some((f) => f.name.toLowerCase().includes(q));
      return matchRoom || matchFile;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
              ZERO-KNOWLEDGE VAULT
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-[10px] font-mono text-purple-300">
              AES-256-GCM
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">Encrypted Transfer History</h2>
          <p className="text-xs text-slate-400">All transfer sessions are encrypted client-side using WebCrypto API.</p>
        </div>

        {transferHistory.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear your transfer history logs?')) {
                onClearHistory?.();
              }
            }}
            className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 transition cursor-pointer self-start md:self-auto"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear History Logs</span>
          </button>
        )}
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-purple-300 font-mono">
            <span>TOTAL TRANSFERRED</span>
            <HardDrive className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">{formatBytes(totalBytesTransferred)}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-mono">
            <span>TOTAL SESSIONS</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">{transferHistory.length} Sessions</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-indigo-300 font-mono">
            <span>SENT / RECEIVED RATIO</span>
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">
            {totalSentCount} <span className="text-xs text-slate-400">Sent</span> / {totalReceivedCount} <span className="text-xs text-slate-400">Recv</span>
          </p>
        </div>
      </div>

      {/* Filter Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/80 border border-slate-800 w-full sm:w-auto">
          {['ALL', 'SENT', 'RECEIVED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === tab
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Transfers' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search filename or room code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition pl-10"
          />
          <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* History Cards List */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="p-16 text-center space-y-3 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800">
            <FileText className="h-12 w-12 text-slate-500 mx-auto" />
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-200">No Transfer Logs Found</p>
              <p className="text-xs text-slate-400">
                {searchQuery || filter !== 'ALL'
                  ? 'No transfer records match your search criteria.'
                  : 'Your encrypted transfer vault is empty. Perform a file transfer to see records here!'}
              </p>
            </div>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const isSent = item.type === 'SENT';
            const mainFileName = item.files?.[0]?.name || 'Encrypted File';
            const extraCount = item.fileCount > 1 ? item.fileCount - 1 : 0;

            return (
              <div
                key={item.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800/90 hover:border-purple-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`p-3.5 rounded-2xl border ${
                      isSent
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                        : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    }`}
                  >
                    {isSent ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white text-base truncate max-w-xs sm:max-w-md">
                        {mainFileName}
                        {extraCount > 0 && (
                          <span className="text-purple-300 font-normal text-xs ml-1.5">
                            +{extraCount} more files
                          </span>
                        )}
                      </p>

                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono tracking-wider ${
                          isSent
                            ? 'bg-purple-950/80 border border-purple-500/40 text-purple-300'
                            : 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300'
                        }`}
                      >
                        {item.type}
                      </span>

                      {item.pinProtected && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-amber-300 flex items-center gap-1">
                          <Lock className="h-3 w-3" /> PIN
                        </span>
                      )}

                      {item.autoDestruct && (
                        <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-[10px] text-rose-300 flex items-center gap-1">
                          <Flame className="h-3 w-3" /> Auto-Destruct
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span>{formatBytes(item.totalSize)}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(item.timestamp)}</span>
                      <span>•</span>
                      <span className="text-purple-400 font-semibold">Room Code: {item.roomCode}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onReShare?.(item.roomCode)}
                    className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/10"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Re-Share Session</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
