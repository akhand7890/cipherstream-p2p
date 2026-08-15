'use client';

import React from 'react';
import { ArrowLeftRight, ShieldCheck, Lock, Flame, Sparkles, RefreshCw, Radio, PlusCircle } from 'lucide-react';

/**
 * @param {Object} props
 * @param {{ name: string, email: string, emailVerified?: boolean }} props.user
 * @param {string} props.roomCode
 * @param {() => void} props.onOpenSender
 * @param {() => void} props.onOpenReceiver
 */
export const MySessionsView = ({ user, roomCode, onOpenSender, onOpenReceiver }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
              ACTIVE SESSIONS
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Gateway Connected
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">My Transfer Sessions</h2>
          <p className="text-xs text-slate-400">Manage direct E2EE P2P transfer rooms and live signaling channels.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSender}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center gap-2 cursor-pointer transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Room</span>
          </button>

          <button
            onClick={onOpenReceiver}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition"
          >
            <Radio className="h-4 w-4 text-cyan-400" />
            <span>Join Existing Code</span>
          </button>
        </div>
      </div>

      {/* Live Active Room Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/40 space-y-4 bg-gradient-to-b from-purple-950/30 to-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-purple-300 font-bold uppercase">CURRENT ACTIVE ROOM</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[10px] font-mono text-purple-300">
              E2EE P2P
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400">Active Room Alias / Code:</span>
            <div className="text-3xl font-extrabold font-mono text-white tracking-wider mt-1 flex items-center gap-2">
              <span className="text-cyan-400">{roomCode || 'NO ACTIVE ROOM'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <span className="text-slate-400 text-[10px] block">SECURITY LAYER</span>
              <span className="font-bold text-slate-200">AES-256-GCM</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <span className="text-slate-400 text-[10px] block">KEY EXCHANGE</span>
              <span className="font-bold text-slate-200">ECDH P-256</span>
            </div>
          </div>
        </div>

        {/* Account Perks & Vanity Room Status */}
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-indigo-300 font-bold uppercase">ACCOUNT PERKS & VANITY ALIAS</span>
            {user.emailVerified ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Verified Member
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                Unverified
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <p className="flex items-center gap-2 text-purple-300 font-semibold">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Custom Vanity Codes: {user.emailVerified ? 'UNLOCKED (e.g. CIPHER-99)' : 'LOCKED (Requires Email Verification)'}</span>
            </p>
            <p className="flex items-center gap-2 text-slate-400">
              <span>✓ Direct WebRTC DataChannel Streaming with zero file size limits.</span>
            </p>
            <p className="flex items-center gap-2 text-slate-400">
              <span>✓ Client-side zero-knowledge encrypted vault history tracking.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
