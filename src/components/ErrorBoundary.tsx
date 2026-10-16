import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('SiteSentinel Uncaught Component Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6 text-slate-800">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto mb-4">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              The SiteSentinel interface encountered an unexpected rendering error. You can recover by resetting the view or reloading.
            </p>
            {this.state.error && (
              <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-200 mb-6 font-mono text-[11px] text-rose-700 overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
              >
                Dismiss & Retry
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
