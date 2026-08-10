/**
 * CipherStream P2P — Shared Protocol Types & JSDoc Definitions
 * Zero-Build Type Safety via W3C & JSDoc Standards
 */

/**
 * @typedef {Object} TransferSession
 * @property {string} roomId
 * @property {string} roomCode - 6-digit numeric pairing code
 * @property {number} createdAt
 * @property {number} expiresAt
 * @property {boolean} senderConnected
 * @property {boolean} receiverConnected
 */

/**
 * Signaling Event Types
 * @readonly
 * @enum {string}
 */
export const SignalingEventType = {
  CREATE_ROOM: 'CREATE_ROOM',
  JOIN_ROOM: 'JOIN_ROOM',
  ROOM_CREATED: 'ROOM_CREATED',
  ROOM_JOINED: 'ROOM_JOINED',
  PEER_DISCONNECTED: 'PEER_DISCONNECTED',
  SIGNAL_OFFER: 'SIGNAL_OFFER',
  SIGNAL_ANSWER: 'SIGNAL_ANSWER',
  SIGNAL_ICE_CANDIDATE: 'SIGNAL_ICE_CANDIDATE',
  ECDH_PUBLIC_KEY: 'ECDH_PUBLIC_KEY',
  ERROR: 'ERROR',
};

/**
 * @template T
 * @typedef {Object} SignalingMessage
 * @property {string} event
 * @property {string} roomId
 * @property {T} payload
 * @property {number} timestamp
 */

/**
 * @typedef {Object} ECDHKeyPayload
 * @property {JsonWebKey} publicKeyJwk
 */

/**
 * @typedef {Object} WebRTCSdpPayload
 * @property {RTCSessionDescriptionInit} sdp
 */

/**
 * @typedef {Object} WebRTCIcePayload
 * @property {RTCIceCandidateInit} candidate
 */

/**
 * @typedef {Object} FileMetadata
 * @property {string} fileId
 * @property {string} fileName
 * @property {number} fileSize
 * @property {string} fileType
 * @property {number} totalChunks
 * @property {number} chunkSize
 * @property {string} sha256Digest
 */

/**
 * @typedef {Object} EncryptedChunkHeader
 * @property {number} chunkIndex
 * @property {number} totalChunks
 * @property {string} iv - Base64 encoded 96-bit IV
 * @property {string} sha256Checksum
 */

/**
 * @typedef {Object} TransferProgress
 * @property {string} fileId
 * @property {number} bytesTransferred
 * @property {number} totalBytes
 * @property {number} chunksCompleted
 * @property {number} totalChunks
 * @property {number} speedBps - Bytes per second
 * @property {number} etaSeconds
 * @property {'idle' | 'encrypting' | 'connecting' | 'streaming' | 'verifying' | 'completed' | 'failed'} status
 * @property {boolean} isThrottled - Low-battery throttling flag
 */
