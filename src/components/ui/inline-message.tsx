'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type MessageType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface InlineMessageProps {
  type?: MessageType;
  title?: string;
  message: string;
  /** Auto-dismiss timeout in milliseconds. Set to 0 to disable auto-dismiss. Default is 0 (no auto-dismiss) */
  timeout?: number;
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
  /** Show close button. Default is true */
  showCloseButton?: boolean;
}

const messageStyles: Record<MessageType, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/30 dark:text-emerald-400',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800/30 dark:text-red-400',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-800/30 dark:text-blue-400',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800/30 dark:text-amber-400',
  loading: 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-950/20 dark:border-slate-800/30 dark:text-slate-400'
};

const iconStyles: Record<MessageType, string> = {
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  warning: 'text-amber-600 dark:text-amber-400',
  loading: 'text-slate-600 dark:text-slate-400'
};

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
  loading: Loader2
};

export function InlineMessage({
  type = 'info',
  title,
  message,
  timeout = 0,
  onDismiss,
  className,
  showIcon = true,
  showCloseButton = true
}: InlineMessageProps) {
  const [isVisible, setIsVisible] = useState(true);
  const IconComponent = icons[type];

  useEffect(() => {
    if (timeout > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onDismiss?.();
        }, 300); // Wait for exit animation
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [timeout, onDismiss]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300); // Wait for exit animation
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-sm',
            messageStyles[type],
            className
          )}
          role="alert"
          aria-live="polite"
        >
          {showIcon && (
            <IconComponent
              className={cn(
                'w-5 h-5 mt-0.5 flex-shrink-0',
                iconStyles[type],
                type === 'loading' && 'animate-spin'
              )}
            />
          )}

          <div className="flex-1 min-w-0">
            {title && <p className="font-semibold mb-1">{title}</p>}
            <p className="text-sm font-medium leading-relaxed">{message}</p>
          </div>

          {showCloseButton && type !== 'loading' && (onDismiss || timeout > 0) && (
            <button
              onClick={handleClose}
              className={cn(
                'flex-shrink-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-offset-1',
                type === 'success' && 'focus:ring-emerald-500',
                type === 'error' && 'focus:ring-red-500',
                type === 'warning' && 'focus:ring-amber-500',
                type === 'info' && 'focus:ring-blue-500'
              )}
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Fixed height version to prevent form expansion
export function FixedHeightMessage({
  type = 'info',
  title,
  message,
  onDismiss,
  className,
  height = 'min-h-[60px]'
}: InlineMessageProps & { height?: string }) {
  const IconComponent = icons[type];

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        height,
        className
      )}
    >
      {message ? (
        <div
          className={cn(
            'flex items-center gap-2 text-sm',
            type === 'success' && 'text-green-600',
            type === 'error' && 'text-red-600',
            type === 'info' && 'text-blue-600',
            type === 'warning' && 'text-yellow-600'
          )}
        >
          {IconComponent && <IconComponent className="w-4 h-4" />}
          <span className="font-medium">{message}</span>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-2 p-1 hover:bg-black/5 rounded transition-colors"
              aria-label="Dismiss message"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        <div className="h-4" />
      )}
    </div>
  );
}
