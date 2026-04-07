import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { SupabaseAuthProvider as AuthProvider, useAuth } from '@/lib/SupabaseAuthContext';

// Retry wrapper for lazy imports — handles stale chunk errors after deploy
function lazyWithRetry(importFn) {
  return React.lazy(() =>
    importFn().catch(() => {
      // Chunk failed to load (likely stale after deploy) — reload once
      const key = 'chunk_reload';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
      }
      return importFn();
    })
  );
}

// Dynamic route pages
const GoalPage = lazyWithRetry(() => import('@/pages/GoalPage'));
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import DigitalCard from './pages/DigitalBusinessCard';
import { HelmetProvider } from 'react-helmet-async';
import './portal/styles/portal.css';
import { isClientSubdomain } from '@/utils/subdomain';
import { isPortalDomain, isAppDomain, isLocalDev } from '@/utils/domain';

// Lazy-load SubdomainPage — only loaded when accessing a client subdomain
const SubdomainPage = lazyWithRetry(() => import('@/pages/SubdomainPage'));

const PortalHomePage = lazyWithRetry(() => import('./portal/templates/PortalHomePage'));
const CategoryHubPage = lazyWithRetry(() => import('./portal/templates/CategoryHubPage'));
const SEOArticlePage = lazyWithRetry(() => import('./portal/templates/SEOArticlePage'));
const ComparisonPage = lazyWithRetry(() => import('./portal/templates/ComparisonPage'));
const OsekPaturLanding = lazyWithRetry(() => import('./pages/OsekPaturLanding'));
const OsekPaturSteps = lazyWithRetry(() => import('./pages/OsekPaturSteps'));
const OpenOsekPatur = lazyWithRetry(() => import('./pages/OpenOsekPatur'));
const ThankYou = lazyWithRetry(() => import('./pages/ThankYou'));
const PaturVsMursheLanding = lazyWithRetry(() => import('./pages/PaturVsMursheLanding'));
const PaturVsMursheQuiz = lazyWithRetry(() => import('./pages/PaturVsMursheQuiz'));
const AccountantLanding = lazyWithRetry(() => import('./pages/AccountantLanding'));

// Blog articles (portal-only)
const BlogLogoArticle = lazyWithRetry(() => import('./pages/blog/LogoArticle'));
const BlogDigitalCardArticle = lazyWithRetry(() => import('./pages/blog/DigitalCardArticle'));
const BlogLandingPageArticle = lazyWithRetry(() => import('./pages/blog/LandingPageArticle'));
const BlogPresentationArticle = lazyWithRetry(() => import('./pages/blog/PresentationArticle'));
const BlogInvestorDeckArticle = lazyWithRetry(() => import('./pages/blog/InvestorDeckArticle'));
const BlogStickerArticle = lazyWithRetry(() => import('./pages/blog/StickerArticle'));

// Shared public pages (available on both domains)
const About = lazyWithRetry(() => import('./pages/About'));
const Privacy = lazyWithRetry(() => import('./pages/Privacy'));
const Terms = lazyWithRetry(() => import('./pages/Terms'));
const Login = lazyWithRetry(() => import('./pages/Login'));

// CRM Pages
const CRMLayout = lazyWithRetry(() => import('./crm/pages/CRMLayout'));
const CRMPipeline = lazyWithRetry(() => import('./crm/pages/CRMPipeline'));
const CRMLeadDetail = lazyWithRetry(() => import('./crm/pages/CRMLeadDetail'));
const CRMLeads = lazyWithRetry(() => import('./crm/pages/CRMLeads'));
const CRMDashboard = lazyWithRetry(() => import('./crm/pages/CRMDashboard'));
const CRMTasks = lazyWithRetry(() => import('./crm/pages/CRMTasks'));
const CRMSettings = lazyWithRetry(() => import('./crm/pages/CRMSettings'));

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
        <Route path="/goal/:goalCode" element={
          <LayoutWrapper currentPageName="GoalPage">
            <GoalPage />
          </LayoutWrapper>
        } />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

const PortalWrapper = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    <div dir="rtl" className="portal-root">
      {children}
    </div>
  </Suspense>
);

