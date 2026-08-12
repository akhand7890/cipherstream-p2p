'use client';

import React from 'react';
import { ArrowLeftRight, Bell, LogOut, ShieldCheck, AlertCircle } from 'lucide-react';

/**
 * @param {Object} props
 * @param {{ name: string, email: string, emailVerified?: boolean }} props.user
 * @param {() => void} props.onLogout
 * @param {() => void} [props.onOpenVerifyModal]
 */
export const DashboardNavbar = ({ user, onLogout, onOpenVerifyModal }) => {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'JS';

  return (
    <nav className="w-full border-b border-slate-800/60 bg-[#070b19]/80 backdrop-blur-2xl sticky top-0 z-50 px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <ArrowLeftRight className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Cipher<span className="text-purple-400">Stream</span>
          </span>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#sessions" className="hover:text-white transition text-purple-400">My Sessions</a>
          <a href="#history" className="hover:text-white transition">History</a>
          <a href="#shared-files" className="hover:text-white transition">Shared Files</a>
          <a href="#settings" className="hover:text-white transition">Settings</a>
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

          <button className="p-2 rounded-xl text-slate-400 hover:text-white glass-pill transition cursor-pointer">
            <Bell className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-purple-400/40 shadow-md">
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
