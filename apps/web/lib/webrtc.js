import {
  generateECDHKeyPair,
  importPeerPublicKey,
  deriveSharedAESKey,
  encryptChunk,
  decryptChunk,
} from '@cipherstream/crypto';
import { SignalingEventType } from '@cipherstream/types';
import { audioSynth } from './audio';

const CHUNK_SIZE = 64 * 1024; // 64KB chunks
const BUFFER_HIGH_WATERMARK = 1024 * 1024; // 1MB backpressure threshold

/**
 * P2PTransferManager — Client WebRTC DataChannel Mesh & Web Crypto E2EE Engine
 * JavaScript + JSDoc Annotated (Zero-Build Type Safety)
 */
export class P2PTransferManager {
  constructor() {
    /** @type {WebSocket | null} */
    this.ws = null;

    /** @type {Map<string, RTCPeerConnection>} */
    this.peerConnections = new Map();
    /** @type {Map<string, RTCDataChannel>} */
    this.dataChannels = new Map();

    // Fallback single connection for single-peer compatibility
    /** @type {RTCPeerConnection | null} */
    this.pc = null;
    /** @type {RTCDataChannel | null} */
    this.dataChannel = null;

    /** @type {CryptoKeyPair | null} */
    this.ownKeyPair = null;
    /** @type {JsonWebKey | null} */
    this.ownPublicKeyJwk = null;
    /** @type {CryptoKey | null} */
    this.aesKey = null;

    /** @type {string} */
    this.roomId = '';
    this.isSender = false;
    this.isThrottled = false;
    this.isPaused = false;
    this.currentChunkIndex = 0;
    this.pin = '';
    this.autoDestruct = false;
    this.peerCount = 0;

    /** @type {import('@cipherstream/types').TransferProgress | null} */
    this.lastProgress = null;

    /** @type {((progress: import('@cipherstream/types').TransferProgress) => void) | undefined} */
    this.onProgressCallback = undefined;
    /** @type {((blob: Blob, metadata: import('@cipherstream/types').FileMetadata) => void) | undefined} */
    this.onFileReceivedCallback = undefined;
    /** @type {((errorMsg: string) => void) | undefined} */
    this.onErrorCallback = undefined;
    /** @type {((peerCount: number, peerList: string[]) => void) | undefined} */
    this.onPeersUpdateCallback = undefined;

    /** @type {ArrayBuffer[]} */
    this.receivedBuffers = [];
    /** @type {import('@cipherstream/types').FileMetadata | null} */
    this.currentMetadata = null;

    this.checkBatteryStatus();
  }

