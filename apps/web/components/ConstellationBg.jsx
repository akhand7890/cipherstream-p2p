'use client';

import React from 'react';

export const ConstellationBg = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Left Constellation Mesh (Purple / Violet) */}
      <svg
        className="absolute top-10 -left-10 w-[550px] h-[550px] opacity-60"
        viewBox="0 0 500 500"
        fill="none"
      >
        <defs>
          <radialGradient id="purpleGlow" cx="30%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="180" cy="220" r="180" fill="url(#purpleGlow)" />

        {/* Lines */}
        <line x1="50" y1="120" x2="140" y2="80" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="140" y1="80" x2="220" y2="160" stroke="#c084fc" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="220" y1="160" x2="150" y2="260" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="150" y1="260" x2="70" y2="240" stroke="#c084fc" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="70" y1="240" x2="50" y2="120" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="220" y1="160" x2="310" y2="120" stroke="#e879f9" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="310" y1="120" x2="360" y2="220" stroke="#c084fc" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="150" y1="260" x2="260" y2="330" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.6" />

        {/* Nodes */}
        <circle cx="50" cy="120" r="5" fill="#e879f9" className="animate-pulse" />
        <circle cx="140" cy="80" r="7" fill="#c084fc" />
        <circle cx="220" cy="160" r="9" fill="#a855f7" />
        <circle cx="150" cy="260" r="6" fill="#e879f9" />
        <circle cx="70" cy="240" r="5" fill="#c084fc" />
        <circle cx="310" cy="120" r="8" fill="#a855f7" />
        <circle cx="360" cy="220" r="6" fill="#e879f9" />
        <circle cx="260" cy="330" r="7" fill="#c084fc" />
      </svg>

      {/* Right Constellation Mesh (Cyan / Blue) */}
      <svg
        className="absolute top-10 -right-10 w-[550px] h-[550px] opacity-60"
        viewBox="0 0 500 500"
        fill="none"
      >
        <defs>
          <radialGradient id="cyanGlow" cx="70%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="320" cy="220" r="180" fill="url(#cyanGlow)" />

        {/* Lines */}
        <line x1="450" y1="120" x2="360" y2="80" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="360" y1="80" x2="280" y2="160" stroke="#0ea5e9" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="280" y1="160" x2="350" y2="260" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="350" y1="260" x2="430" y2="240" stroke="#0ea5e9" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="430" y1="240" x2="450" y2="120" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="280" y1="160" x2="190" y2="120" stroke="#7dd3fc" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="190" y1="120" x2="140" y2="220" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="350" y1="260" x2="240" y2="330" stroke="#0ea5e9" strokeWidth="1.5" strokeOpacity="0.6" />

        {/* Nodes */}
        <circle cx="450" cy="120" r="5" fill="#7dd3fc" className="animate-pulse" />
        <circle cx="360" cy="80" r="7" fill="#38bdf8" />
        <circle cx="280" cy="160" r="9" fill="#0ea5e9" />
        <circle cx="350" cy="260" r="6" fill="#7dd3fc" />
        <circle cx="430" cy="240" r="5" fill="#38bdf8" />
        <circle cx="190" cy="120" r="8" fill="#0ea5e9" />
        <circle cx="140" cy="220" r="6" fill="#7dd3fc" />
        <circle cx="240" cy="330" r="7" fill="#38bdf8" />
      </svg>
    </div>
  );
};
