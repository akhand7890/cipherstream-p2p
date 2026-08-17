'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, QrCode, Zap, CheckCircle, Lock, Flame, Files, Sparkles, Pause, Play, Folder, FolderPlus, Users, Copy } from 'lucide-react';
import { QRCodeModal } from './QRCodeModal';
import { traverseDataTransferItems, normalizeDirectoryFiles } from '../lib/directoryTree';

/**
 * @param {Object} props
 * @param {(files: File[]) => void} props.onFilesSelect
 * @param {File[]} props.selectedFiles
 * @param {string} props.roomCode
 * @param {(pin?: string, autoDestruct?: boolean, customCode?: string) => void} props.onCreateSession
 * @param {boolean} [props.isVerified]
 * @param {boolean} [props.isPaused]
 * @param {() => void} [props.onPause]
 * @param {() => void} [props.onResume]
 * @param {boolean} [props.isTransferring]
 * @param {number} [props.peerCount]
 */
export const SenderView = ({
  onFilesSelect,
  selectedFiles = [],
  roomCode,
  onCreateSession,
  isVerified = false,
  isPaused = false,
  onPause,
  onResume,
  isTransferring = false,
  peerCount = 1,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [localPaused, setLocalPaused] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [pin, setPin] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [autoDestruct, setAutoDestruct] = useState(false);

  const folderInputRef = useRef(null);

  const activePaused = isPaused || localPaused;
  const isFolderTransfer = selectedFiles.some((f) => f.relativePath || f.webkitRelativePath);

  /**
   * @param {React.DragEvent} e
   */
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const folderFiles = await traverseDataTransferItems(e.dataTransfer.items);
      if (folderFiles.length > 0) {
        onFilesSelect(normalizeDirectoryFiles(folderFiles));
        return;
      }
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelect(normalizeDirectoryFiles(Array.from(e.dataTransfer.files)));
    }
  };

  /**
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(normalizeDirectoryFiles(Array.from(e.target.files)));
    }
  };

  const totalSizeMB = selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024);

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/join?code=${roomCode || '849201'}`
      : `https://cipherstream.app/join?code=${roomCode || '849201'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">
          Direct Peer-to-Peer Mesh Transfer
        </span>
        <h2 className="text-4xl font-extrabold text-white tracking-tight">Send Files & Folders</h2>
        <p className="text-sm text-slate-400">
          Select files or a folder directory, generate a session code, and broadcast to multiple receivers simultaneously.
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
              isFolderTransfer ? (
                <Folder className="h-8 w-8 text-purple-400 fill-purple-400/20" />
              ) : (
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              )
            ) : (
              <UploadCloud className="h-8 w-8" />
            )}
          </div>

          {selectedFiles.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                {isFolderTransfer ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase font-mono flex items-center gap-1">
                    <Folder className="h-3 w-3 text-purple-400" /> FOLDER HIERARCHY
                  </span>
                ) : (
                  <Files className="h-5 w-5 text-emerald-400" />
                )}
                <p className="font-bold text-white text-base">
                  {selectedFiles.length} {selectedFiles.length === 1 ? 'File Selected' : 'Files in Directory'}
                </p>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Total Payload Size: <span className="text-emerald-400 font-bold">{totalSizeMB.toFixed(2)} MB</span>
              </p>

              {/* Selected File & Folder Chips */}
              <div className="max-h-32 overflow-y-auto space-y-1.5 pt-2 pr-1 text-left">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="glass-card px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs flex items-center justify-between text-slate-300">
                    <span className="truncate max-w-xs font-mono text-slate-300">
                      {file.relativePath || file.webkitRelativePath || file.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-bold text-white text-base">Drop files or folder here, or click to browse</p>
              <p className="text-xs text-slate-400">Supports single files, multi-file selections, and full folder trees</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Folder Upload Input */}
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => folderInputRef.current?.click()}
          className="px-4 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
        >
          <FolderPlus className="h-4 w-4 text-purple-400" />
          <span>Upload Entire Folder Directory</span>
        </button>
      </div>

      {/* Verified Custom Room Alias Input */}
      {isVerified ? (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-purple-300 font-bold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-400" /> Verified Custom Room Vanity Alias
            </span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase font-mono">UNLOCKED</span>
          </div>
          <input
            type="text"
            placeholder="Custom Vanity Code (e.g. CIPHER-99)"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-500/40 text-purple-300 font-mono text-sm uppercase placeholder-slate-600 focus:outline-none focus:border-purple-400 transition"
          />
        </div>
      ) : null}

      {/* 4-Digit Security PIN Option */}
      <div className="px-4 py-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Lock className="h-4 w-4 text-indigo-400" />
          <span>4-Digit Security PIN (Optional)</span>
        </div>
        <input
          type="password"
          maxLength={4}
          placeholder="e.g. 4829"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-24 px-3 py-1.5 text-center bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-indigo-500 focus:outline-none transition"
        />
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

      {/* Active Transfer Stream Controls & Multi-Peer Grid */}
      {roomCode && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/40 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold block">ACTIVE ROOM CODE</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Users className="h-3 w-3 text-emerald-400" />
                  {peerCount > 1 ? `${peerCount} RECEIVERS MESH` : '1 RECEIVER CONNECTED'}
                </span>
              </div>
              <span className="text-xl font-extrabold font-mono text-white tracking-widest">{roomCode}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 transition flex items-center gap-1.5 cursor-pointer text-xs font-bold font-mono"
                title="Copy Shareable Join Link"
              >
                {isCopied ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-purple-400" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              {activePaused ? (
                <button
                  type="button"
                  onClick={() => {
                    setLocalPaused(false);
                    onResume?.();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-600/20 animate-pulse"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Resume Stream</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setLocalPaused(true);
                    onPause?.();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Pause className="h-4 w-4 fill-current" />
                  <span>Pause Stream</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsQrOpen(true)}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition flex items-center justify-center cursor-pointer"
                title="View QR Code"
              >
                <QrCode className="h-5 w-5 text-indigo-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => {
            onCreateSession(pin, autoDestruct, customCode);
            setIsQrOpen(true);
          }}
          className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Zap className="h-5 w-5" />
          Create Transfer Session →
        </button>
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
