'use client';

import React from 'react';
import { ArrowLeftRight, Bell, LogOut } from 'lucide-react';

/**
 * @param {Object} props
 * @param {{ name: string, email: string }} props.user
 * @param {() => void} props.onLogout
 */
export const DashboardNavbar = ({ user, onLogout }) => {
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
          <button className="p-2 rounded-xl text-slate-400 hover:text-white glass-pill transition">
            <Bell className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-purple-400/40 shadow-md">
              {initials}
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 glass-pill transition"
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