// Portal-only routes (perfect1.co.il)
const PortalRoutes = () => (
  <Routes>
    {/* Landing pages */}
    <Route path="/OsekPaturLanding" element={<Suspense fallback={<PageLoader />}><OsekPaturLanding /></Suspense>} />
    <Route path="/OsekPaturSteps" element={<Suspense fallback={<PageLoader />}><OsekPaturSteps /></Suspense>} />
    <Route path="/open-osek-patur" element={<Suspense fallback={<PageLoader />}><OpenOsekPatur /></Suspense>} />
    <Route path="/patur-vs-murshe" element={<Suspense fallback={<PageLoader />}><PaturVsMursheLanding /></Suspense>} />
    <Route path="/patur-vs-murshe-quiz" element={<Suspense fallback={<PageLoader />}><PaturVsMursheQuiz /></Suspense>} />
    <Route path="/accountant-osek-patur" element={<Suspense fallback={<PageLoader />}><AccountantLanding /></Suspense>} />
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

    {/* Shared public pages */}
    <Route path="/About" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
    <Route path="/Terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />
    <Route path="/Privacy" element={<Suspense fallback={<PageLoader />}><Privacy /></Suspense>} />

    {/* Login — needed for CRM auth redirect */}
    <Route path="/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />

    {/* CRM Routes — protected by auth inside CRMLayout */}
    <Route path="/CRM" element={<Suspense fallback={<PageLoader />}><CRMLayout /></Suspense>}>
      <Route index element={<CRMPipeline />} />
      <Route path="leads" element={<CRMLeads />} />
      <Route path="leads/:id" element={<CRMLeadDetail />} />
      <Route path="dashboard" element={<CRMDashboard />} />
      <Route path="tasks" element={<CRMTasks />} />
      <Route path="settings" element={<CRMSettings />} />
    </Route>

    {/* Blog articles (portal-only) */}
    <Route path="/blog/logo-leasek" element={<Suspense fallback={<PageLoader />}><BlogLogoArticle /></Suspense>} />
    <Route path="/blog/kartis-bikur-digitali" element={<Suspense fallback={<PageLoader />}><BlogDigitalCardArticle /></Suspense>} />
    <Route path="/blog/daf-nchita" element={<Suspense fallback={<PageLoader />}><BlogLandingPageArticle /></Suspense>} />
    <Route path="/blog/matzget-iskit" element={<Suspense fallback={<PageLoader />}><BlogPresentationArticle /></Suspense>} />
    <Route path="/blog/matzget-mashkiim" element={<Suspense fallback={<PageLoader />}><BlogInvestorDeckArticle /></Suspense>} />
    <Route path="/blog/sticker-leasek" element={<Suspense fallback={<PageLoader />}><BlogStickerArticle /></Suspense>} />

    {/* 404 — no product pages on portal */}
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

// App-only routes (perfect-dashboard.com)
const AppOnlyRoutes = () => (
  <Routes>
    {/* Digital card — public */}
    <Route path="/card/:slug" element={<DigitalCard />} />
    <Route path="/DigitalCard" element={<DigitalCard />} />

    {/* CRM Routes — protected by auth inside CRMLayout */}
    <Route path="/CRM" element={<Suspense fallback={<PageLoader />}><CRMLayout /></Suspense>}>
      <Route index element={<CRMPipeline />} />
      <Route path="leads" element={<CRMLeads />} />
      <Route path="leads/:id" element={<CRMLeadDetail />} />
      <Route path="dashboard" element={<CRMDashboard />} />
      <Route path="tasks" element={<CRMTasks />} />
      <Route path="settings" element={<CRMSettings />} />
    </Route>

    {/* All other app routes (login, APP, pages, etc.) */}
    <Route path="/*" element={<AuthenticatedApp />} />
  </Routes>
);

// Localhost — all routes available for development
const DevRoutes = () => (
  <Routes>
    {/* Digital card — public */}
    <Route path="/card/:slug" element={<DigitalCard />} />
    <Route path="/DigitalCard" element={<DigitalCard />} />

    {/* Landing pages */}
    <Route path="/OsekPaturLanding" element={<Suspense fallback={<PageLoader />}><OsekPaturLanding /></Suspense>} />
    <Route path="/OsekPaturSteps" element={<Suspense fallback={<PageLoader />}><OsekPaturSteps /></Suspense>} />
    <Route path="/open-osek-patur" element={<Suspense fallback={<PageLoader />}><OpenOsekPatur /></Suspense>} />
    <Route path="/patur-vs-murshe" element={<Suspense fallback={<PageLoader />}><PaturVsMursheLanding /></Suspense>} />
    <Route path="/patur-vs-murshe-quiz" element={<Suspense fallback={<PageLoader />}><PaturVsMursheQuiz /></Suspense>} />
    <Route path="/accountant-osek-patur" element={<Suspense fallback={<PageLoader />}><AccountantLanding /></Suspense>} />
    <Route path="/ThankYou" element={<Suspense fallback={<PageLoader />}><ThankYou /></Suspense>} />

    {/* Portal public pages */}
    <Route path="/portal" element={<PortalWrapper><PortalHomePage /></PortalWrapper>} />
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

    {/* CRM Routes */}
    <Route path="/CRM" element={<Suspense fallback={<PageLoader />}><CRMLayout /></Suspense>}>
      <Route index element={<CRMPipeline />} />
      <Route path="leads" element={<CRMLeads />} />
      <Route path="leads/:id" element={<CRMLeadDetail />} />
      <Route path="dashboard" element={<CRMDashboard />} />
      <Route path="tasks" element={<CRMTasks />} />
      <Route path="settings" element={<CRMSettings />} />
    </Route>

    {/* App routes (login, APP, etc.) */}
    <Route path="/*" element={<AuthenticatedApp />} />
  </Routes>
);

const AppRoutes = () => {
  // Portal domain (perfect1.co.il) — only portal/SEO routes
  if (isPortalDomain()) return <PortalRoutes />;

  // App domain (perfect-dashboard.com) — only app/CRM routes
  if (isAppDomain()) return <AppOnlyRoutes />;

  // Localhost — everything available for development
  return <DevRoutes />;
};


function App() {
  // If we're on a client subdomain (e.g., studio-dana.one-pai.com),
  // render only the SubdomainPage — skip auth, layout, and normal routing.
  if (isClientSubdomain()) {
    return (
      <QueryClientProvider client={queryClientInstance}>
        <Suspense fallback={<PageLoader />}>
          <SubdomainPage />
        </Suspense>
        <Toaster />
      </QueryClientProvider>
    );
  }

  return (
    <HelmetProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <NavigationTracker />
            <AppRoutes />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App