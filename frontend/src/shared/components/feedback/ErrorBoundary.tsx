import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error Boundary catch:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-5 text-rose-400">
            <AlertOctagon size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Something went wrong</h2>
          <p className="text-slate-400 max-w-md text-sm mt-2 mb-6">
            An unhandled runtime exception occurred in the component hierarchy.
            {this.state.error?.message && (
              <code className="block mt-3 p-3 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-rose-400 text-left overflow-x-auto">
                {this.state.error.message}
              </code>
            )}
          </p>
          <Button variant="primary" leftIcon={<RefreshCw size={16} />} onClick={this.handleReset}>
            Reload Application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
