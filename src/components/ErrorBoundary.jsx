import React from 'react';

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '', stack: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'Unknown error',
      stack: error?.stack || ''
    };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught render error:', error, info);
  }

  handleReset() {
    this.setState({ hasError: false, message: '', stack: '' });
    window.location.hash = '/welcome';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback">
          <div className="error-boundary-card">
            <h2>Something went wrong</h2>
            <p className="error-boundary-msg">
              An unexpected error occurred. Please try returning to the home page.
            </p>
            {isDev && this.state.message && (
              <details className="error-boundary-details">
                <summary>Error details (development only)</summary>
                <pre>{this.state.message}</pre>
                {this.state.stack && <pre>{this.state.stack}</pre>}
              </details>
            )}
            <button
              type="button"
              className="btn"
              onClick={() => this.handleReset()}
            >
              Go to home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
