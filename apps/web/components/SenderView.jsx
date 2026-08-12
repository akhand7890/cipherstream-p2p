'use client';

import React, { useState } from 'react';
import { UploadCloud, QrCode, Zap, CheckCircle, Lock, Flame, Files, Sparkles } from 'lucide-react';
import { QRCodeModal } from './QRCodeModal';

/**
 * @param {Object} props
 * @param {(files: File[]) => void} props.onFilesSelect
 * @param {File[]} props.selectedFiles
 * @param {string} props.roomCode
 * @param {(pin?: string, autoDestruct?: boolean, customCode?: string) => void} props.onCreateSession
 * @param {boolean} [props.isVerified]
 */
export const SenderView = ({
  onFilesSelect,
  selectedFiles = [],
  roomCode,
  onCreateSession,
  isVerified = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [autoDestruct, setAutoDestruct] = useState(false);

  /**
   * @param {React.DragEvent} e
   */
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelect(Array.from(e.dataTransfer.files));
    }
  };

  /**
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(Array.from(e.target.files));
    }
  };

  const totalSizeMB = selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024);

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join?code=${roomCode || '849201'}`
    : `https://cipherstream.app/join?code=${roomCode || '849201'}`;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">
          Direct Peer-to-Peer Transfer
        </span>
        <h2 className="text-4xl font-extrabold text-white tracking-tight">Send Files</h2>
        <p className="text-sm text-slate-400">
          Select one or multiple files, generate a session code, and stream directly to the receiver.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`glass-panel rounded-3xl p-8 text-center border-2 border-dashed transition-all duration-300 relative group cursor-pointer ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-950/20 glow-violet'
            : selectedFiles.length > 0
            ? 'border-emerald-500/60 bg-emerald-950/10'
            : 'border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/40'
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        />

        <div className="space-y-4 pointer-events-none">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
            {selectedFiles.length > 0 ? (
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            ) : (
              <UploadCloud className="h-8 w-8" />
            )}
          </div>

          {selectedFiles.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Files className="h-5 w-5 text-emerald-400" />
                <p className="text-lg font-bold text-white">
                  {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'} Selected
                </p>
              </div>

              <p className="text-xs text-emerald-400 font-mono">
                {totalSizeMB.toFixed(2)} MB Total • Ready for Multi-File E2EE Stream
              </p>

              {/* Multi-File List Chips */}
              <div className="flex flex-wrap justify-center gap-2 pt-2 max-h-24 overflow-y-auto">
                {selectedFiles.map((file, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-[11px] font-mono text-slate-300 truncate max-w-[200px]"
                  >
                    {file.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-base font-semibold text-white">Drag & drop files to send</p>
              <p className="text-xs text-slate-400 mt-1">SELECT SINGLE OR MULTIPLE FILES</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced P2P Sending Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-indigo-400" />
            <span>Optional Room Security PIN</span>
          </label>
          <input
            type="text"
            maxLength={4}
            placeholder="e.g. 4829"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Custom Room Vanity Code (Verified Member Perk) */}
        {isVerified ? (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Verified Custom Room Alias</span>
            </label>
            <input
              type="text"
              maxLength={12}
              placeholder="e.g. CIPHER-99"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
              className="w-full px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>
        ) : (
          <div className="flex items-center pt-2 sm:pt-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
              <input
                type="checkbox"
                checked={autoDestruct}
                onChange={(e) => setAutoDestruct(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                <span>Auto-Destruct on Download</span>
              </span>
            </label>
          </div>
        )}
      </div>

      {isVerified && (
        <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={autoDestruct}
              onChange={(e) => setAutoDestruct(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-amber-400 fill-amber-400/20" />
              <span>Auto-Destruct Room on Download</span>
            </span>
          </label>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => {
            onCreateSession(pin, autoDestruct, customCode);
            setIsQrOpen(true);
          }}
          className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Zap className="h-5 w-5" />
          Create Transfer Session →
        </button>

        {roomCode && (
          <button
            onClick={() => setIsQrOpen(true)}
            className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center justify-center cursor-pointer"
            title="View QR Code & Code"
          >
            <QrCode className="h-6 w-6 text-indigo-400" />
          </button>
        )}
      </div>

      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        roomCode={roomCode}
        joinUrl={joinUrl}
      />
    </div>
  );
};
