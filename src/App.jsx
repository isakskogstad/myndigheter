import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ToastProvider } from './components/ui/Toast';
import SplashScreen from './components/ui/SplashScreen';
import { useAgencyDataWithProgress } from './hooks/useAgencyData';

// Lazy load the main application
const MyndigheterV6 = React.lazy(() => import('./MyndigheterApp'));

// Loading component for view transitions (not initial load)
const ViewLoader = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="text-center">
      <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
      <p className="text-slate-500 dark:text-slate-400 font-medium">Laddar...</p>
    </div>
  </div>
);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 max-w-2xl mx-auto font-sans">
          <h1 className="text-red-600 text-2xl font-bold mb-4">Något gick fel</h1>
          <p className="mb-4 text-slate-700">Ett fel uppstod vid laddning av applikationen.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ladda om sidan
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const { data, rawData, loading, error, progress, status, refresh, cacheInfo } = useAgencyDataWithProgress();
  const [showSplash, setShowSplash] = useState(true);
  const [splashComplete, setSplashComplete] = useState(false);

  // Handle splash screen completion
  const handleSplashComplete = useCallback(() => {
    setSplashComplete(true);
  }, []);

  // Determine if we should hide splash (data loaded + minimum display time)
  const isDataReady = !loading && data && !error;
  const shouldHideSplash = isDataReady && progress >= 100;

  // Hide splash after a brief delay when data is ready
  useEffect(() => {
    if (shouldHideSplash && showSplash) {
      const timer = setTimeout(() => setShowSplash(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shouldHideSplash, showSplash]);

  return (
    <ErrorBoundary>
      <ToastProvider>
        {/* Splash Screen with progress */}
        <SplashScreen
          progress={progress}
          status={status}
          isComplete={shouldHideSplash && !showSplash}
          onComplete={handleSplashComplete}
        />

        {/* Main app - render when splash is done */}
        {(splashComplete || !showSplash) && (
          <Suspense fallback={<ViewLoader />}>
            <MyndigheterV6
              initialData={data}
              initialRawData={rawData}
              onRefresh={refresh}
              cacheInfo={cacheInfo}
            />
          </Suspense>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center bg-slate-900/90">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 max-w-md mx-4 shadow-2xl">
              <h2 className="text-xl font-bold text-red-600 mb-4">Kunde inte ladda data</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">{error}</p>
              <button
                onClick={refresh}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Försök igen
              </button>
            </div>
          </div>
        )}
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
