'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { DashboardNavbar } from '@/components/DashboardNavbar';
import { Hero } from '@/components/Hero';
import { ConstellationBg } from '@/components/ConstellationBg';
import { ValuePillars } from '@/components/ValuePillars';
import { HowItWorksTimeline } from '@/components/HowItWorksTimeline';
import { TechSpecsCard } from '@/components/TechSpecsCard';
import { TelemetryWidget } from '@/components/TelemetryWidget';
import { AuthModal } from '@/components/AuthModal';
import { ErrorModal } from '@/components/ErrorModal';
import { VerifyEmailModal } from '@/components/VerifyEmailModal';
import { ForgotPasswordModal } from '@/components/ForgotPasswordModal';
import { TransferHistoryModal } from '@/components/TransferHistoryModal';
import { UserDashboard } from '@/components/UserDashboard';
import { MySessionsView } from '@/components/pages/MySessionsView';
import { HistoryView } from '@/components/pages/HistoryView';
import { SharedFilesView } from '@/components/pages/SharedFilesView';
import { SettingsView } from '@/components/pages/SettingsView';
import { SenderView } from '@/components/SenderView';
import { ReceiverView } from '@/components/ReceiverView';
import { TransferProgress } from '@/components/TransferProgress';
import { P2PTransferManager } from '@/lib/webrtc';
import { getStoredSession, saveSession, clearStoredSession, markEmailVerified } from '@/lib/authDb';
import { recordTransfer, getTransferHistory, clearTransferHistory } from '@/lib/transferVault';
import { X } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null); // null | { name: string, email: string, emailVerified?: boolean }
  const [authModalState, setAuthModalState] = useState({ isOpen: false, tab: 'login' });
  const [errorMessage, setErrorMessage] = useState(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState('sessions'); // 'sessions' | 'history' | 'shared' | 'settings'
  const [transferHistory, setTransferHistory] = useState([]);

  const [mode, setMode] = useState(null); // null | 'sender' | 'receiver'
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  /** @type {[File[], React.Dispatch<React.SetStateAction<File[]>>]} */
  const [selectedFiles, setSelectedFiles] = useState([]);
  /** @type {[import('@cipherstream/types').TransferProgress | null, React.Dispatch<React.SetStateAction<import('@cipherstream/types').TransferProgress | null>>]} */
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [receivedFile, setReceivedFile] = useState(null);

  /** @type {React.MutableRefObject<P2PTransferManager | null>} */
  const managerRef = useRef(null);
  const transferSectionRef = useRef(null);

  const loadVaultHistory = async (email) => {
    if (!email) return;
    const history = await getTransferHistory(email);
    setTransferHistory(history);
  };

  useEffect(() => {
    // Restore persistent session on startup
    const activeSession = getStoredSession();
    if (activeSession) {
      setUser(activeSession);
      loadVaultHistory(activeSession.email);
    }

    managerRef.current = new P2PTransferManager();
    managerRef.current.connectSignaling('ws://localhost:8080/ws', () => {
      setIsConnected(true);
    });

    managerRef.current.setOnProgress((prog) => setProgress(prog));
    managerRef.current.setOnError((msg) => {
      setIsLoading(false);
      setErrorMessage(msg);
    });
    managerRef.current.setOnFileReceived(async (blob, metadata) => {
      setReceivedFile({ blob, metadata });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = metadata.fileName;
      a.click();
      URL.revokeObjectURL(url);

      const currentSessionUser = getStoredSession();
      if (currentSessionUser?.email) {
        await recordTransfer({
          email: currentSessionUser.email,
          roomCode: roomCode || 'DIRECT_P2P',
          files: [{ name: metadata.fileName, size: metadata.fileSize }],
          type: 'RECEIVED',
          pinProtected: false,
          autoDestruct: false,
        });
        loadVaultHistory(currentSessionUser.email);
      }
    });
  }, []);

  useEffect(() => {
    if (user?.email) {
      loadVaultHistory(user.email);
    } else {
      setTransferHistory([]);
    }
  }, [user?.email]);

  const handleCreateSession = (pin = '', autoDestruct = false, customCode = '') => {
    if (!user) {
      setAuthModalState({ isOpen: true, tab: 'signup' });
      return;
    }
    if (!managerRef.current) return;
    managerRef.current.createRoom(
      async (code) => {
        setRoomCode(code);
        if (selectedFiles.length > 0) {
          managerRef.current?.sendFiles(selectedFiles, (prog) => setProgress(prog));

          if (user?.email) {
            await recordTransfer({
              email: user.email,
              roomCode: code,
              files: selectedFiles,
              type: 'SENT',
              pinProtected: !!pin,
              autoDestruct,
            });
            loadVaultHistory(user.email);
          }
        }
      },
      pin,
      autoDestruct,
      customCode
    );
  };

  const handleReShare = (code) => {
    setRoomCode(code);
    setMode('sender');
    setTimeout(() => {
      transferSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleClearVaultHistory = () => {
    if (user?.email) {
      clearTransferHistory(user.email);
      setTransferHistory([]);
    }
  };

  /**
   * @param {string} code
   * @param {string} [pin]
   */
  const handleJoinSession = (code, pin = '') => {
    if (!user) {
      setAuthModalState({ isOpen: true, tab: 'login' });
      return;
    }
    setIsLoading(true);
    managerRef.current?.joinRoom(
      code,
      () => {
        setIsLoading(false);
        setIsConnected(true);
      },
      pin
    );
  };

  const openSender = () => {
    if (!user) {
      setAuthModalState({ isOpen: true, tab: 'signup' });
      return;
    }
    setMode('sender');
    setTimeout(() => {
      transferSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const openReceiver = () => {
    if (!user) {
      setAuthModalState({ isOpen: true, tab: 'login' });
      return;
    }
    setMode('receiver');
    setTimeout(() => {
      transferSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const openLoginModal = () => {
    setAuthModalState({ isOpen: true, tab: 'login' });
  };

  const openSignupModal = () => {
    setAuthModalState({ isOpen: true, tab: 'signup' });
  };

  const handleAuthSuccess = (userData, rememberMe = true) => {
    setUser(userData);
    saveSession(userData, rememberMe);
    setAuthModalState({ isOpen: false, tab: 'login' });
    setMode('sender');
    setTimeout(() => {
      transferSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLogout = () => {
    clearStoredSession();
    setUser(null);
    setMode(null);
    setRoomCode('');
    setSelectedFiles([]);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Glowing Constellation Canvas */}
      <ConstellationBg />

      {/* Dual Auth Modal (Log In / Create Account) */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialTab={authModalState.tab}
        onClose={() => setAuthModalState({ isOpen: false, tab: 'login' })}
        onSuccess={handleAuthSuccess}
        onOpenForgotPassword={() => setIsForgotPasswordOpen(true)}
      />

      {/* Forgot Password Reset Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onSuccess={(updatedUser) => {
          handleAuthSuccess(updatedUser, true);
          setIsForgotPasswordOpen(false);
        }}
      />

      {/* Sleek Themed Error Popup Modal */}
      <ErrorModal
        isOpen={!!errorMessage}
        errorMessage={errorMessage}
        onClose={() => setErrorMessage(null)}
      />

      {/* Account Email Verification Modal */}
      <VerifyEmailModal
        isOpen={isVerifyModalOpen}
        email={user?.email || ''}
        onClose={() => setIsVerifyModalOpen(false)}
        onVerificationSuccess={() => {
          if (user?.email) {
            markEmailVerified(user.email);
          }
          setUser((prev) => (prev ? { ...prev, emailVerified: true } : null));
          setIsVerifyModalOpen(false);
        }}
      />

      {/* Transfer History Modal */}
      <TransferHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        transferHistory={transferHistory}
        onReShare={handleReShare}
        onClearHistory={handleClearVaultHistory}
      />

      <div>
        {/* Top Navbar: Switches between Public & Authenticated State */}
        {user ? (
          <DashboardNavbar
            user={user}
            activeTab={dashboardTab}
            onSelectTab={(tab) => {
              setDashboardTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onLogout={handleLogout}
            onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
          />
        ) : (
          <Navbar onLogin={openLoginModal} onSignUp={openSignupModal} />
        )}

        {/* Main Application Container */}
        <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          {/* AUTHENTICATED USER WORKSPACE */}
          {user ? (
            <div className="space-y-8">
              {/* Interactive Transfer Engine Drawer */}
              {mode && (
                <div ref={transferSectionRef} className="max-w-3xl mx-auto glass-panel p-8 rounded-3xl border border-purple-500/40 relative shadow-2xl animate-in zoom-in-95 duration-300">
                  <button
                    onClick={() => setMode(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/60 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  {mode === 'sender' ? (
                    <SenderView
                      onFilesSelect={(files) => setSelectedFiles(files)}
                      selectedFiles={selectedFiles}
                      roomCode={roomCode}
                      onCreateSession={handleCreateSession}
                      isVerified={user?.emailVerified}
                      isPaused={progress?.isPaused || progress?.status === 'paused'}
                      onPause={() => {
                        if (typeof managerRef.current?.pauseTransfer === 'function') {
                          managerRef.current.pauseTransfer();
                        }
                      }}
                      onResume={() => {
                        if (typeof managerRef.current?.resumeTransfer === 'function') {
                          managerRef.current.resumeTransfer();
                        }
                      }}
                    />
                  ) : (
                    <ReceiverView onJoinSession={handleJoinSession} isLoading={isLoading} />
                  )}

                  {progress && (
                    <div className="mt-8">
                      <TransferProgress
                        progress={progress}
                        fileName={selectedFiles.length > 0 ? selectedFiles.map(f => f.name).join(', ') : receivedFile?.metadata.fileName || 'Encrypted File Stream'}
                        fileSize={selectedFiles.reduce((acc, f) => acc + f.size, 0) || receivedFile?.metadata.fileSize || 0}
                        onPause={() => {
                          if (typeof managerRef.current?.pauseTransfer === 'function') {
                            managerRef.current.pauseTransfer();
                          }
                        }}
                        onResume={() => {
                          if (typeof managerRef.current?.resumeTransfer === 'function') {
                            managerRef.current.resumeTransfer();
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Dedicated Active Tab View */}
              {dashboardTab === 'sessions' && (
                <div className="space-y-16">
                  {/* Hero Section */}
                  <Hero onSendFiles={openSender} onJoinSession={openReceiver} />

                  {/* User Account Dashboard & Transfer History Vault */}
                  <UserDashboard
                    user={user}
                    transferHistory={transferHistory}
                    onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
                    onReShare={handleReShare}
                    onClearHistory={handleClearVaultHistory}
                  />

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
                </div>
              )}

              {dashboardTab === 'history' && (
                <HistoryView
                  transferHistory={transferHistory}
                  onReShare={handleReShare}
                  onClearHistory={handleClearVaultHistory}
                />
              )}

              {dashboardTab === 'shared' && (
                <SharedFilesView
                  transferHistory={transferHistory}
                  onReShare={handleReShare}
                />
              )}

              {dashboardTab === 'settings' && (
                <SettingsView
                  user={user}
                  onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
                  onClearHistory={handleClearVaultHistory}
                />
              )}
            </div>
          ) : (
            /* PUBLIC MARKETING LANDING PAGE (When Logged Out) */
            <div className="space-y-16">
              {/* Hero Section */}
              <Hero onSendFiles={openSender} onJoinSession={openReceiver} />

              {/* Interactive Transfer Engine Drawer for Unauthenticated Users */}
              {mode && (
                <div ref={transferSectionRef} className="max-w-3xl mx-auto glass-panel p-8 rounded-3xl border border-purple-500/40 relative shadow-2xl animate-in zoom-in-95 duration-300">
                  <button
                    onClick={() => setMode(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/60 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  {mode === 'sender' ? (
                    <SenderView
                      onFilesSelect={(files) => setSelectedFiles(files)}
                      selectedFiles={selectedFiles}
                      roomCode={roomCode}
                      onCreateSession={handleCreateSession}
                      isVerified={false}
                      isPaused={progress?.isPaused || progress?.status === 'paused'}
                      onPause={() => {
                        if (typeof managerRef.current?.pauseTransfer === 'function') {
                          managerRef.current.pauseTransfer();
                        }
                      }}
                      onResume={() => {
                        if (typeof managerRef.current?.resumeTransfer === 'function') {
                          managerRef.current.resumeTransfer();
                        }
                      }}
                    />
                  ) : (
                    <ReceiverView onJoinSession={handleJoinSession} isLoading={isLoading} />
                  )}

                  {progress && (
                    <div className="mt-8">
                      <TransferProgress
                        progress={progress}
                        fileName={selectedFiles.length > 0 ? selectedFiles.map(f => f.name).join(', ') : receivedFile?.metadata.fileName || 'Encrypted File Stream'}
                        fileSize={selectedFiles.reduce((acc, f) => acc + f.size, 0) || receivedFile?.metadata.fileSize || 0}
                        onPause={() => {
                          if (typeof managerRef.current?.pauseTransfer === 'function') {
                            managerRef.current.pauseTransfer();
                          }
                        }}
                        onResume={() => {
                          if (typeof managerRef.current?.resumeTransfer === 'function') {
                            managerRef.current.resumeTransfer();
                          }
                        }}
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
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 px-6 text-center text-xs text-slate-400 font-mono relative z-10 bg-[#060913]/90">
        CipherStream P2P • Zero-Cloud E2EE Architecture • JavaScript + JSDoc Annotated
      </footer>
    </div>
  );
}
