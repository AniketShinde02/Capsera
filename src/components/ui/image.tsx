'use client';

import { useState } from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { ImageIcon } from 'lucide-react';

interface ImageProps extends Omit<NextImageProps, 'onError' | 'onLoad'> {
  fallback?: React.ReactNode;
  showError?: boolean;
  onError?: (error: string) => void;
  onLoad?: () => void;
}

export function Image({
  src,
  alt,
  fallback,
  showError = true,
  onError,
  onLoad,
  className,
  ...props
}: ImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.(`Failed to load image: ${src}`);
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // If there's an error and we have a fallback, show it
  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  // If there's an error and no fallback, show error state
  if (hasError && showError) {
    return (
      <div className={`flex items-center justify-center bg-muted/20 ${className}`}>
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Image failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <NextImage
        src={src}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
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
