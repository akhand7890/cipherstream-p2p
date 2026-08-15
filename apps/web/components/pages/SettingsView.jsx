'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, KeyRound, Sparkles, Trash2, Check, Lock, Database } from 'lucide-react';

/**
 * @param {Object} props
 * @param {{ name: string, email: string, emailVerified?: boolean }} props.user
 * @param {() => void} [props.onOpenVerifyModal]
 * @param {() => void} [props.onClearHistory]
 */
export const SettingsView = ({ user, onOpenVerifyModal, onClearHistory }) => {
  const [vanityAlias, setVanityAlias] = useState('CIPHER-99');
  const [savedNotice, setSavedNotice] = useState('');

  const handleSaveVanity = (e) => {
    e.preventDefault();
    setSavedNotice('Custom vanity alias saved successfully!');
    setTimeout(() => setSavedNotice(''), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
              SETTINGS & CONFIGURATION
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-[10px] font-mono text-indigo-300">
              Account Controls
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">Application Settings</h2>
          <p className="text-xs text-slate-400">Configure your account trust tier, custom room vanity codes, and database vault settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Profile Card */}
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-lg">Account Profile</h3>
            {user.emailVerified ? (
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Verified Member
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-400" /> Unverified Email
              </span>
            )}
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <span className="text-xs text-slate-400 block font-mono">FULL NAME</span>
              <p className="font-bold text-white text-base">{user.name}</p>
            </div>

            <div>
              <span className="text-xs text-slate-400 block font-mono">EMAIL ADDRESS</span>
              <p className="font-bold text-white text-base">{user.email}</p>
            </div>

            {!user.emailVerified && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                <p className="text-xs text-amber-300 leading-relaxed font-medium">
                  Verify your email to unlock custom vanity room aliases (e.g. CIPHER-99) and unlimited session durations.
                </p>
                <button
                  onClick={onOpenVerifyModal}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  Verify Email Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Custom Room Vanity Code Settings */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-lg">Custom Room Vanity Code</h3>
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>

          <form onSubmit={handleSaveVanity} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block font-mono mb-1.5">PREFERRED ROOM ALIAS</label>
              <input
                type="text"
                value={vanityAlias}
                onChange={(e) => setVanityAlias(e.target.value.toUpperCase())}
                disabled={!user.emailVerified}
                placeholder="e.g. CIPHER-99"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-purple-300 font-mono font-bold text-sm focus:outline-none focus:border-purple-500 transition disabled:opacity-50"
              />
            </div>

            {savedNotice && (
              <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <Check className="h-4 w-4" /> {savedNotice}
              </p>
            )}

            <button
              type="submit"
              disabled={!user.emailVerified}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs transition cursor-pointer"
            >
              Save Preferred Vanity Alias
            </button>
          </form>
        </div>
      </div>

      {/* Cryptography & Database Control Section */}
      <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-white text-lg">Database & Vault Management</h3>
          <Database className="h-5 w-5 text-rose-400" />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div>
            <h4 className="font-bold text-white text-sm">Wipe Local Database & Sessions</h4>
            <p className="text-xs text-slate-400">Clears all stored accounts, active sessions, and local history from browser memory.</p>
          </div>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to wipe all registered user accounts and sessions?')) {
                localStorage.clear();
                sessionStorage.clear();
                location.reload();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 font-bold text-xs transition shrink-0 cursor-pointer flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Reset Local Database</span>
          </button>
        </div>
      </div>
    </div>
  );
};
