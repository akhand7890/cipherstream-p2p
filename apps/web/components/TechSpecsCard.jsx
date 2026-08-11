'use client';

import React from 'react';

export const TechSpecsCard = () => {
  const specs = [
    'Monorepo Architecture',
    'Encryption Primitives',
    'Streaming Engine',
    'Zero Knowledge',
  ];

  return (
    <div id="security" className="glass-card p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 to-slate-950/40 space-y-6 shadow-xl flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-white text-lg tracking-tight">Enterprise Security</h3>
        <p className="text-xs text-purple-300 font-semibold mt-0.5">& Tech Specs</p>
      </div>

      <div className="space-y-3">
        {specs.map((spec, idx) => (
          <div
            key={idx}
            className="glass-pill px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 border border-slate-700/60 flex items-center justify-between hover:border-purple-500/40 transition"
          >
            <span>{spec}</span>
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
          </div>
        ))}
      </div>

      {/* 3D Server Stack Visual Illustration */}
      <div className="relative h-28 w-full rounded-xl bg-slate-900/60 border border-purple-500/20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 to-cyan-500/10" />
        
        <div className="space-y-1.5 z-10 transform -rotate-6 scale-95">
          <div className="w-36 h-5 rounded-md bg-purple-600/40 border border-purple-400/50 shadow-lg flex items-center justify-between px-2">
            <div className="flex gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-300" />
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
            </div>
            <span className="text-[9px] font-mono text-purple-200">E2EE LAYER</span>
          </div>
          <div className="w-36 h-5 rounded-md bg-indigo-600/40 border border-indigo-400/50 shadow-lg flex items-center justify-between px-2">
            <div className="flex gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
            </div>
            <span className="text-[9px] font-mono text-indigo-200">WEBRTC P2P</span>
          </div>
          <div className="w-36 h-5 rounded-md bg-cyan-600/40 border border-cyan-400/50 shadow-lg flex items-center justify-between px-2">
            <div className="flex gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            </div>
            <span className="text-[9px] font-mono text-cyan-200">ZERO STORAGE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
