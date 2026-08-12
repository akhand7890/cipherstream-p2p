'use client';

import React from 'react';
import { FileText, Download, MoreHorizontal, ShieldCheck, Sparkles, AlertCircle, ArrowRight, Trash2 } from 'lucide-react';

/**
 * @param {Object} props
 * @param {{ name: string, email: string, emailVerified?: boolean }} props.user
 * @param {() => void} [props.onOpenVerifyModal]
 */
export const UserDashboard = ({ user, onOpenVerifyModal }) => {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'JS';

  const recentSessions = [
    { name: 'ubuntu_24-desktop.iso', time: '1 hours ago', date: 'Dec 1, 2023' },
    { name: 'End filecantage.txt', time: '1 hours ago', date: 'Dec 1, 2023' },
    { name: 'ubuntu_24-desktop.iso', time: '1 hours ago', date: 'Dec 1, 2023' },
  ];

  const sharedLinks = [
    'https://cipherstream.app/join?code=849201',
    'https://cipherstream.app/join?code=392014',
    'https://cipherstream.app/join?code=910482',
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Recent Transfer Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
                  SESSION LOG
                </span>
                <h3 className="font-extrabold text-white text-xl">Recent Transfer Sessions</h3>
              </div>
              <button className="text-slate-400 hover:text-white transition cursor-pointer">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/80">
              {recentSessions.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between hover:bg-slate-900/30 px-3 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-mono text-slate-400">{item.date}</span>
                    <button className="text-slate-400 hover:text-white transition cursor-pointer">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Files Links Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-lg">Shared Files Links</h3>
              <button className="text-slate-400 hover:text-white transition cursor-pointer">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {sharedLinks.map((url, idx) => (
                <div key={idx} className="glass-card p-3.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-300 truncate max-w-md">{url}</span>
                  <button className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer">
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Account Overview & Trust Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-lg">Account Overview</h3>
              <button className="text-slate-400 hover:text-white transition cursor-pointer">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            {/* User Info Avatar */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center border border-purple-400/40 shadow-xl shadow-purple-500/20">
                {initials}
              </div>
              <div>
                <h4 className="font-bold text-white text-base">{user.name}</h4>
                <p className="text-xs text-slate-400">{user.email}</p>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-[10px] font-semibold text-purple-300">
                  <ShieldCheck className="h-3 w-3 text-purple-400" />
                  <span>Non-Storage Limited</span>
                </div>
              </div>
            </div>

            {/* Account Trust Flow Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase">Trust Tier Status</span>
                {user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    Verified Member
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                    <AlertCircle className="h-3 w-3 text-amber-400" />
                    Guest Peer
                  </span>
                )}
              </div>

              {user.emailVerified ? (
                <div className="space-y-1.5 text-xs text-slate-300 font-medium pt-1">
                  <p className="flex items-center gap-1.5 text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Custom Room Vanity Codes Unlocked</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <span>✓ Unlimited Session Duration & Priority Peers</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Verify your email address to unlock custom room vanity codes and verified peer status.
                  </p>
                  <button
                    onClick={onOpenVerifyModal}
                    className="w-full py-2 px-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Verify Email Address
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Unlimited Capacity Meters */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">UNLIMITED P2P TRANSFER CAPACITY</span>
                  <span className="text-purple-400 font-bold">UNLIMITED</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 w-full" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">DIRECT E2EE PIPELINE SPEED</span>
                  <span className="text-cyan-400 font-bold">PEAK INTERNET</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 w-full" />
                </div>
              </div>

              {/* Developer Database Control */}
              <div className="pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to wipe all registered user accounts and sessions?')) {
                      localStorage.clear();
                      sessionStorage.clear();
                      location.reload();
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Reset Local User Database</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
