import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import DigitalCard from './pages/DigitalBusinessCard';
import { HelmetProvider } from 'react-helmet-async';
import './portal/styles/portal.css';

const PortalHomePage = React.lazy(() => import('./portal/templates/PortalHomePage'));
const CategoryHubPage = React.lazy(() => import('./portal/templates/CategoryHubPage'));
const SEOArticlePage = React.lazy(() => import('./portal/templates/SEOArticlePage'));
const ComparisonPage = React.lazy(() => import('./portal/templates/ComparisonPage'));
const OsekPaturLanding = React.lazy(() => import('./pages/OsekPaturLanding'));
const OsekPaturSteps = React.lazy(() => import('./pages/OsekPaturSteps'));
const ThankYou = React.lazy(() => import('./pages/ThankYou'));

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking auth
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        } />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

const PortalWrapper = ({ children }) => (
  <HelmetProvider>
    <Suspense fallback={<PageLoader />}>
      <div dir="rtl" className="portal-root">
        {children}
      </div>
    </Suspense>
  </HelmetProvider>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Standalone public page - completely outside auth & layout */}
      <Route path="/card/:slug" element={<DigitalCard />} />
      <Route path="/DigitalCard" element={<DigitalCard />} />

      {/* Landing pages - standalone (no auth, no portal wrapper) */}
      <Route path="/OsekPaturLanding" element={<Suspense fallback={<PageLoader />}><OsekPaturLanding /></Suspense>} />
      <Route path="/OsekPaturSteps" element={<Suspense fallback={<PageLoader />}><OsekPaturSteps /></Suspense>} />
      <Route path="/ThankYou" element={<Suspense fallback={<PageLoader />}><ThankYou /></Suspense>} />

      {/* Portal public pages */}
      <Route path="/" element={<PortalWrapper><PortalHomePage /></PortalWrapper>} />
      <Route path="/opening-business-israel" element={<PortalWrapper><PortalHomePage /></PortalWrapper>} />
      <Route path="/osek-patur" element={<PortalWrapper><CategoryHubPage category="osek-patur" /></PortalWrapper>} />
      <Route path="/osek-patur/:slug" element={<PortalWrapper><SEOArticlePage category="osek-patur" /></PortalWrapper>} />
      <Route path="/osek-murshe" element={<PortalWrapper><CategoryHubPage category="osek-murshe" /></PortalWrapper>} />
      <Route path="/osek-murshe/:slug" element={<PortalWrapper><SEOArticlePage category="osek-murshe" /></PortalWrapper>} />
      <Route path="/hevra-bam" element={<PortalWrapper><CategoryHubPage category="hevra-bam" /></PortalWrapper>} />
      <Route path="/hevra-bam/:slug" element={<PortalWrapper><SEOArticlePage category="hevra-bam" /></PortalWrapper>} />
      <Route path="/sgirat-tikim" element={<PortalWrapper><CategoryHubPage category="sgirat-tikim" /></PortalWrapper>} />
      <Route path="/sgirat-tikim/:slug" element={<PortalWrapper><SEOArticlePage category="sgirat-tikim" /></PortalWrapper>} />
      <Route path="/guides" element={<PortalWrapper><CategoryHubPage category="guides" /></PortalWrapper>} />
      <Route path="/guides/:slug" element={<PortalWrapper><SEOArticlePage category="guides" /></PortalWrapper>} />
      <Route path="/compare/:slug" element={<PortalWrapper><ComparisonPage /></PortalWrapper>} />

      <Route path="/*" element={<AuthenticatedApp />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App