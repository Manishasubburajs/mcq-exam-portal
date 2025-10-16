'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class HydrationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a hydration error
    if (error.message?.includes('Hydration failed') ||
        error.message?.includes('hydration')) {
      console.warn('Hydration error caught by boundary:', error.message);
      return { hasError: true, error };
    }
    return { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('HydrationErrorBoundary caught an error:', error, errorInfo);

    // If it's a hydration error, we can try to recover by forcing a client-side render
    if (error.message?.includes('Hydration failed')) {
      console.log('Attempting to recover from hydration error...');
      // Force re-render on client side only
      if (typeof window !== 'undefined') {
        this.setState({ hasError: false, error: undefined });
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI for hydration errors
      return this.props.fallback || (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h2>Content Loading...</h2>
          <p>There was an issue loading the content. Please wait while we fix this.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}