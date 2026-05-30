import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <h2>Oops, something went wrong.</h2>
          <p>Please refresh the page.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem' }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
