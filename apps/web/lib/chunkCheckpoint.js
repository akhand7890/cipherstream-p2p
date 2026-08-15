'use client';

/**
 * IndexedDB Chunk Checkpoint Store for P2P Pause & Resume Protocol
 */

const DB_NAME = 'cipherstream_checkpoints_db';
const DB_VERSION = 1;
const STORE_NAME = 'checkpoints';

/**
 * Open IndexedDB connection
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: ['transferId', 'chunkIndex'] });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Save chunk checkpoint to IndexedDB
 * @param {string} transferId
 * @param {number} chunkIndex
 * @param {ArrayBuffer} chunkData
 * @returns {Promise<void>}
 */
export async function saveChunkCheckpoint(transferId, chunkIndex, chunkData) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    store.put({
      transferId,
      chunkIndex,
      chunkData,
      timestamp: Date.now(),
    });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[ChunkCheckpoint] Error saving chunk:', err);
  }
}

/**
 * Get highest contiguous chunk index saved for a transfer
 * @param {string} transferId
 * @returns {Promise<number>}
 */
export async function getLatestChunkIndex(transferId) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAllKeys();

    return new Promise((resolve) => {
      req.onsuccess = () => {
        const keys = req.result || [];
        const indices = keys
          .filter((k) => k[0] === transferId)
          .map((k) => k[1])
          .sort((a, b) => a - b);

        if (indices.length === 0) {
          resolve(0);
          return;
        }

        // Find highest contiguous index
        let maxContiguous = 0;
        for (let i = 0; i < indices.length; i++) {
          if (indices[i] === maxContiguous) {
            maxContiguous++;
          } else {
            break;
          }
        }

        resolve(maxContiguous);
      };
      req.onerror = () => resolve(0);
    });
  } catch (err) {
    console.warn('[ChunkCheckpoint] Error getting chunk index:', err);
    return 0;
  }
}

/**
 * Clear checkpoints for completed transfer
 * @param {string} transferId
 * @returns {Promise<void>}
 */
export async function clearCheckpoint(transferId) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAllKeys();

    req.onsuccess = () => {
      const keys = req.result || [];
      keys.forEach((key) => {
        if (key[0] === transferId) {
          store.delete(key);
        }
      });
    };
  } catch (err) {
    console.warn('[ChunkCheckpoint] Error clearing checkpoint:', err);
  }
}
