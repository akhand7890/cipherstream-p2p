'use client';

import React from 'react';
import { ArrowLeftRight } from 'lucide-react';

/**
 * @param {Object} props
 * @param {() => void} [props.onLogin]
 * @param {() => void} [props.onSignUp]
 */
export const Navbar = ({ onLogin, onSignUp }) => {
  return (
    <nav className="w-full border-b border-slate-800/60 bg-[#070b19]/70 backdrop-blur-2xl sticky top-0 z-50 px-8 py-4">
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
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
          <a href="#security" className="hover:text-white transition">Enterprise Security</a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white glass-pill transition cursor-pointer"
          >
            Log In
          </button>
          <button
            onClick={onSignUp}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
};
