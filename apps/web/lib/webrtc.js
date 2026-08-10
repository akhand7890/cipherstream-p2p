import {
  generateECDHKeyPair,
  importPeerPublicKey,
  deriveSharedAESKey,
  encryptChunk,
  decryptChunk,
} from '@cipherstream/crypto';
import { SignalingEventType } from '@cipherstream/types';

const CHUNK_SIZE = 64 * 1024; // 64KB chunks
const BUFFER_HIGH_WATERMARK = 1024 * 1024; // 1MB backpressure threshold

/**
 * P2PTransferManager — Client WebRTC DataChannel & Web Crypto E2EE Engine
 * JavaScript + JSDoc Annotated (Zero-Build Type Safety)
 */
export class P2PTransferManager {
  constructor() {
    /** @type {WebSocket | null} */
    this.ws = null;
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
    /** @type {boolean} */
    this.isSender = false;
    /** @type {boolean} */
    this.isThrottled = false;

    /** @type {((progress: import('@cipherstream/types').TransferProgress) => void) | undefined} */
    this.onProgressCallback = undefined;
    /** @type {((blob: Blob, metadata: import('@cipherstream/types').FileMetadata) => void) | undefined} */
    this.onFileReceivedCallback = undefined;

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
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = async () => {
      console.log('[P2P] WebSocket Signaling Connected');
      const { keyPair, publicKeyJwk } = await generateECDHKeyPair();
      this.ownKeyPair = keyPair;
      this.ownPublicKeyJwk = publicKeyJwk;
      onOpen?.();
    };

    this.ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      await this.handleSignalingMessage(message);
    };
  }

  /**
   * @param {(code: string) => void} onRoomCreated
   */
  createRoom(onRoomCreated) {
    this.isSender = true;
    this.ws?.send(
      JSON.stringify({
        event: SignalingEventType.CREATE_ROOM,
        timestamp: Date.now(),
      })
    );

    if (!this.ws) return;
    const originalMessage = this.ws.onmessage;
    this.ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.event === SignalingEventType.ROOM_CREATED) {
        this.roomId = message.roomId;
        onRoomCreated(message.payload.roomCode);
      }
      if (this.ws) {
        originalMessage?.call(this.ws, event);
      }
    };
  }

  /**
   * @param {string} roomCode
   * @param {() => void} onJoined
   */
  joinRoom(roomCode, onJoined) {
    this.isSender = false;
    this.ws?.send(
      JSON.stringify({
        event: SignalingEventType.JOIN_ROOM,
        payload: { roomCode },
        timestamp: Date.now(),
      })
    );

    if (!this.ws) return;
    const originalMessage = this.ws.onmessage;
    this.ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.event === SignalingEventType.ROOM_JOINED) {
        this.roomId = message.roomId;
        onJoined();
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
      case SignalingEventType.ROOM_JOINED:
        if (this.isSender) {
          this.ws?.send(
            JSON.stringify({
              event: SignalingEventType.ECDH_PUBLIC_KEY,
              roomId: this.roomId,
              payload: { publicKeyJwk: this.ownPublicKeyJwk },
              timestamp: Date.now(),
            })
          );
          this.initWebRTCPeer(true);
        }
        break;

      case SignalingEventType.ECDH_PUBLIC_KEY:
        const peerJwk = message.payload.publicKeyJwk;
        const peerPublicKey = await importPeerPublicKey(peerJwk);
        this.aesKey = await deriveSharedAESKey(this.ownKeyPair.privateKey, peerPublicKey);
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
          this.initWebRTCPeer(false);
        }
        break;

      case SignalingEventType.SIGNAL_OFFER:
        if (!this.isSender && this.pc) {
          await this.pc.setRemoteDescription(new RTCSessionDescription(message.payload.sdp));
          const answer = await this.pc.createAnswer();
          await this.pc.setLocalDescription(answer);
          this.ws?.send(
            JSON.stringify({
              event: SignalingEventType.SIGNAL_ANSWER,
              roomId: this.roomId,
              payload: { sdp: answer },
              timestamp: Date.now(),
            })
          );
        }
        break;

      case SignalingEventType.SIGNAL_ANSWER:
        if (this.isSender && this.pc) {
          await this.pc.setRemoteDescription(new RTCSessionDescription(message.payload.sdp));
        }
        break;

      case SignalingEventType.SIGNAL_ICE_CANDIDATE:
        if (this.pc) {
          await this.pc.addIceCandidate(new RTCIceCandidate(message.payload.candidate));
        }
        break;
    }
  }

  /**
   * @param {boolean} isOffer
   */
  initWebRTCPeer(isOffer) {
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.ws?.send(
          JSON.stringify({
            event: SignalingEventType.SIGNAL_ICE_CANDIDATE,
            roomId: this.roomId,
            payload: { candidate: event.candidate },
            timestamp: Date.now(),
          })
        );
      }
    };

    if (isOffer) {
      this.dataChannel = this.pc.createDataChannel('fileTransfer', { ordered: true });
      this.setupDataChannel();
      this.pc.createOffer().then(async (offer) => {
        await this.pc.setLocalDescription(offer);
        this.ws?.send(
          JSON.stringify({
            event: SignalingEventType.SIGNAL_OFFER,
            roomId: this.roomId,
            payload: { sdp: offer },
            timestamp: Date.now(),
          })
        );
      });
    } else {
      this.pc.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setupDataChannel();
      };
    }
  }

  setupDataChannel() {
    if (!this.dataChannel) return;
    this.dataChannel.binaryType = 'arraybuffer';

    this.dataChannel.onopen = async () => {
      console.log('[P2P] WebRTC DataChannel Opened & Ready!');
      if (this.isSender && this.pendingFile && this.aesKey) {
        await this.startChunkedTransfer(this.pendingFile, this.onProgressCallback);
      }
    };

    this.dataChannel.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        const msg = JSON.parse(event.data);
        if (msg.type === 'METADATA') {
          this.currentMetadata = msg.metadata;
          this.receivedBuffers = [];
        }
      } else if (event.data instanceof ArrayBuffer) {
        const decrypted = await decryptChunk(event.data, this.aesKey);
        this.receivedBuffers.push(decrypted);

        if (this.currentMetadata && this.onProgressCallback) {
          const totalReceived = this.receivedBuffers.reduce((acc, b) => acc + b.byteLength, 0);
          this.onProgressCallback({
            fileId: this.currentMetadata.fileId,
            bytesTransferred: totalReceived,
            totalBytes: this.currentMetadata.fileSize,
            chunksCompleted: this.receivedBuffers.length,
            totalChunks: this.currentMetadata.totalChunks,
            speedBps: 2.5 * 1024 * 1024,
            etaSeconds: Math.ceil((this.currentMetadata.fileSize - totalReceived) / (2.5 * 1024 * 1024)),
            status: totalReceived >= this.currentMetadata.fileSize ? 'completed' : 'streaming',
            isThrottled: this.isThrottled,
          });

          if (totalReceived >= this.currentMetadata.fileSize) {
            const blob = new Blob(this.receivedBuffers, { type: this.currentMetadata.fileType });
            this.onFileReceivedCallback?.(blob, this.currentMetadata);
          }
        }
      }
    };
  }

  /**
   * @param {File} file
   * @param {(progress: import('@cipherstream/types').TransferProgress) => void} [onProgress]
   */
  async sendFile(file, onProgress) {
    this.pendingFile = file;
    if (onProgress) this.onProgressCallback = onProgress;

    if (!this.dataChannel || this.dataChannel.readyState !== 'open' || !this.aesKey) {
      console.log('[P2P] WebRTC DataChannel queued file; waiting for peer join & channel open.');
      return;
    }

    await this.startChunkedTransfer(file, onProgress);
  }

  /**
   * @param {File} file
   * @param {(progress: import('@cipherstream/types').TransferProgress) => void} [onProgress]
   */
  async startChunkedTransfer(file, onProgress) {
    if (!this.dataChannel || !this.aesKey) return;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    /** @type {import('@cipherstream/types').FileMetadata} */
    const metadata = {
      fileId: `file_${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      totalChunks,
      chunkSize: CHUNK_SIZE,
      sha256Digest: '',
    };

    this.dataChannel.send(JSON.stringify({ type: 'METADATA', metadata }));

    let bytesSent = 0;
    const startTime = Date.now();

    for (let i = 0; i < totalChunks; i++) {
      if (this.isThrottled) {
        await new Promise((r) => setTimeout(r, 40));
      }

      while (this.dataChannel.bufferedAmount > BUFFER_HIGH_WATERMARK) {
        await new Promise((r) => setTimeout(r, 15));
      }

      const start = i * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const chunkBuffer = await file.slice(start, end).arrayBuffer();
      const encryptedBuffer = await encryptChunk(chunkBuffer, this.aesKey);

      this.dataChannel.send(encryptedBuffer);
      bytesSent += (end - start);

      const elapsedSec = (Date.now() - startTime) / 1000 || 0.1;
      const speedBps = bytesSent / elapsedSec;

      onProgress?.({
        fileId: metadata.fileId,
        bytesTransferred: bytesSent,
        totalBytes: file.size,
        chunksCompleted: i + 1,
        totalChunks,
        speedBps,
        etaSeconds: Math.ceil((file.size - bytesSent) / speedBps),
        status: i + 1 === totalChunks ? 'completed' : 'streaming',
        isThrottled: this.isThrottled,
      });
    }
  }

  /**
   * @param {(progress: import('@cipherstream/types').TransferProgress) => void} cb
   */
  setOnProgress(cb) {
    this.onProgressCallback = cb;
  }

  /**
   * @param {(blob: Blob, metadata: import('@cipherstream/types').FileMetadata) => void} cb
   */
  setOnFileReceived(cb) {
    this.onFileReceivedCallback = cb;
  }
}
