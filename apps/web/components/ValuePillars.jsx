'use client';

import React from 'react';
import { Lock, CloudOff, Zap, BatteryCharging } from 'lucide-react';

export const ValuePillars = () => {
  const pillars = [
    {
      icon: Lock,
      title: 'Direct WebRTC E2EE',
      subtitle: 'End-to-End Encrypted',
      color: 'from-purple-500/20 to-purple-700/10',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
    {
      icon: CloudOff,
      title: 'Zero Cloud Storage',
      subtitle: '100% Private & Serverless',
      color: 'from-indigo-500/20 to-indigo-700/10',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400',
    },
    {
      icon: Zap,
      title: 'Sub-50ms Latency',
      subtitle: 'Maximum P2P Speed',
      color: 'from-cyan-500/20 to-cyan-700/10',
      borderColor: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
    },
    {
      icon: BatteryCharging,
      title: 'Smart Battery SLA',
      subtitle: 'Resilient & Energy-Aware',
      color: 'from-slate-500/20 to-purple-700/10',
      borderColor: 'border-slate-500/30',
      iconColor: 'text-slate-300',
    },
  ];

  return (
    <div id="features" className="relative z-10 max-w-6xl mx-auto space-y-6 pt-10">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center justify-center gap-2">
          <Zap className="h-5 w-5 text-amber-400 fill-amber-400" />
          Core Value Pillars
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className={`glass-card p-6 rounded-2xl border ${pillar.borderColor} bg-gradient-to-b ${pillar.color} space-y-4 shadow-xl`}
            >
              <div className={`p-3 w-fit rounded-xl bg-slate-900/80 border border-slate-700/60 ${pillar.iconColor}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base tracking-tight">{pillar.title}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">{pillar.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
