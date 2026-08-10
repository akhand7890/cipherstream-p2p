'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode, ShieldCheck } from 'lucide-react';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {string} props.roomCode
 * @param {string} props.joinUrl
 */
export const QRCodeModal = ({ isOpen, onClose, roomCode, joinUrl }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700/60 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1">
            <QrCode className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Join P2P Transfer Session</h3>
          <p className="text-xs text-slate-400">Scan QR Code or copy pairing code to connect</p>
        </div>

        <div className="bg-white p-4 rounded-xl flex items-center justify-center shadow-inner mx-auto w-fit mb-6">
          <QRCodeSVG value={joinUrl} size={180} level="H" includeMargin={false} />
        </div>

        <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 mb-6 text-center">
          <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1 font-mono">6-DIGIT SESSION CODE</span>
          <span className="text-3xl font-extrabold tracking-widest text-indigo-400 font-mono">
            {roomCode || '849201'}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-300" />
              Direct Link Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Instant Share Link
            </>
          )}
        </button>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          End-to-End Encrypted Session (ECDH + AES-256-GCM)
        </div>
      </div>
    </div>
  );
};
