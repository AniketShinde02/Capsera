import { useState, useCallback } from 'react';

interface UseImageOptions {
  onError?: (error: string) => void;
  onLoad?: () => void;
  fallbackSrc?: string;
}

interface UseImageReturn {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  handleImageLoad: () => void;
  handleImageError: (error?: string) => void;
  resetImage: () => void;
}

export function useImage(options: UseImageOptions = {}): UseImageReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    setErrorMessage(null);
    options.onLoad?.();
  }, [options.onLoad]);

  const handleImageError = useCallback((error?: string) => {
    setIsLoading(false);
    setHasError(true);
    const message = error || 'Failed to load image';
    setErrorMessage(message);
    options.onError?.(message);
  }, [options.onError]);

  const resetImage = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage(null);
  }, []);

  return {
    isLoading,
    hasError,
    errorMessage,
    handleImageLoad,
    handleImageError,
    resetImage,
  };
}
