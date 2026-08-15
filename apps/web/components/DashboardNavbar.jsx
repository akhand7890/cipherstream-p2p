'use client';

import React from 'react';
import { ArrowLeftRight, Bell, LogOut, ShieldCheck, AlertCircle, History, FolderGit2, Settings, Radio } from 'lucide-react';

/**
 * @param {Object} props
 * @param {{ name: string, email: string, emailVerified?: boolean }} props.user
 * @param {'sessions' | 'history' | 'shared' | 'settings'} [props.activeTab]
 * @param {(tab: 'sessions' | 'history' | 'shared' | 'settings') => void} props.onSelectTab
 * @param {() => void} props.onLogout
 * @param {() => void} [props.onOpenVerifyModal]
 */
export const DashboardNavbar = ({
  user,
  activeTab = 'sessions',
  onSelectTab,
  onLogout,
  onOpenVerifyModal,
}) => {
  const initials =
    user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'CS';

  const navItems = [
    { id: 'sessions', label: 'My Sessions', icon: Radio },
    { id: 'history', label: 'History', icon: History },
    { id: 'shared', label: 'Shared Files', icon: FolderGit2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="w-full border-b border-slate-800/60 bg-[#070b19]/80 backdrop-blur-2xl sticky top-0 z-50 px-6 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab?.('sessions')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition">
            <ArrowLeftRight className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Cipher<span className="text-purple-400">Stream</span>
          </span>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-2 p-1 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab?.(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Controls */}
        <div className="flex items-center gap-4">
          {/* Account Trust Status Badge */}
          {user.emailVerified ? (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300 shadow-sm shadow-emerald-500/10">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Verified Member</span>
            </div>
          ) : (
            <button
              onClick={onOpenVerifyModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-xs font-semibold text-amber-300 transition cursor-pointer"
            >
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              <span>Verify Email (Unverified)</span>
            </button>
          )}

          <button
            onClick={() => onSelectTab?.('history')}
            className={`p-2 rounded-xl text-slate-400 hover:text-purple-300 glass-pill transition cursor-pointer ${
              activeTab === 'history' ? 'ring-2 ring-purple-500/50 text-purple-300' : ''
            }`}
            title="View Transfer History Logs"
          >
            <History className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            <div
              onClick={() => onSelectTab?.('settings')}
              className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-purple-400/40 shadow-md cursor-pointer hover:scale-105 transition"
              title="Open Settings"
            >
              {initials}
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 glass-pill transition cursor-pointer"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
