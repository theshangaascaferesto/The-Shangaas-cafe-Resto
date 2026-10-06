const IDB_NAME = 'shangaas_permanent_signatures_db';
const IDB_STORE = 'signature_files';
const CHUNK_SIZE_BYTES = 750 * 1024; // 750 KB per chunk — safe for all proxies

function openSignatureIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveSignatureFileToIdb(
  id: string,
  blob: Blob,
  fileName: string,
  mimeType: string
): Promise<void> {
  try {
    const db = await openSignatureIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put({ blob, fileName, mimeType, updatedAt: Date.now() }, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // ignore IDB errors
  }
}

export async function getSignatureFileFromIdb(
  id: string
): Promise<{ blob: Blob; fileName: string; mimeType: string } | null> {
  try {
    const db = await openSignatureIdb();
    const record = await new Promise<any>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    if (record && record.blob instanceof Blob) {
      return record;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function removeSignatureFileFromIdb(id: string): Promise<void> {
  try {
    const db = await openSignatureIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // ignore
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + step))
    );
  }
  return btoa(binary);
}

export async function uploadSignatureFileChunked(
  id: string,
  blob: Blob,
  fileName: string,
  mimeType: string,
  onProgress?: (percent: number) => void
): Promise<{ assetPath: string; filePath: string; sizeBytes: number } | null> {
  const totalSize = blob.size;
  const totalChunks = Math.max(1, Math.ceil(totalSize / CHUNK_SIZE_BYTES));

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE_BYTES;
    const end = Math.min(totalSize, start + CHUNK_SIZE_BYTES);
    const slice = blob.slice(start, end);
    const arrayBuffer = await slice.arrayBuffer();
    const chunkBase64 = arrayBufferToBase64(arrayBuffer);

    const res = await fetch('/api/signature-assets/chunk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        chunkIndex,
        totalChunks,
        mimeType: mimeType || blob.type || 'image/gif',
        fileName,
        chunkBase64,
      }),
    });

    if (!res.ok) {
      throw new Error(`Upload failed on chunk ${chunkIndex + 1}/${totalChunks}`);
    }

    const data = await res.json();
    if (onProgress) {
      onProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100));
    }

    if (data.done && data.assetPath) {
      return {
        assetPath: data.assetPath,
        filePath: data.filePath,
        sizeBytes: data.sizeBytes,
      };
    }
  }

  return null;
}
