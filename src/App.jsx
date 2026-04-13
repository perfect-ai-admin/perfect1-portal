import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import GeneralErrorBoundary from '@/components/GeneralErrorBoundary';
import { SupabaseAuthProvider as AuthProvider, useAuth } from '@/lib/SupabaseAuthContext';

// Retry wrapper for lazy imports — handles stale chunk errors after deploy
function lazyWithRetry(importFn, retries = 2) {
  return React.lazy(() => {
    const attempt = (remaining) =>
      importFn().catch((err) => {
        if (remaining > 0) {
          // Wait briefly then retry (new chunk URL might work)
          return new Promise((r) => setTimeout(r, 500)).then(() => attempt(remaining - 1));
        }
        // All retries failed — reload page once to get fresh HTML with new chunk URLs
        const key = 'chunk_reload';
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          window.location.reload();
        }
        // If we already reloaded and it still fails, show a fallback module
        return { default: () => React.createElement(ChunkErrorFallback) };
      });
    // Clear reload flag on successful load
    return attempt(retries).then((mod) => {
      sessionStorage.removeItem('chunk_reload');
      return mod;
    });
  });
}

// Fallback component shown when chunk loading fails even after retries + reload
function ChunkErrorFallback() {
  return React.createElement('div', {
    dir: 'rtl',
    style: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Heebo, sans-serif', padding: '2rem', textAlign: 'center' }
  },
    React.createElement('h2', { style: { fontSize: '1.5rem', marginBottom: '1rem', color: '#1E3A5F' } }, 'הדף לא נטען כראוי'),
    React.createElement('p', { style: { color: '#666', marginBottom: '1.5rem' } }, 'ייתכן שהתבצע עדכון לאתר. נסו לרענן את הדף.'),
    React.createElement('button', {
      onClick: () => { sessionStorage.removeItem('chunk_reload'); window.location.reload(); },
      style: { padding: '12px 32px', background: '#1E3A5F', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }
    }, 'רענון הדף')
  );
}

// Dynamic route pages
const GoalPage = lazyWithRetry(() => import('@/pages/GoalPage'));
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
const DigitalCard = lazyWithRetry(() => import('./pages/DigitalBusinessCard'));
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
const CalculatorsPage = lazyWithRetry(() => import('./portal/templates/CalculatorsPage'));
const NetIncomeCalcPage = lazyWithRetry(() => import('./portal/templates/NetIncomeCalcPage'));
const CreditPointsCalcPage = lazyWithRetry(() => import('./portal/templates/CreditPointsCalcPage'));
const OsekPaturLanding = lazyWithRetry(() => import('./pages/OsekPaturLanding'));
const OsekPaturSteps = lazyWithRetry(() => import('./pages/OsekPaturSteps'));
const OpenOsekPatur = lazyWithRetry(() => import('./pages/OpenOsekPatur'));
const ThankYou = lazyWithRetry(() => import('./pages/ThankYou'));
const PaturVsMursheLanding = lazyWithRetry(() => import('./pages/PaturVsMursheLanding'));
const PaturVsMursheQuiz = lazyWithRetry(() => import('./pages/PaturVsMursheQuiz'));
const AccountantLanding = lazyWithRetry(() => import('./pages/AccountantLanding'));
const OpenOsekPaturOnline = lazyWithRetry(() => import('./pages/OpenOsekPaturOnline'));
// עוסק זעיר — מסלול נפרד לחלוטין מעוסק פטור. שני עמודים ייעודיים עם קופי משלהם.
const OsekZeirLanding = lazyWithRetry(() => import('./pages/OsekZeirLanding'));
const OpenOsekZeirOnline = lazyWithRetry(() => import('./pages/OpenOsekZeirOnline'));

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
const AccessibilityPage = lazyWithRetry(() => import('./pages/Accessibility'));

// Legal & Accessibility components
const CookieConsent = lazyWithRetry(() => import('@/components/legal/CookieConsent'));
const AccessibilityWidget = lazyWithRetry(() => import('@/components/legal/AccessibilityWidget'));

