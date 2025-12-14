import { toast } from 'sonner';

type Severity = 'success' | 'info' | 'warning' | 'error';

interface NotifyOptions {
    description?: string;
    duration?: number;
}

/**
 * Centralized notification system for Capsera.
 * Unified entry point for all user-facing feedback.
 * 
 * @param severity - 'success' | 'info' | 'warning' | 'error'
 * @param message - Short, human-readable title (e.g., "Image uploaded")
 * @param options - Optional description or duration
 */
export function notify(severity: Severity, message: string, options?: NotifyOptions) {
    // Prevent empty messages
    if (!message) return;

    const toastOptions = {
        description: options?.description,
        duration: options?.duration || 4000,
    };

    switch (severity) {
        case 'success':
            toast.success(message, toastOptions);
            break;
        case 'info':
            toast.info(message, toastOptions);
            break;
        case 'warning':
            toast.warning(message, toastOptions);
            break;
        case 'error':
            toast.error(message, toastOptions);
            break;
    }
}

/**
 * Helper to map API errors to user notifications.
 * Extracts the message and code to determine severity.
 */
export function notifyApiError(error: any) {
    if (!error) return;

    // Default fallback
    let severity: Severity = 'error';
    let message = 'Something went wrong';
    let description = 'Please try again later.';

    // Structured API Error
    if (error.message && typeof error.message === 'string') {
        message = error.message;
    }

    // Handle specific error codes if available (e.g. from rate limiting)
    if (error.code) {
        if (['LIMIT_REACHED', 'RATE_LIMIT'].includes(error.code)) {
            severity = 'warning'; // User can wait
        }
    }

    // Handle specific error strings (legacy)
    if (message.toLowerCase().includes('limit')) severity = 'warning';
    if (message.toLowerCase().includes('files too large')) severity = 'warning';

    notify(severity, message, { description });
}
