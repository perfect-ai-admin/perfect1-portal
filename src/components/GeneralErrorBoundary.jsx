import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

class GeneralErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('General Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center bg-gray-50 rounded-xl border border-gray-100 m-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">משהו השתבש</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            נתקלנו בשגיאה לא צפויה. אנחנו עוקבים אחרי תקלות אלו ופועלים לתקן אותן.
          </p>
          <Button 
            onClick={this.handleRetry}
            className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#2C5282] text-white"
          >
            <RefreshCcw className="w-4 h-4" />
            נסה שוב
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GeneralErrorBoundary;