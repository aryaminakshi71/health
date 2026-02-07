import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@healthcare-saas/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { extra: errorInfo });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Something went wrong</h2>
            <p>We encountered an unexpected error. Please try again.</p>
            <p className="error-message">{this.state.error?.message}</p>
            <Button onClick={this.handleRetry} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function createErrorFallback(error: Error, retry?: () => void) {
  return (
    <div className="error-fallback">
      <h3>Error loading content</h3>
      <p>{error.message}</p>
      {retry && (
        <Button onClick={retry} variant="outline">
          Retry
        </Button>
      )}
    </div>
  );
}

export class AsyncErrorBoundary extends Component<Props & { loading: ReactNode }, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AsyncErrorBoundary caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="async-error">
          <h3>Failed to load data</h3>
          <p>{this.state.error?.message}</p>
          <Button onClick={() => this.setState({ hasError: false, error: null })} variant="primary">
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
