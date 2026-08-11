'use client';

import React from 'react';
import { Upload, QrCode, Share2 } from 'lucide-react';

export const HowItWorksTimeline = () => {
  const steps = [
    {
      step: 'Step 1',
      title: 'Drop File',
      desc: 'Drop your file to process e2ee and stream directly to your file-step recipient.',
      icon: Upload,
      glow: 'from-purple-500/20 to-purple-800/10',
      borderColor: 'border-purple-500/40',
      iconBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      step: 'Step 2',
      title: 'Instant Code & QR',
      desc: 'Emits web instance with browsers exchange and Instant Code & QR.',
      icon: QrCode,
      glow: 'from-indigo-500/20 to-indigo-800/10',
      borderColor: 'border-indigo-500/40',
      iconBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      step: 'Step 3',
      title: 'Direct P2P Stream',
      desc: 'Provide a direct data and connected network at Direct P2P Stream.',
      icon: Share2,
      glow: 'from-cyan-500/20 to-cyan-800/10',
      borderColor: 'border-cyan-500/40',
      iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
  ];

  return (
    <div id="how-it-works" className="space-y-6">
      <div className="flex items-center gap-2 text-white text-lg font-bold">
        <span className="text-xl">🎯</span>
        <span>How It Works</span>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Animated Connecting Energy Beam Line */}
        <div className="hidden md:block absolute top-1/2 left-10 right-10 h-1 energy-beam -translate-y-1/2 z-0 rounded-full opacity-60" />

        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`relative z-10 glass-card p-6 rounded-2xl border ${item.borderColor} bg-gradient-to-b ${item.glow} space-y-4 shadow-xl flex flex-col justify-between`}
            >
              <div className="space-y-4">
                <div className={`p-3.5 w-fit rounded-2xl border ${item.iconBg} shadow-inner`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-semibold text-slate-400 block">{item.step}:</span>
                  <h3 className="font-bold text-white text-lg mt-0.5">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2">{item.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
