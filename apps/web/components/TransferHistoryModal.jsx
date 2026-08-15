'use client';

import React, { useState } from 'react';
import {
  History,
  X,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Flame,
  Share2,
  Trash2,
  FileText,
  ShieldCheck,
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
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {import('../lib/transferVault').TransferRecord[]} [props.transferHistory]
 * @param {(roomCode: string) => void} [props.onReShare]
 * @param {() => void} [props.onClearHistory]
 */
export const TransferHistoryModal = ({
  isOpen,
  onClose,
  transferHistory = [],
  onReShare,
  onClearHistory,
}) => {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'SENT' | 'RECEIVED'
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl p-6 md:p-8 border border-purple-500/40 bg-gradient-to-b from-purple-950/30 via-slate-950/95 to-slate-950 shadow-2xl space-y-6 max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <History className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
                  ZERO-KNOWLEDGE VAULT
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-[9px] font-mono text-purple-300">
                  AES-256-GCM
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Transfer History Logs
              </h3>
            </div>
          </div>

          {transferHistory.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear your transfer history logs?')) {
                  onClearHistory?.();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Tab Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 w-full sm:w-auto">
            {['ALL', 'SENT', 'RECEIVED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filter === tab
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'ALL' ? 'All Logs' : tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search filename or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition pl-9"
            />
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Transfer Items Scroll Area */}
        <div className="overflow-y-auto space-y-3 pr-1 grow">
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center space-y-3 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
              <FileText className="h-10 w-10 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                {searchQuery || filter !== 'ALL'
                  ? 'No transfer records match your filter.'
                  : 'No transfers logged yet.'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const isSent = item.type === 'SENT';
              const mainFileName = item.files?.[0]?.name || 'Encrypted File';
              const extraCount = item.fileCount > 1 ? item.fileCount - 1 : 0;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-purple-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`p-3 rounded-2xl border ${
                        isSent
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                          : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      }`}
                    >
                      {isSent ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownLeft className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-white text-sm truncate max-w-xs">
                          {mainFileName}
                          {extraCount > 0 && (
                            <span className="text-purple-300 font-normal ml-1">
                              +{extraCount} more
                            </span>
                          )}
                        </p>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono tracking-wider ${
                            isSent
                              ? 'bg-purple-950/80 border border-purple-500/40 text-purple-300'
                              : 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300'
                          }`}
                        >
                          {item.type}
                        </span>

                        {item.pinProtected && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-amber-300 flex items-center gap-1">
                            <Lock className="h-2.5 w-2.5" />
                            PIN
                          </span>
                        )}

                        {item.autoDestruct && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-[10px] text-rose-300 flex items-center gap-1">
                            <Flame className="h-2.5 w-2.5" />
                            Auto-Destruct
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span>{formatBytes(item.totalSize)}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(item.timestamp)}</span>
                        <span>•</span>
                        <span className="text-purple-400">Code: {item.roomCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        onClose();
                        onReShare?.(item.roomCode);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/10"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Re-Share Session</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
