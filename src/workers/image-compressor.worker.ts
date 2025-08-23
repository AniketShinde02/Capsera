// Minimal web worker for image compression. Uses OffscreenCanvas when available.
self.addEventListener('message', async (ev) => {
  const { file, maxBytes } = ev.data || {};
  if (!file) {
    self.postMessage({ success: false, error: 'No file provided to worker' });
    return;
  }

  // Require OffscreenCanvas in the worker for safe, off-thread compression.
  if (typeof OffscreenCanvas === 'undefined') {
    self.postMessage({ success: false, error: 'OffscreenCanvas not supported in this environment' });
    return;
  }

  try {
    // Convert File to ImageBitmap for efficient off-thread processing
    const bitmap: ImageBitmap = await createImageBitmap(file as Blob);
    let width = bitmap.width;
    let height = bitmap.height;
    const maxDimension = 2048;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.floor((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.floor((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = new OffscreenCanvas(width, height);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(bitmap, 0, 0, width, height);

    let quality = 0.9;
    // convertToBlob exists on OffscreenCanvas in modern browsers/workers
    let blob = (await (canvas as any).convertToBlob({ type: 'image/jpeg', quality })) as Blob;

    while ((blob as Blob).size > maxBytes && quality > 0.3) {
      quality -= 0.1;
      blob = (await (canvas as any).convertToBlob({ type: 'image/jpeg', quality })) as Blob;
    }

    // If still too big, shrink dimensions gradually
    while ((blob as Blob).size > maxBytes && (width > 1024 || height > 1024)) {
      width = Math.floor(width * 0.8);
      height = Math.floor(height * 0.8);
      canvas.width = width;
      canvas.height = height;
      const ctx2 = canvas.getContext('2d');
      ctx2?.drawImage(bitmap, 0, 0, width, height);
      quality = 0.9;
      blob = (await (canvas as any).convertToBlob({ type: 'image/jpeg', quality })) as Blob;
    }

    const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: 'image/jpeg', lastModified: Date.now() });
    self.postMessage({ success: true, file: compressedFile });
  } catch (error: any) {
    self.postMessage({ success: false, error: error?.message || String(error) });
  }
});
