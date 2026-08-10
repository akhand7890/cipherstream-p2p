'use client';

import React, { useState } from 'react';
import { UploadCloud, QrCode, Zap, CheckCircle } from 'lucide-react';
import { QRCodeModal } from './QRCodeModal';

/**
 * @param {Object} props
 * @param {(file: File) => void} props.onFileSelect
 * @param {File | null} props.selectedFile
 * @param {string} props.roomCode
 * @param {() => void} props.onCreateSession
 */
export const SenderView = ({
  onFileSelect,
  selectedFile,
  roomCode,
  onCreateSession,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  /**
   * @param {React.DragEvent} e
   */
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  /**
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

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
          Select files, generate a 6-digit session code, and stream directly to the receiver.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`glass-panel rounded-3xl p-10 text-center border-2 border-dashed transition-all duration-300 relative group cursor-pointer ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-950/20 glow-violet'
            : selectedFile
            ? 'border-emerald-500/60 bg-emerald-950/10'
            : 'border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/40'
        }`}
      >
        <input
          type="file"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        />

        <div className="space-y-4 pointer-events-none">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
            {selectedFile ? (
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            ) : (
              <UploadCloud className="h-8 w-8" />
            )}
          </div>

          {selectedFile ? (
            <div>
              <p className="text-lg font-bold text-white truncate max-w-md mx-auto">{selectedFile.name}</p>
              <p className="text-xs text-emerald-400 font-mono mt-1">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for E2EE Stream
              </p>
            </div>
          ) : (
            <div>
              <p className="text-base font-semibold text-white">Drag & drop files to send</p>
              <p className="text-xs text-slate-400 mt-1">OR CLICK TO BROWSE LOCAL FILES</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onCreateSession}
          className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
        >
          <Zap className="h-5 w-5" />
          Create Transfer Session →
        </button>

        {roomCode && (
          <button
            onClick={() => setIsQrOpen(true)}
            className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center justify-center"
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
