import React from 'react';

class DebugErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('=== ERROR CAUGHT BY BOUNDARY ===');
    console.error('Error:', error.message);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Full Error:', error);
    console.trace('RovingFocus crash trace');
    
    // Extract useful info
    if (error.message?.includes('RovingFocus')) {
      console.warn('🔴 ROVING FOCUS ERROR DETECTED');
      console.warn('Check the component stack above for the culprit component');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fee', border: '2px solid red' }}>
          <h2>❌ Error Boundary Caught Error</h2>
          <p><strong>Error:</strong> {this.state.error?.message}</p>
          <details style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '400px' }}>
            <summary>Stack Trace</summary>
            {this.state.error?.stack}
          </details>
          <p style={{ marginTop: '10px', color: 'red', fontWeight: 'bold' }}>
            Check browser console for full component stack
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DebugErrorBoundary;