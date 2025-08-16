import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InlineMessageProps {
  type?: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
}

const messageStyles: Record<string, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
};

const iconStyles: Record<string, string> = {
  success: 'text-green-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-yellow-600'
};

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle
};

export function InlineMessage({
  type = 'info',
  title,
  message,
  onDismiss,
  className,
  showIcon = true
}: InlineMessageProps) {
  const IconComponent = icons[type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border text-sm',
        messageStyles[type],
        className
      )}
    >
      {showIcon && (
        <IconComponent
          className={cn('w-4 h-4 mt-0.5 flex-shrink-0', iconStyles[type])}
        />
      )}

      <div className="flex-1 min-w-0">
        {title && <p className="font-medium mb-1">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
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
