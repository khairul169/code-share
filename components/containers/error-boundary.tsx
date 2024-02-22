import React from "react";

type ErrorBoundaryProps = {
  fallback?: React.ReactNode;
  children?: React.ReactNode;
};

type ErrorBoundaryState = {
  error?: Error | null;
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  render() {
    const { children, fallback } = this.props;
    const { error } = this.state;

    if (error) {
      if (!fallback) {
        return (
          <div className="p-4 text-sm">
            <p>An error occured!</p>
          </div>
        );
      }

      return fallback;
    }

    return children;
  }
}

export default ErrorBoundary;
