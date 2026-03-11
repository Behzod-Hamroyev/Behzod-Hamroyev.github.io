import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  handleReset() {
    this.setState({ hasError: false, message: '' });
    window.location.hash = '/welcome';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback">
          <div className="error-boundary-card">
            <h2>Something went wrong</h2>
            <p className="error-boundary-msg">{this.state.message}</p>
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