  async checkBatteryStatus() {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        this.isThrottled = battery.level < 0.15 && !battery.charging;
        battery.addEventListener('levelchange', () => {
          this.isThrottled = battery.level < 0.15 && !battery.charging;
        });
      } catch {
        // Battery API not available
      }
    }
  }

  /**
   * @param {string} [wsUrl='ws://localhost:8080/ws']
   * @param {() => void} [onOpen]
   */
  connectSignaling(wsUrl = 'ws://localhost:8080/ws', onOpen) {
    try {
      this.ws = new WebSocket(wsUrl);
    } catch (err) {
      console.warn('[P2P] Failed to instantiate WebSocket:', err);
      return;
    }

    this.ws.onerror = (event) => {
      console.warn('[P2P] WebSocket Signaling Error:', event);
    };

    this.ws.onopen = async () => {
      console.log('[P2P] WebSocket Signaling Connected');
      try {
        const { keyPair, publicKeyJwk } = await generateECDHKeyPair();
        this.ownKeyPair = keyPair;
        this.ownPublicKeyJwk = publicKeyJwk;
        onOpen?.();
      } catch (err) {
        console.error('[P2P] Failed to generate ECDH keys:', err);
      }
    };

    this.ws.onmessage = async (event) => {
      try {
        if (typeof event.data === 'string') {
          const message = JSON.parse(event.data);
          await this.handleSignalingMessage(message);
        }
      } catch (err) {
        console.warn('[P2P] Error handling signaling message:', err);
      }
    };
  }

  /**
   * @param {(code: string) => void} onRoomCreated
   * @param {string} [pin='']
   * @param {boolean} [autoDestruct=false]
   * @param {string} [customCode='']
   */
  createRoom(onRoomCreated, pin = '', autoDestruct = false, customCode = '') {
    this.isSender = true;
    this.pin = pin;
    this.autoDestruct = autoDestruct;
    this.ws?.send(
      JSON.stringify({
        event: SignalingEventType.CREATE_ROOM,
        payload: { pin, autoDestruct, customCode },
        timestamp: Date.now(),
      })
    );

    if (!this.ws) return;
    const originalMessage = this.ws.onmessage;
    this.ws.onmessage = async (event) => {
      try {
        if (typeof event.data === 'string') {
          const message = JSON.parse(event.data);
          if (message.event === SignalingEventType.ROOM_CREATED) {
            this.roomId = message.roomId;
            onRoomCreated(message.payload.roomCode);
          }
        }
      } catch (err) {
        console.warn('[P2P] Error handling room created event:', err);
      }
      if (this.ws) {
        originalMessage?.call(this.ws, event);
      }
    };
  }

  /**
   * @param {string} roomCode
   * @param {() => void} onJoined
   * @param {string} [pin='']
   */
  joinRoom(roomCode, onJoined, pin = '') {
    this.isSender = false;
    this.pin = pin;
    this.ws?.send(
      JSON.stringify({
        event: SignalingEventType.JOIN_ROOM,
        payload: { roomCode, pin },
        timestamp: Date.now(),
      })
    );

    if (!this.ws) return;
    const originalMessage = this.ws.onmessage;
    this.ws.onmessage = async (event) => {
      try {
        if (typeof event.data === 'string') {
          const message = JSON.parse(event.data);
          if (message.event === SignalingEventType.ROOM_JOINED) {
            this.roomId = message.roomId;
            onJoined();
          }
        }
      } catch (err) {
        console.warn('[P2P] Error handling room joined event:', err);
      }
      if (this.ws) {
        originalMessage?.call(this.ws, event);
      }
    };
  }

  /**
   * @param {import('@cipherstream/types').SignalingMessage} message
   */
  async handleSignalingMessage(message) {
    switch (message.event) {
      case SignalingEventType.ERROR: {
        const errPayloadMsg = message.payload?.message || 'Invalid or expired 6-digit session code.';
        console.warn('[P2P] Signaling Error:', errPayloadMsg);
        this.onErrorCallback?.(errPayloadMsg);
        break;
      }

      case SignalingEventType.ROOM_JOINED: {
        audioSynth.playPeerConnectedChime();
        const peerId = message.payload?.peerId || 'default_peer';
        const peerCount = message.payload?.peerCount || 1;
        this.peerCount = peerCount;
        this.onPeersUpdateCallback?.(this.peerCount, Array.from(this.dataChannels.keys()));

        if (this.isSender) {
          // Send ECDH Public Key targeting new receiver peer
          this.ws?.send(
            JSON.stringify({
              event: SignalingEventType.ECDH_PUBLIC_KEY,
              roomId: this.roomId,
              targetPeerId: peerId,
              payload: { publicKeyJwk: this.ownPublicKeyJwk, peerId },
              timestamp: Date.now(),
            })
          );
          this.initWebRTCPeer(true, peerId);
        }
        break;
      }

      case SignalingEventType.ECDH_PUBLIC_KEY: {
        const peerJwk = message.payload.publicKeyJwk;
        const targetPeerId = message.payload.peerId || 'default_peer';
        const peerPublicKey = await importPeerPublicKey(peerJwk);
        this.aesKey = await deriveSharedAESKey(this.ownKeyPair.privateKey, peerPublicKey, this.pin || '');
        console.log('[P2P] E2EE AES-256-GCM Key Derived Successfully!');

        if (!this.isSender) {
          this.ws?.send(
            JSON.stringify({
              event: SignalingEventType.ECDH_PUBLIC_KEY,
              roomId: this.roomId,
              payload: { publicKeyJwk: this.ownPublicKeyJwk },
              timestamp: Date.now(),
            })
          );
          this.initWebRTCPeer(false, targetPeerId);
        } else {
          this.tryStartPendingTransfer();
        }
        break;
      }

      case SignalingEventType.SIGNAL_OFFER: {
        const targetPeerId = message.payload?.peerId || message.targetPeerId || 'default_peer';
        let pc = this.peerConnections.get(targetPeerId) || this.pc;
        if (!this.isSender && pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(message.payload.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          this.ws?.send(
            JSON.stringify({
              event: SignalingEventType.SIGNAL_ANSWER,
              roomId: this.roomId,
              targetPeerId,
              payload: { sdp: answer, peerId: targetPeerId },
              timestamp: Date.now(),
            })
          );
        }
        break;
      }

      case SignalingEventType.SIGNAL_ANSWER: {
        const targetPeerId = message.payload?.peerId || message.targetPeerId || 'default_peer';
        const pc = this.peerConnections.get(targetPeerId) || this.pc;
        if (this.isSender && pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(message.payload.sdp));
        }
        break;
      }

      case SignalingEventType.SIGNAL_ICE_CANDIDATE: {
        const targetPeerId = message.payload?.peerId || message.targetPeerId || 'default_peer';
        const pc = this.peerConnections.get(targetPeerId) || this.pc;
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(message.payload.candidate));
        }
        break;
      }

      case SignalingEventType.PEER_DISCONNECTED: {
        const pId = message.payload?.peerId;
        if (pId) {
          const pc = this.peerConnections.get(pId);
          pc?.close();
          this.peerConnections.delete(pId);
          this.dataChannels.delete(pId);
          this.peerCount = message.payload?.peerCount || this.dataChannels.size;
          this.onPeersUpdateCallback?.(this.peerCount, Array.from(this.dataChannels.keys()));
        }
        break;
      }
    }
  }

  /**
   * @param {boolean} isOffer
   * @param {string} [peerId='default_peer']
   */
  initWebRTCPeer(isOffer, peerId = 'default_peer') {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    this.peerConnections.set(peerId, pc);
    this.pc = pc; // fallback reference

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.ws?.send(
          JSON.stringify({
            event: SignalingEventType.SIGNAL_ICE_CANDIDATE,
            roomId: this.roomId,
            targetPeerId: peerId,
            payload: { candidate: event.candidate, peerId },
            timestamp: Date.now(),
          })
        );
      }
    };

    if (isOffer) {
      const dc = pc.createDataChannel('fileTransfer', { ordered: true });
      this.dataChannels.set(peerId, dc);
      this.dataChannel = dc; // fallback reference
      this.setupDataChannel(dc, peerId);

      pc.createOffer().then(async (offer) => {
        await pc.setLocalDescription(offer);
        this.ws?.send(
          JSON.stringify({
            event: SignalingEventType.SIGNAL_OFFER,
            roomId: this.roomId,
            targetPeerId: peerId,
            payload: { sdp: offer, peerId },
            timestamp: Date.now(),
          })
        );
      });
    } else {
      pc.ondatachannel = (event) => {
        const dc = event.channel;
        this.dataChannels.set(peerId, dc);
        this.dataChannel = dc;
        this.setupDataChannel(dc, peerId);
      };
    }
  }

  /**
   * @param {RTCDataChannel} dc
   * @param {string} peerId
   */
  setupDataChannel(dc, peerId) {
    if (!dc) return;
    dc.binaryType = 'arraybuffer';

    dc.onopen = async () => {
      console.log(`[P2P] WebRTC DataChannel Opened for Peer ${peerId}!`);
      this.onPeersUpdateCallback?.(this.dataChannels.size, Array.from(this.dataChannels.keys()));
      this.tryStartPendingTransfer();
    };

    dc.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        const msg = JSON.parse(event.data);
        if (msg.type === 'METADATA') {
          this.currentMetadata = msg.metadata;
          this.receivedBuffers = [];
        } else if (msg.type === 'CONTROL') {
          if (msg.action === 'PAUSE') {
            this.isPaused = true;
            if (this.lastProgress && this.onProgressCallback) {
              this.lastProgress = { ...this.lastProgress, status: 'paused', isPaused: true };
              this.onProgressCallback(this.lastProgress);
            }
          } else if (msg.action === 'RESUME') {
            this.isPaused = false;
            if (this.lastProgress && this.onProgressCallback) {
              this.lastProgress = { ...this.lastProgress, status: 'streaming', isPaused: false };
              this.onProgressCallback(this.lastProgress);
            }
          }
        }
      } else if (event.data instanceof ArrayBuffer) {
        try {
          const decrypted = await decryptChunk(event.data, this.aesKey);
          this.receivedBuffers.push(decrypted);

          if (this.currentMetadata && this.onProgressCallback) {
            const totalReceived = this.receivedBuffers.reduce((acc, b) => acc + b.byteLength, 0);
            const progData = {
              fileId: this.currentMetadata.fileId,
              bytesTransferred: totalReceived,
              totalBytes: this.currentMetadata.fileSize,
              chunksCompleted: this.receivedBuffers.length,
              totalChunks: this.currentMetadata.totalChunks,
              speedBps: this.isPaused ? 0 : 2.5 * 1024 * 1024,
              etaSeconds: this.isPaused ? 0 : Math.ceil((this.currentMetadata.fileSize - totalReceived) / (2.5 * 1024 * 1024)),
              status: totalReceived >= this.currentMetadata.fileSize ? 'completed' : this.isPaused ? 'paused' : 'streaming',
              isThrottled: this.isThrottled,
              isPaused: this.isPaused,
              peerCount: this.dataChannels.size || 1,
            };
            this.lastProgress = progData;
            this.onProgressCallback(progData);

            if (totalReceived >= this.currentMetadata.fileSize) {
              audioSynth.playTransferCompleteChime();
              const blob = new Blob(this.receivedBuffers, { type: this.currentMetadata.fileType });
              this.onFileReceivedCallback?.(blob, this.currentMetadata);
              this.receivedBuffers = [];
              this.currentMetadata = null;
            }
          }
        } catch (err) {
          console.error('[P2P E2EE] Chunk Decryption Failed — Security PIN Mismatch:', err);
          const pinErrMsg = 'Decryption Failed: Incorrect 4-Digit Security PIN or Key Mismatch. Please re-enter the session with the correct PIN.';
          this.onErrorCallback?.(pinErrMsg);
        }
      }
    };
  }

  tryStartPendingTransfer() {
    const hasOpenChannel = Array.from(this.dataChannels.values()).some((dc) => dc.readyState === 'open');
    if (
      this.isSender &&
      this.pendingFiles &&
      this.pendingFiles.length > 0 &&
      this.aesKey &&
      hasOpenChannel &&
      !this.isTransferring
    ) {
      this.isTransferring = true;
      this.startChunkedTransfer(this.pendingFiles, this.onProgressCallback);
    }
  }

  /**
   * @param {File | File[]} files
   * @param {(progress: import('@cipherstream/types').TransferProgress) => void} [onProgress]
   */
  async sendFiles(files, onProgress) {
    this.pendingFiles = Array.isArray(files) ? files : [files];
    if (onProgress) this.onProgressCallback = onProgress;
    this.tryStartPendingTransfer();
  }

  /**
   * @param {File} file
   * @param {(progress: import('@cipherstream/types').TransferProgress) => void} [onProgress]
   */
  async sendFile(file, onProgress) {
    return this.sendFiles([file], onProgress);
  }

  /**
   * @param {File | File[]} files
   * @param {(progress: import('@cipherstream/types').TransferProgress) => void} [onProgress]
   */
  async startChunkedTransfer(files, onProgress) {
    const openChannels = Array.from(this.dataChannels.values()).filter((dc) => dc.readyState === 'open');
    if (openChannels.length === 0 || !this.aesKey) return;

    const fileList = Array.isArray(files) ? files : [files];
    if (fileList.length === 0) return;

    const grandTotalBytes = fileList.reduce((sum, f) => sum + f.size, 0);
    let totalBytesSent = 0;
    const startTime = Date.now();

    for (let fIdx = 0; fIdx < fileList.length; fIdx++) {
      const file = fileList[fIdx];
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      /** @type {import('@cipherstream/types').FileMetadata} */
      const metadata = {
        fileId: `file_${Date.now()}_${fIdx}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        totalChunks,
        chunkSize: CHUNK_SIZE,
        sha256Digest: '',
        relativePath: file.relativePath || file.webkitRelativePath || file.name,
      };

      // Broadcast metadata header to all connected receivers in parallel
      for (const dc of this.dataChannels.values()) {
        if (dc.readyState === 'open') {
          dc.send(JSON.stringify({ type: 'METADATA', metadata }));
        }
      }

      for (let i = 0; i < totalChunks; i++) {
        while (this.isPaused) {
          await new Promise((r) => setTimeout(r, 150));
        }
        this.currentChunkIndex = i;

        if (this.isThrottled) {
          await new Promise((r) => setTimeout(r, 40));
        }

        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunkBuffer = await file.slice(start, end).arrayBuffer();
        const encryptedBuffer = await encryptChunk(chunkBuffer, this.aesKey);

        // Multi-Peer DataChannel Mesh Parallel Broadcast
        for (const dc of this.dataChannels.values()) {
          if (dc.readyState === 'open') {
            while (dc.bufferedAmount > BUFFER_HIGH_WATERMARK) {
              await new Promise((r) => setTimeout(r, 15));
            }
            dc.send(encryptedBuffer);
          }
        }

        totalBytesSent += (end - start);

        const elapsedSec = (Date.now() - startTime) / 1000 || 0.1;
        const speedBps = totalBytesSent / elapsedSec;

        const progData = {
          fileId: `${file.relativePath || file.name} (${fIdx + 1}/${fileList.length})`,
          bytesTransferred: totalBytesSent,
          totalBytes: grandTotalBytes,
          chunksCompleted: i + 1,
          totalChunks: Math.ceil(grandTotalBytes / CHUNK_SIZE),
          speedBps: this.isPaused ? 0 : speedBps,
          etaSeconds: this.isPaused ? 0 : Math.ceil((grandTotalBytes - totalBytesSent) / (speedBps || 1)),
          status: totalBytesSent >= grandTotalBytes ? 'completed' : this.isPaused ? 'paused' : 'streaming',
          isThrottled: this.isThrottled,
          isPaused: this.isPaused,
          isFolder: fileList.some((f) => f.relativePath && f.relativePath.includes('/')),
          peerCount: this.dataChannels.size || 1,
        };
        this.lastProgress = progData;
        onProgress?.(progData);
      }
    }
    this.isTransferring = false;
  }

  pauseTransfer() {
    this.isPaused = true;
    for (const dc of this.dataChannels.values()) {
      if (dc.readyState === 'open') {
        try {
          dc.send(JSON.stringify({ type: 'CONTROL', action: 'PAUSE' }));
        } catch (err) {
          console.warn('[P2P] Could not send CONTROL PAUSE:', err);
        }
      }
    }
    const currentProg = this.lastProgress || {
      fileId: 'File Stream',
      bytesTransferred: 0,
      totalBytes: 1,
      chunksCompleted: 0,
      totalChunks: 1,
      speedBps: 0,
      etaSeconds: 0,
      status: 'paused',
      isThrottled: this.isThrottled,
      isPaused: true,
      peerCount: this.dataChannels.size || 1,
    };
    this.lastProgress = {
      ...currentProg,
      status: 'paused',
      isPaused: true,
    };
    if (this.onProgressCallback) {
      this.onProgressCallback(this.lastProgress);
    }
  }

  resumeTransfer() {
    this.isPaused = false;
    for (const dc of this.dataChannels.values()) {
      if (dc.readyState === 'open') {
        try {
          dc.send(JSON.stringify({ type: 'CONTROL', action: 'RESUME' }));
        } catch (err) {
          console.warn('[P2P] Could not send CONTROL RESUME:', err);
        }
      }
    }
    const currentProg = this.lastProgress || {
      fileId: 'File Stream',
      bytesTransferred: 0,
      totalBytes: 1,
      chunksCompleted: 0,
      totalChunks: 1,
      speedBps: 0,
      etaSeconds: 0,
      status: 'streaming',
      isThrottled: this.isThrottled,
      isPaused: false,
      peerCount: this.dataChannels.size || 1,
    };
    this.lastProgress = {
      ...currentProg,
      status: 'streaming',
      isPaused: false,
    };
    if (this.onProgressCallback) {
      this.onProgressCallback(this.lastProgress);
    }
  }

  /**
   * @param {(progress: import('@cipherstream/types').TransferProgress) => void} cb
   */
  setOnProgress(cb) {
    this.onProgressCallback = cb;
  }

  /**
   * @param {(peerCount: number, peerList: string[]) => void} cb
   */
  setOnPeersUpdate(cb) {
    this.onPeersUpdateCallback = cb;
  }

  /**
   * @param {(blob: Blob, metadata: import('@cipherstream/types').FileMetadata) => void} cb
   */
  setOnFileReceived(cb) {
    this.onFileReceivedCallback = cb;
  }

  /**
   * @param {(errorMsg: string) => void} cb
   */
  setOnError(cb) {
    this.onErrorCallback = cb;
  }
}
