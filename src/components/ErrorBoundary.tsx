'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Wrench } from 'lucide-react';
import { 
  isWebpackModuleError, 
  getWebpackErrorHelp, 
  attemptModuleRecovery,
  forceHardRefresh,
  getWebpackDebugInfo 
} from '@/lib/module-cache-utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  isRecovering: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isRecovering: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isRecovering: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to console for debugging
    console.group('🚨 Error Boundary Error Details');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    
    // Log webpack debug info if it's a webpack error
    if (isWebpackModuleError(error)) {
      console.log('🔧 Webpack Debug Info:', getWebpackDebugInfo());
    }
    
    console.groupEnd();
  }

  handleRefresh = () => {
    this.setState({ isRecovering: true });
    
    // Try to recover from webpack errors first
    if (this.state.error && isWebpackModuleError(this.state.error)) {
      attemptModuleRecovery().then((recovered) => {
        if (recovered) {
          console.log('✅ Module recovery successful, refreshing...');
          window.location.reload();
        } else {
          console.log('❌ Module recovery failed, forcing hard refresh...');
          forceHardRefresh();
        }
      });
    } else {
      // For non-webpack errors, just reload
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  handleForceRefresh = () => {
    this.setState({ isRecovering: true });
    forceHardRefresh();
  };

  render() {
    if (this.state.hasError) {
      // Check if it's the specific webpack error we're targeting
      const isWebpackError = this.state.error && isWebpackModuleError(this.state.error);
      
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {isWebpackError ? 'Module Loading Error' : 'Something went wrong'}
              </h1>
              
              <p className="text-muted-foreground">
                {isWebpackError 
                  ? getWebpackErrorHelp(this.state.error!)
                  : 'An unexpected error occurred. Please try again.'
                }
              </p>
            </div>

            {isWebpackError && (
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-medium mb-2">💡 Quick Fix:</p>
                <p>This error often occurs due to cached modules. Try the recovery options below.</p>
              </div>
            )}

            <div className="flex flex-col gap-3 justify-center">
              <Button 
                onClick={this.handleRefresh}
                className="flex items-center gap-2"
                disabled={this.state.isRecovering}
              >
                <RefreshCw className={`w-4 h-4 ${this.state.isRecovering ? 'animate-spin' : ''}`} />
                {this.state.isRecovering ? 'Recovering...' : 'Try Recovery'}
              </Button>
              
              {isWebpackError && (
                <Button 
                  onClick={this.handleForceRefresh}
                  className="flex items-center gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={this.state.isRecovering}
                >
                  <Wrench className="w-4 h-4" />
                  Force Hard Refresh
                </Button>
              )}
              
              <Button 
                onClick={this.handleGoHome}
                className="flex items-center gap-2 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
                disabled={this.state.isRecovering}
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-muted/30 rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-sm">
                  Error Details (Development)
                </summary>
                <div className="mt-2 text-xs font-mono text-muted-foreground space-y-1">
                  <p><strong>Type:</strong> {isWebpackError ? 'Webpack Module Error' : 'General Error'}</p>
                  <p><strong>Message:</strong> {this.state.error.message}</p>
                  <p><strong>Stack:</strong></p>
                  <pre className="whitespace-pre-wrap break-words">
                    {this.state.error.stack}
                  </pre>
                  
                  {isWebpackError && (
                    <div className="mt-2 p-2 bg-background rounded border">
                      <p><strong>Webpack Info:</strong></p>
                      <pre className="text-xs">
                        {JSON.stringify(getWebpackDebugInfo(), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
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
    
    // You can add error reporting logic here
    // Example: Sentry.captureException(error);
    
    // For webpack errors, suggest recovery
    if (isWebpackModuleError(error)) {
      console.warn('💡 This appears to be a webpack module error. Try using the recovery options.');
      console.log('🔧 Webpack Debug Info:', getWebpackDebugInfo());
    }
  };

  return { handleError };
}
