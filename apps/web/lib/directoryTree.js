'use client';

import JSZip from 'jszip';

/**
 * Traverses drag-and-dropped DataTransferItems recursively to extract directory files with relative paths.
 * @param {DataTransferItemList} items
 * @returns {Promise<File[]>}
 */
export async function traverseDataTransferItems(items) {
  const files = [];

  const readEntry = async (entry, path = '') => {
    if (entry.isFile) {
      return new Promise((resolve) => {
        entry.file((file) => {
          // Attach custom relativePath property
          Object.defineProperty(file, 'relativePath', {
            value: path ? `${path}/${file.name}` : file.name,
            writable: false,
            enumerable: true,
          });
          files.push(file);
          resolve();
        });
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const entries = await new Promise((resolve) => {
        const results = [];
        const readBatch = () => {
          dirReader.readEntries((batch) => {
            if (batch.length === 0) {
              resolve(results);
            } else {
              results.push(...batch);
              readBatch();
            }
          });
        };
        readBatch();
      });

      const currentPath = path ? `${path}/${entry.name}` : entry.name;
      for (const childEntry of entries) {
        await readEntry(childEntry, currentPath);
      }
    }
  };

  const promises = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        promises.push(readEntry(entry));
      }
    }
  }

  await Promise.all(promises);
  return files;
}

/**
 * Normalizes a list of File objects ensuring relativePath is populated.
 * @param {File[]} fileList
 * @returns {File[]}
 */
export function normalizeDirectoryFiles(fileList) {
  return Array.from(fileList).map((file) => {
    const relPath = file.relativePath || file.webkitRelativePath || file.name;
    if (!file.relativePath) {
      Object.defineProperty(file, 'relativePath', {
        value: relPath,
        writable: false,
        enumerable: true,
      });
    }
    return file;
  });
}

/**
 * Constructs a Directory Manifest structure for sending over WebRTC.
 * @param {File[]} fileList
 * @returns {Object}
 */
export function buildDirectoryManifest(fileList) {
  const files = normalizeDirectoryFiles(fileList);
  const isFolder = files.some((f) => f.relativePath && f.relativePath.includes('/'));
  
  let rootName = 'Directory Bundle';
  if (isFolder) {
    const firstRel = files.find((f) => f.relativePath.includes('/'))?.relativePath;
    if (firstRel) {
      rootName = firstRel.split('/')[0];
    }
  }

  return {
    isFolder,
    rootName,
    totalFiles: files.length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
    fileMap: files.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      relativePath: f.relativePath || f.name,
    })),
  };
}

/**
 * Bundles received files into a ZIP archive and triggers a browser download.
 * @param {{ blob: Blob, metadata: { fileName: string, relativePath?: string } }[]} receivedFiles
 * @param {string} archiveName
 */
export async function downloadFilesAsZip(receivedFiles, archiveName = 'CipherStream_Bundle.zip') {
  const zip = new JSZip();

  for (const item of receivedFiles) {
    const path = item.metadata.relativePath || item.metadata.fileName;
    zip.file(path, item.blob);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = archiveName.endsWith('.zip') ? archiveName : `${archiveName}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
