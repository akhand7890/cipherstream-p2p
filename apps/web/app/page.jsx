'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ConstellationBg } from '@/components/ConstellationBg';
import { ValuePillars } from '@/components/ValuePillars';
import { HowItWorksTimeline } from '@/components/HowItWorksTimeline';
import { TechSpecsCard } from '@/components/TechSpecsCard';
import { TelemetryWidget } from '@/components/TelemetryWidget';
import { SenderView } from '@/components/SenderView';
import { ReceiverView } from '@/components/ReceiverView';
import { TransferProgress } from '@/components/TransferProgress';
import { P2PTransferManager } from '@/lib/webrtc';
import { X } from 'lucide-react';

export default function Home() {
  const [mode, setMode] = useState(null); // null | 'sender' | 'receiver'
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
  const transferSectionRef = useRef(null);

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

  const openSender = () => {
    setMode('sender');
    setTimeout(() => {
      transferSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const openReceiver = () => {
    setMode('receiver');
    setTimeout(() => {
      transferSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Glowing Constellation Canvas */}
      <ConstellationBg />

      <div>
        {/* Top Navbar */}
        <Navbar onLogin={openSender} onSignUp={openSender} />

        {/* Main Homepage Container */}
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-16 relative z-10">
          {/* Hero Section */}
          <Hero onSendFiles={openSender} onJoinSession={openReceiver} />

          {/* Interactive Transfer Engine (Drawer/Modal when active) */}
          {mode && (
            <div ref={transferSectionRef} className="max-w-3xl mx-auto glass-panel p-8 rounded-3xl border border-purple-500/40 relative shadow-2xl animate-in zoom-in-95 duration-300">
              <button
                onClick={() => setMode(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/60 text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>

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
          )}

          {/* 4 Core Value Pillars */}
          <ValuePillars />

          {/* Bottom Grid: How It Works & Security Specs + Live Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-slate-800/80">
            {/* Left 2 Columns: How It Works Timeline */}
            <div className="lg:col-span-2 space-y-8">
              <HowItWorksTimeline />
            </div>

            {/* Right Column: Security Specs & Live Telemetry Dashboard */}
            <div className="space-y-6">
              <TechSpecsCard />
              <TelemetryWidget progress={progress} />
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 px-6 text-center text-xs text-slate-400 font-mono relative z-10 bg-[#060913]/90">
        DirectShare • CipherStream P2P • Zero-Cloud E2EE Architecture • JavaScript + JSDoc Annotated
      </footer>
    </div>
  );
}
