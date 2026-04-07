/**
 * pages.config.js - Page routing configuration
 *
 * Application pages + landing pages.
 */

import React from 'react';

// Retry wrapper for lazy imports — handles stale chunk errors after deploy
function lazyRetry(importFn) {
  return React.lazy(() =>
    importFn().catch(() => {
      const key = 'chunk_reload';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
      }
      return importFn();
    })
  );
}

// --- Landing / public pages (static imports — very lightweight) ---
import Home from './pages/Home';
import S from './pages/S';
import Features from './pages/Features';

// --- Landing / public pages (lazy — medium/heavy) ---
const AdminUsers = lazyRetry(() => import('./pages/AdminUsers'));
const AiMentor = lazyRetry(() => import('./pages/AiMentor'));
const AvatarAi = lazyRetry(() => import('./pages/AvatarAi'));
const BrandedLandingPage = lazyRetry(() => import('./pages/BrandedLandingPage'));
const BrandedQuote = lazyRetry(() => import('./pages/BrandedQuote'));
const Branding = lazyRetry(() => import('./pages/Branding'));
const BusinessPresentation = lazyRetry(() => import('./pages/BusinessPresentation'));
const BusinessSticker = lazyRetry(() => import('./pages/BusinessSticker'));
const DigitalBusinessCard = lazyRetry(() => import('./pages/DigitalBusinessCard'));
const FAQ = lazyRetry(() => import('./pages/FAQ'));
const Goal = lazyRetry(() => import('./pages/Goal'));
const Pricing = lazyRetry(() => import('./pages/Pricing'));
const SmartLogo = lazyRetry(() => import('./pages/SmartLogo'));
const SocialDesigns = lazyRetry(() => import('./pages/SocialDesigns'));
// Portal-only pages (About, Privacy, Terms, Blog, OsekPatur) — served via PortalRoutes in App.jsx

// --- Application pages (static imports — lightweight) ---
import Login from './pages/Login';
import AgentLogin from './pages/AgentLogin';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import InviteUser from './pages/InviteUser';
import LogoThankYou from './pages/LogoThankYou';
import PricingPerfectBizAI from './pages/PricingPerfectBizAI';

// --- Application pages (lazy — heavy, loaded on demand) ---
const AdminDashboard = lazyRetry(() => import('./pages/AdminDashboard'));
const AgentCRM = lazyRetry(() => import('./pages/AgentCRM'));
const AgentsManager = lazyRetry(() => import('./pages/AgentsManager'));
const ClientDashboard = lazyRetry(() => import('./pages/ClientDashboard'));
const CloseOsekPaturCRM = lazyRetry(() => import('./pages/CloseOsekPaturCRM'));
const CreditsPage = lazyRetry(() => import('./pages/CreditsPage'));
const GoalPage = lazyRetry(() => import('./pages/GoalPage'));
const JourneyDashboard = lazyRetry(() => import('./pages/JourneyDashboard'));
const LandingPageManager = lazyRetry(() => import('./pages/LandingPageManager'));
const LandingPagePreview = lazyRetry(() => import('./pages/LandingPagePreview'));
const LeadsAdmin = lazyRetry(() => import('./pages/LeadsAdmin'));
const LogoProjectPage = lazyRetry(() => import('./pages/LogoProjectPage'));
const MyProducts = lazyRetry(() => import('./pages/MyProducts'));
const Summary = lazyRetry(() => import('./pages/Summary'));


import __Layout from './Layout.jsx';


export const PAGES = {
    // App pages (perfect-dashboard.com only)
    "AdminUsers": AdminUsers,
    "AiMentor": AiMentor,
    "AvatarAi": AvatarAi,
    "BrandedLandingPage": BrandedLandingPage,
    "BrandedQuote": BrandedQuote,
    "Branding": Branding,
    "BusinessPresentation": BusinessPresentation,
    "BusinessSticker": BusinessSticker,
    "DigitalBusinessCard": DigitalBusinessCard,
    "FAQ": FAQ,
    "Features": Features,
    "Goal": Goal,
    "Home": Home,
    "Pricing": Pricing,
    "S": S,
    "SmartLogo": SmartLogo,
    "SocialDesigns": SocialDesigns,
    // Application pages
    "login": Login,
    "AdminDashboard": AdminDashboard,
    "AgentCRM": AgentCRM,
    "AgentLogin": AgentLogin,
    "AgentsManager": AgentsManager,
    "Checkout": Checkout,
    "CheckoutSuccess": CheckoutSuccess,
    "APP": ClientDashboard,
    "CloseOsekPaturCRM": CloseOsekPaturCRM,
    "CreditsPage": CreditsPage,
    "GoalPage": GoalPage,
    "InviteUser": InviteUser,
    "JourneyDashboard": JourneyDashboard,
    "LandingPageManager": LandingPageManager,
    "LandingPagePreview": LandingPagePreview,
    "LeadsAdmin": LeadsAdmin,
    "LogoProjectPage": LogoProjectPage,
    "LogoThankYou": LogoThankYou,
    "MyProducts": MyProducts,
    "PricingPerfectBizAI": PricingPerfectBizAI,
    "Summary": Summary,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
