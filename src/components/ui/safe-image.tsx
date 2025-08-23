'use client';

import { useState, useEffect } from 'react';
import { ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface SafeImageProps {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  className?: string;
  onError?: (error: string) => void;
  onLoad?: () => void;
  retryCount?: number;
  maxRetries?: number;
}

export function SafeImage({
  src,
  alt,
  fallback,
  className = '',
  onError,
  onLoad,
  retryCount = 0,
  maxRetries = 2,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRetry, setCurrentRetry] = useState(retryCount);

  useEffect(() => {
    // Reset state when src changes
    setHasError(false);
    setIsLoading(true);
    setCurrentRetry(retryCount);
  }, [src, retryCount]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    console.error('❌ Image failed to load:', src);
    
    if (currentRetry < maxRetries) {
      // Retry loading the image
      setCurrentRetry(prev => prev + 1);
      setIsLoading(true);
      setHasError(false);
      
      // Force reload by changing the src slightly
      const img = new window.Image();
      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = `${src}?retry=${currentRetry + 1}&t=${Date.now()}`;
    } else {
      // Max retries reached, show error
      setIsLoading(false);
      setHasError(true);
      onError?.(`Failed to load image after ${maxRetries} attempts`);
    }
  };

  const handleRetry = () => {
    setCurrentRetry(0);
    setIsLoading(true);
    setHasError(false);
    
    // Force reload
    const img = new window.Image();
    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = `${src}?retry=0&t=${Date.now()}`;
  };

  // Show fallback if provided and there's an error
  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  // Show error state if no fallback
  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-muted/20 ${className}`}>
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">Image failed to load</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className="w-full h-full object-cover"
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
