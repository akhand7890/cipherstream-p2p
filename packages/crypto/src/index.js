/**
 * CipherStream P2P — W3C Web Crypto API E2EE Primitives
 * Native browser SubtleCrypto implementation of ECDH (P-256) and AES-256-GCM
 * JavaScript + JSDoc Annotated (Zero-Build Type Safety)
 */

/**
 * @typedef {Object} KeyPairResult
 * @property {CryptoKeyPair} keyPair
 * @property {JsonWebKey} publicKeyJwk
 */

/**
 * Generate an ephemeral ECDH P-256 key pair for key exchange
 * @returns {Promise<KeyPairResult>}
 */
export async function generateECDHKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  );

  const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);

  return { keyPair, publicKeyJwk };
}

/**
 * Import a remote peer's public key from JWK format
 * @param {JsonWebKey} jwk
 * @returns {Promise<CryptoKey>}
 */
export async function importPeerPublicKey(jwk) {
  return await window.crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  );
}

/**
 * Derive a 256-bit AES-GCM symmetric key using ECDH shared secret & HKDF
 * @param {CryptoKey} ownPrivateKey
 * @param {CryptoKey} peerPublicKey
 * @returns {Promise<CryptoKey>}
 */
export async function deriveSharedAESKey(ownPrivateKey, peerPublicKey) {
  const sharedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'ECDH',
      public: peerPublicKey,
    },
    ownPrivateKey,
    256
  );

  const hkdfKey = await window.crypto.subtle.importKey(
    'raw',
    sharedBits,
    'HKDF',
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(16), // Ephemeral salt
      info: new TextEncoder().encode('cipherstream-p2p-v1-e2ee'),
    },
    hkdfKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a binary file chunk using AES-256-GCM with a unique 96-bit IV.
 * Prepends the 12-byte IV directly to the front of the payload.
 * @param {ArrayBuffer} chunkData
 * @param {CryptoKey} aesKey
 * @returns {Promise<ArrayBuffer>}
 */
export async function encryptChunk(chunkData, aesKey) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    aesKey,
    chunkData
  );

  const combined = new Uint8Array(12 + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), 12);
  return combined.buffer;
}

/**
 * Decrypt an encrypted binary chunk using AES-256-GCM.
 * Extracts the 12-byte IV from the front of the packet.
 * @param {ArrayBuffer} packetBuffer
 * @param {CryptoKey} aesKey
 * @returns {Promise<ArrayBuffer>}
 */
export async function decryptChunk(packetBuffer, aesKey) {
  const iv = new Uint8Array(packetBuffer.slice(0, 12));
  const encryptedData = packetBuffer.slice(12);

  return await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    aesKey,
    encryptedData
  );
}

/**
 * Calculate SHA-256 checksum digest of an ArrayBuffer
 * @param {ArrayBuffer} data
 * @returns {Promise<string>}
 */
export async function calculateSHA256(data) {
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Utility Helpers
/**
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * @param {string} base64
 * @returns {ArrayBuffer}
 */
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
