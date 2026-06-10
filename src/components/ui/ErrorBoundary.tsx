import React, { Component } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
          <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border)] shadow-brutal p-6 max-w-md text-center">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h2 className="text-[var(--text-primary)] text-lg font-semibold mb-2">
              Something went wrong
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              The editor encountered an unexpected error. Please refresh the
              page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[var(--accent)] hover:bg-violet-700 text-white px-4 py-2 text-sm"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-[var(--text-secondary)] cursor-pointer text-xs">
                  Error Details (Dev Mode)
                </summary>
                <pre className="text-red-300 text-xs mt-2 overflow-auto bg-[var(--bg-primary)]">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
