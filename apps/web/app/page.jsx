'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { SenderView } from '@/components/SenderView';
import { ReceiverView } from '@/components/ReceiverView';
import { TransferProgress } from '@/components/TransferProgress';
import { P2PTransferManager } from '@/lib/webrtc';
import { Shield, Zap, CloudOff, BatteryCharging } from 'lucide-react';

export default function Home() {
  const [mode, setMode] = useState('sender');
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  /** @type {[File | null, React.Dispatch<React.SetStateAction<File | null>>]} */
  const [selectedFile, setSelectedFile] = useState(null);
  /** @type {[import('@cipherstream/types').TransferProgress | null, React.Dispatch<React.SetStateAction<import('@cipherstream/types').TransferProgress | null>>]} */
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [receivedFile, setReceivedFile] = useState(null);

  /** @type {React.MutableRefObject<P2PTransferManager | null>} */
  const managerRef = useRef(null);

  useEffect(() => {
    managerRef.current = new P2PTransferManager();
    managerRef.current.connectSignaling('ws://localhost:8080/ws', () => {
      setIsConnected(true);
    });

    managerRef.current.setOnProgress((prog) => setProgress(prog));
    managerRef.current.setOnFileReceived((blob, metadata) => {
      setReceivedFile({ blob, metadata });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = metadata.fileName;
      a.click();
      URL.revokeObjectURL(url);
    });
  }, []);

  const handleCreateSession = () => {
    if (!managerRef.current) return;
    managerRef.current.createRoom((code) => {
      setRoomCode(code);
      if (selectedFile) {
        managerRef.current?.sendFile(selectedFile, (prog) => setProgress(prog));
      }
    });
  };

  /**
   * @param {string} code
   */
  const handleJoinSession = (code) => {
    setIsLoading(true);
    managerRef.current?.joinRoom(code, () => {
      setIsLoading(false);
      setIsConnected(true);
    });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between">
      <div>
        <Header mode={mode} setMode={setMode} isConnected={isConnected} />

        <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider">
              PEER-TO-PEER FILE TRANSFER PLATFORM • JSDoc ZERO-BUILD TYPE SAFETY
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              If privacy and speed matter, <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                your files deserve a direct connection.
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-400">
              Share files directly between browsers with end-to-end WebCrypto encryption. Zero cloud storage, zero file size limits.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {mode === 'sender' ? (
              <SenderView
                onFileSelect={(file) => setSelectedFile(file)}
                selectedFile={selectedFile}
                roomCode={roomCode}
                onCreateSession={handleCreateSession}
              />
            ) : (
              <ReceiverView onJoinSession={handleJoinSession} isLoading={isLoading} />
            )}

            {progress && (
              <div className="mt-8">
                <TransferProgress
                  progress={progress}
                  fileName={selectedFile?.name || receivedFile?.metadata.fileName || 'Encrypted File Stream'}
                  fileSize={selectedFile?.size || receivedFile?.metadata.fileSize || 0}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-slate-800/80">
            <div className="glass-card p-6 rounded-2xl space-y-3">
              <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base">Direct WebRTC E2EE Data</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Browser-to-browser encrypted streaming using W3C WebCrypto ECDH and AES-256-GCM.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-3">
              <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <CloudOff className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base">Zero Cloud Storage</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No middleman servers, no cloud disk retention, and zero file size caps.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-3">
              <div className="p-3 w-fit rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base">Sub-50ms Latency</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Blazing fast local peer transfers leveraging high-throughput WebRTC DataChannels.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-3">
              <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BatteryCharging className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base">Energy & Battery SLA</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatic SHA-256 chunk verification and low battery energy-aware throttling.
              </p>
            </div>
          </div>
        </main>
      </div>

      <footer className="border-t border-slate-800/60 py-6 px-6 text-center text-xs text-slate-400 font-mono">
        CipherStream P2P • Zero-Cloud E2EE Architecture • JavaScript + JSDoc Annotated
      </footer>
    </div>
  );
}
