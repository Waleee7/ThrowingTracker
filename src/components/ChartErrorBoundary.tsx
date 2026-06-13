'use client';

import React from 'react';

interface Props {
  /** Short label for the fallback message, e.g. "progress chart". */
  label?: string;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render errors inside chart components (Recharts + canvas) so a
 * malformed session record degrades to a quiet fallback card instead of
 * white-screening the whole page. Charts are the only surfaces that do
 * heavy derived math over user data, which makes them the most likely
 * place for a bad record to detonate.
 */
export default class ChartErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Chart render error:', error);
  }

  handleRetry = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <div className="chart-error-fallback" role="alert">
          <span className="chart-error-text">
            Couldn&apos;t draw the {this.props.label ?? 'chart'}. Your data is safe — this is a display problem.
          </span>
          <button type="button" className="secondary-button chart-error-retry" onClick={this.handleRetry}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
