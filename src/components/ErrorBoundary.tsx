'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Log error for monitoring in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Production error caught by ErrorBoundary:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Development mode: Show error details and recovery option
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
              <h2 className="text-xl font-bold text-red-600 mb-4">
                🚨 Development Error
              </h2>
              <p className="text-gray-700 mb-4">
                An error occurred: <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {this.state.error?.message}
                </code>
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    this.setState({ hasError: false });
                    // Reset error state to allow retry
                  }}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  🔄 Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  🔄 Reload Page
                </button>
              </div>
            </div>
          </div>
        );
      }
      
      // Production mode: Show generic error
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  const handleError = (error: Error, errorInfo?: any) => {
    console.error('Component error caught:', error, errorInfo);
  };

  return { handleError };
}
