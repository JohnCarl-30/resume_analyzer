import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[${this.props.label ?? "ErrorBoundary"}]`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[color:var(--page-line)] bg-white p-6 text-center">
          <p className="text-sm font-semibold text-[color:var(--page-text)]">
            Something went wrong
          </p>
          <p className="mt-1 text-xs text-[color:var(--page-muted)]">
            {this.props.label ? `Failed to load ${this.props.label}` : "This section encountered an error."}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-3 rounded-lg border border-[color:var(--page-line)] bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
