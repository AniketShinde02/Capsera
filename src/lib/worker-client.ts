// Lightweight wrapper to spawn the image compressor worker when available
export async function compressWithWorker(file: File, maxBytes: number): Promise<File> {
  return new Promise((resolve, reject) => {
    try {
      // Try to locate worker script path relative to public build
      // In Next.js, workers can be imported via new URL() when using bundlers; keep a safe fallback
      let worker: Worker | null = null;
      try {
        // @ts-ignore dynamic import of worker file path
        worker = new Worker(new URL('../workers/image-compressor.worker.ts', import.meta.url), { type: 'module' });
      } catch (e) {
        try {
          worker = new Worker('/_next/static/workers/image-compressor.worker.js');
        } catch (e2) {
          // No worker available
        }
      }

      if (!worker) {
        return reject(new Error('Web Worker not available in this environment'));
      }

      const onMessage = (ev: MessageEvent) => {
        const data = ev.data || {};
        if (data.success) {
          worker?.removeEventListener('message', onMessage);
          worker?.terminate();
          resolve(data.file as File);
        } else {
          worker?.removeEventListener('message', onMessage);
          worker?.terminate();
          reject(new Error(data.error || 'Worker failed to compress image'));
        }
      };

      worker.addEventListener('message', onMessage);
      worker.postMessage({ file, maxBytes });
    } catch (error) {
      reject(error);
    }
  });
}