// CRM Pages
const CRMLayout = lazyWithRetry(() => import('./crm/pages/CRMLayout'));
const CRMPipeline = lazyWithRetry(() => import('./crm/pages/CRMPipeline'));
const CRMLeadDetail = lazyWithRetry(() => import('./crm/pages/CRMLeadDetail'));
const CRMLeads = lazyWithRetry(() => import('./crm/pages/CRMLeads'));
const CRMDashboard = lazyWithRetry(() => import('./crm/pages/CRMDashboard'));
const CRMTasks = lazyWithRetry(() => import('./crm/pages/CRMTasks'));
const CRMSettings = lazyWithRetry(() => import('./crm/pages/CRMSettings'));
const CRMSubscriptions = lazyWithRetry(() => import('./crm/pages/CRMSubscriptions'));

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

// Safe wrapper: Error Boundary + Suspense for every lazy-loaded route
const SafePage = ({ children }) => (
  <GeneralErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </GeneralErrorBoundary>
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
  <GeneralErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <div dir="rtl" className="portal-root">
        {children}
      </div>
    </Suspense>
  </GeneralErrorBoundary>
);

// Portal-only routes (perfect1.co.il)
const PortalRoutes = () => (
  <Routes>
    {/* Landing pages */}
    <Route path="/OsekPaturLanding" element={<SafePage><OsekPaturLanding /></SafePage>} />
    <Route path="/OsekPaturSteps" element={<SafePage><OsekPaturSteps /></SafePage>} />
    <Route path="/open-osek-patur" element={<SafePage><OpenOsekPatur /></SafePage>} />
    <Route path="/patur-vs-murshe" element={<SafePage><PaturVsMursheLanding /></SafePage>} />
    <Route path="/patur-vs-murshe-quiz" element={<SafePage><PaturVsMursheQuiz /></SafePage>} />
    <Route path="/accountant-osek-patur" element={<SafePage><AccountantLanding /></SafePage>} />
    <Route path="/open-osek-patur-online" element={<SafePage><OpenOsekPaturOnline /></SafePage>} />
    {/* Osek Zeir — מסלול נפרד לחלוטין. חייב להישאר מנותק מעוסק פטור בכל המסרים */}
    <Route path="/OsekZeirLanding" element={<SafePage><OsekZeirLanding /></SafePage>} />
    <Route path="/osek-zair-landing" element={<SafePage><OsekZeirLanding /></SafePage>} />
    <Route path="/open-osek-zeir-online" element={<SafePage><OpenOsekZeirOnline /></SafePage>} />
    <Route path="/open-osek-zair-online" element={<SafePage><OpenOsekZeirOnline /></SafePage>} />
    <Route path="/ThankYou" element={<SafePage><ThankYou /></SafePage>} />

    {/* Portal public pages */}
    <Route path="/" element={<PortalWrapper><PortalHomePage /></PortalWrapper>} />
    <Route path="/opening-business-israel" element={<PortalWrapper><PortalHomePage /></PortalWrapper>} />
    <Route path="/osek-patur" element={<PortalWrapper><CategoryHubPage category="osek-patur" /></PortalWrapper>} />
    <Route path="/osek-patur/:slug" element={<PortalWrapper><SEOArticlePage category="osek-patur" /></PortalWrapper>} />
    <Route path="/osek-murshe" element={<PortalWrapper><CategoryHubPage category="osek-murshe" /></PortalWrapper>} />
    <Route path="/osek-murshe/:slug" element={<PortalWrapper><SEOArticlePage category="osek-murshe" /></PortalWrapper>} />
    <Route path="/hevra-bam" element={<PortalWrapper><CategoryHubPage category="hevra-bam" /></PortalWrapper>} />
    <Route path="/hevra-bam/:slug" element={<PortalWrapper><SEOArticlePage category="hevra-bam" /></PortalWrapper>} />
    <Route path="/osek-zeir" element={<PortalWrapper><CategoryHubPage category="osek-zeir" /></PortalWrapper>} />
    <Route path="/osek-zeir/:slug" element={<PortalWrapper><SEOArticlePage category="osek-zeir" /></PortalWrapper>} />
    <Route path="/sgirat-tikim" element={<PortalWrapper><CategoryHubPage category="sgirat-tikim" /></PortalWrapper>} />
    <Route path="/sgirat-tikim/:slug" element={<PortalWrapper><SEOArticlePage category="sgirat-tikim" /></PortalWrapper>} />
    <Route path="/guides" element={<PortalWrapper><CategoryHubPage category="guides" /></PortalWrapper>} />
    <Route path="/guides/:slug" element={<PortalWrapper><SEOArticlePage category="guides" /></PortalWrapper>} />
    <Route path="/compare/:slug" element={<PortalWrapper><ComparisonPage /></PortalWrapper>} />
    <Route path="/calculators" element={<PortalWrapper><CalculatorsPage /></PortalWrapper>} />
    <Route path="/calculators/net-income" element={<PortalWrapper><NetIncomeCalcPage /></PortalWrapper>} />
    <Route path="/calculators/credit-points" element={<PortalWrapper><CreditPointsCalcPage /></PortalWrapper>} />

    {/* Shared public pages */}
    <Route path="/About" element={<SafePage><About /></SafePage>} />
    <Route path="/Terms" element={<SafePage><Terms /></SafePage>} />
    <Route path="/Privacy" element={<SafePage><Privacy /></SafePage>} />
    <Route path="/Accessibility" element={<SafePage><AccessibilityPage /></SafePage>} />

    {/* Login — needed for CRM auth redirect */}
    <Route path="/login" element={<SafePage><Login /></SafePage>} />

    {/* CRM Routes — protected by auth inside CRMLayout */}
    <Route path="/CRM" element={<SafePage><CRMLayout /></SafePage>}>
      <Route index element={<CRMLeads />} />
      <Route path="leads" element={<CRMLeads />} />
      <Route path="leads/:id" element={<CRMLeadDetail />} />
      <Route path="dashboard" element={<CRMDashboard />} />
      <Route path="tasks" element={<CRMTasks />} />
      <Route path="subscriptions" element={<CRMSubscriptions />} />
      <Route path="settings" element={<CRMSettings />} />
    </Route>

    {/* Blog articles (portal-only) */}
    <Route path="/blog/logo-leasek" element={<SafePage><BlogLogoArticle /></SafePage>} />
    <Route path="/blog/kartis-bikur-digitali" element={<SafePage><BlogDigitalCardArticle /></SafePage>} />
    <Route path="/blog/daf-nchita" element={<SafePage><BlogLandingPageArticle /></SafePage>} />
    <Route path="/blog/matzget-iskit" element={<SafePage><BlogPresentationArticle /></SafePage>} />
    <Route path="/blog/matzget-mashkiim" element={<SafePage><BlogInvestorDeckArticle /></SafePage>} />
    <Route path="/blog/sticker-leasek" element={<SafePage><BlogStickerArticle /></SafePage>} />

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
    <Route path="/CRM" element={<SafePage><CRMLayout /></SafePage>}>
      <Route index element={<CRMLeads />} />
      <Route path="leads" element={<CRMLeads />} />
      <Route path="leads/:id" element={<CRMLeadDetail />} />
      <Route path="dashboard" element={<CRMDashboard />} />
      <Route path="tasks" element={<CRMTasks />} />
      <Route path="subscriptions" element={<CRMSubscriptions />} />
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
    <Route path="/OsekPaturLanding" element={<SafePage><OsekPaturLanding /></SafePage>} />
    <Route path="/OsekPaturSteps" element={<SafePage><OsekPaturSteps /></SafePage>} />
    <Route path="/open-osek-patur" element={<SafePage><OpenOsekPatur /></SafePage>} />
    <Route path="/patur-vs-murshe" element={<SafePage><PaturVsMursheLanding /></SafePage>} />
    <Route path="/patur-vs-murshe-quiz" element={<SafePage><PaturVsMursheQuiz /></SafePage>} />
    <Route path="/accountant-osek-patur" element={<SafePage><AccountantLanding /></SafePage>} />
    <Route path="/open-osek-patur-online" element={<SafePage><OpenOsekPaturOnline /></SafePage>} />
    {/* Osek Zeir — מסלול נפרד לחלוטין (Dev) */}
    <Route path="/OsekZeirLanding" element={<SafePage><OsekZeirLanding /></SafePage>} />
    <Route path="/osek-zair-landing" element={<SafePage><OsekZeirLanding /></SafePage>} />
    <Route path="/open-osek-zeir-online" element={<SafePage><OpenOsekZeirOnline /></SafePage>} />
    <Route path="/open-osek-zair-online" element={<SafePage><OpenOsekZeirOnline /></SafePage>} />
    <Route path="/ThankYou" element={<SafePage><ThankYou /></SafePage>} />

    {/* Portal public pages */}
    <Route path="/portal" element={<PortalWrapper><PortalHomePage /></PortalWrapper>} />
    <Route path="/opening-business-israel" element={<PortalWrapper><PortalHomePage /></PortalWrapper>} />
    <Route path="/osek-patur" element={<PortalWrapper><CategoryHubPage category="osek-patur" /></PortalWrapper>} />
    <Route path="/osek-patur/:slug" element={<PortalWrapper><SEOArticlePage category="osek-patur" /></PortalWrapper>} />
    <Route path="/osek-murshe" element={<PortalWrapper><CategoryHubPage category="osek-murshe" /></PortalWrapper>} />
    <Route path="/osek-murshe/:slug" element={<PortalWrapper><SEOArticlePage category="osek-murshe" /></PortalWrapper>} />
    <Route path="/hevra-bam" element={<PortalWrapper><CategoryHubPage category="hevra-bam" /></PortalWrapper>} />
    <Route path="/hevra-bam/:slug" element={<PortalWrapper><SEOArticlePage category="hevra-bam" /></PortalWrapper>} />
    <Route path="/osek-zeir" element={<PortalWrapper><CategoryHubPage category="osek-zeir" /></PortalWrapper>} />
    <Route path="/osek-zeir/:slug" element={<PortalWrapper><SEOArticlePage category="osek-zeir" /></PortalWrapper>} />
    <Route path="/sgirat-tikim" element={<PortalWrapper><CategoryHubPage category="sgirat-tikim" /></PortalWrapper>} />
    <Route path="/sgirat-tikim/:slug" element={<PortalWrapper><SEOArticlePage category="sgirat-tikim" /></PortalWrapper>} />
    <Route path="/guides" element={<PortalWrapper><CategoryHubPage category="guides" /></PortalWrapper>} />
    <Route path="/guides/:slug" element={<PortalWrapper><SEOArticlePage category="guides" /></PortalWrapper>} />
    <Route path="/compare/:slug" element={<PortalWrapper><ComparisonPage /></PortalWrapper>} />
    <Route path="/calculators" element={<PortalWrapper><CalculatorsPage /></PortalWrapper>} />
    <Route path="/calculators/net-income" element={<PortalWrapper><NetIncomeCalcPage /></PortalWrapper>} />
    <Route path="/calculators/credit-points" element={<PortalWrapper><CreditPointsCalcPage /></PortalWrapper>} />

    {/* CRM Routes */}
    <Route path="/CRM" element={<SafePage><CRMLayout /></SafePage>}>
      <Route index element={<CRMLeads />} />
      <Route path="leads" element={<CRMLeads />} />
      <Route path="leads/:id" element={<CRMLeadDetail />} />
      <Route path="dashboard" element={<CRMDashboard />} />
      <Route path="tasks" element={<CRMTasks />} />
      <Route path="subscriptions" element={<CRMSubscriptions />} />
      <Route path="settings" element={<CRMSettings />} />
    </Route>

    {/* Shared public pages */}
    <Route path="/Accessibility" element={<SafePage><AccessibilityPage /></SafePage>} />

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
          <CookieConsent />
          <AccessibilityWidget />
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App