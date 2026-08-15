'use client';

/**
 * Zero-Knowledge Encrypted Transfer History Vault
 * Client-Side AES-256-GCM Metadata Encryption & Storage Gateway
 */

const VAULT_PREFIX = 'cipherstream_vault_';

/**
 * @typedef {Object} FileInfo
 * @property {string} name
 * @property {number} size
 */

/**
 * @typedef {Object} TransferRecord
 * @property {string} id
 * @property {string} roomCode
 * @property {FileInfo[]} files
 * @property {number} totalSize
 * @property {number} fileCount
 * @property {'SENT' | 'RECEIVED'} type
 * @property {boolean} pinProtected
 * @property {boolean} autoDestruct
 * @property {number} timestamp
 */

/**
 * Derive 256-bit AES-GCM vault key from user email using HKDF-SHA256
 * @param {string} email
 * @returns {Promise<CryptoKey>}
 */
async function deriveVaultKey(email) {
  const enc = new TextEncoder();
  const masterKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(email.trim().toLowerCase() + '_cipherstream_vault_v1_secret'),
    { name: 'HKDF' },
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: enc.encode('cipherstream_vault_salt_99'),
      info: enc.encode('cipherstream_transfer_history_aes_key'),
    },
    masterKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Convert ArrayBuffer to Hex String
 * @param {ArrayBuffer} buf
 * @returns {string}
 */
function bufToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert Hex String to Uint8Array
 * @param {string} hex
 * @returns {Uint8Array}
 */
function hexToBuf(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Encrypt record object into hex payload
 * @param {Object} record
 * @param {CryptoKey} key
 * @returns {Promise<{ iv: string, ciphertext: string }>}
 */
async function encryptRecord(record, key) {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const plaintext = JSON.stringify(record);

  const encryptedBuf = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );

  return {
    iv: bufToHex(iv.buffer),
    ciphertext: bufToHex(encryptedBuf),
  };
}

/**
 * Decrypt payload hex back into object
 * @param {{ iv: string, ciphertext: string }} payload
 * @param {CryptoKey} key
 * @returns {Promise<TransferRecord | null>}
 */
async function decryptRecord(payload, key) {
  try {
    const dec = new TextDecoder();
    const iv = hexToBuf(payload.iv);
    const ciphertext = hexToBuf(payload.ciphertext);

    const decryptedBuf = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return JSON.parse(dec.decode(decryptedBuf));
  } catch (err) {
    console.error('[TransferVault] Error decrypting record:', err);
    return null;
  }
}

/**
 * Record a new transfer into encrypted user vault
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.roomCode
 * @param {Array<{ name: string, size: number } | File>} params.files
 * @param {'SENT' | 'RECEIVED'} params.type
 * @param {boolean} [params.pinProtected]
 * @param {boolean} [params.autoDestruct]
 * @returns {Promise<TransferRecord | null>}
 */
export async function recordTransfer({
  email,
  roomCode,
  files = [],
  type = 'SENT',
  pinProtected = false,
  autoDestruct = false,
}) {
  if (!email || typeof window === 'undefined') return null;

  try {
    const cleanEmail = email.trim().toLowerCase();
    const key = await deriveVaultKey(cleanEmail);

    const normalizedFiles = files.map((f) => ({
      name: f.name || f.fileName || 'Encrypted File',
      size: f.size || f.fileSize || 0,
    }));

    const totalSize = normalizedFiles.reduce((sum, f) => sum + f.size, 0);

    /** @type {TransferRecord} */
    const record = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      roomCode,
      files: normalizedFiles,
      totalSize,
      fileCount: normalizedFiles.length,
      type,
      pinProtected,
      autoDestruct,
      timestamp: Date.now(),
    };

    const encryptedPayload = await encryptRecord(record, key);
    const storageKey = VAULT_PREFIX + cleanEmail;

    const rawExisting = localStorage.getItem(storageKey);
    const existingList = rawExisting ? JSON.parse(rawExisting) : [];
    existingList.unshift(encryptedPayload);

    // Retain top 50 transfer records
    const trimmed = existingList.slice(0, 50);
    localStorage.setItem(storageKey, JSON.stringify(trimmed));

    return record;
  } catch (err) {
    console.error('[TransferVault] Failed to record transfer:', err);
    return null;
  }
}

/**
 * Retrieve and decrypt transfer history for user
 * @param {string} email
 * @returns {Promise<TransferRecord[]>}
 */
export async function getTransferHistory(email) {
  if (!email || typeof window === 'undefined') return [];

  try {
    const cleanEmail = email.trim().toLowerCase();
    const storageKey = VAULT_PREFIX + cleanEmail;

    const rawExisting = localStorage.getItem(storageKey);
    if (!rawExisting) return [];

    const payloadList = JSON.parse(rawExisting);
    const key = await deriveVaultKey(cleanEmail);

    const decryptedList = await Promise.all(
      payloadList.map((payload) => decryptRecord(payload, key))
    );

    return decryptedList.filter(Boolean);
  } catch (err) {
    console.error('[TransferVault] Error reading transfer history:', err);
    return [];
  }
}

/**
 * Clear transfer history for user
 * @param {string} email
 */
export function clearTransferHistory(email) {
  if (!email || typeof window === 'undefined') return;
  const cleanEmail = email.trim().toLowerCase();
  localStorage.removeItem(VAULT_PREFIX + cleanEmail);
}
