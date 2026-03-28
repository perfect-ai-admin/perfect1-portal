/**
 * pages.config.js - Page routing configuration
 *
 * Application pages + landing pages.
 */

import React from 'react';

// --- Landing / public pages (static imports — very lightweight) ---
import Home from './pages/Home';
import S from './pages/S';
import Features from './pages/Features';

// --- Landing / public pages (lazy — medium/heavy) ---
const AdminUsers = React.lazy(() => import('./pages/AdminUsers'));
const AiMentor = React.lazy(() => import('./pages/AiMentor'));
const AvatarAi = React.lazy(() => import('./pages/AvatarAi'));
const BrandedLandingPage = React.lazy(() => import('./pages/BrandedLandingPage'));
const BrandedQuote = React.lazy(() => import('./pages/BrandedQuote'));
const Branding = React.lazy(() => import('./pages/Branding'));
const BusinessPresentation = React.lazy(() => import('./pages/BusinessPresentation'));
const BusinessSticker = React.lazy(() => import('./pages/BusinessSticker'));
const DigitalBusinessCard = React.lazy(() => import('./pages/DigitalBusinessCard'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const Goal = React.lazy(() => import('./pages/Goal'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const SmartLogo = React.lazy(() => import('./pages/SmartLogo'));
const SocialDesigns = React.lazy(() => import('./pages/SocialDesigns'));
const Terms = React.lazy(() => import('./pages/Terms'));

// --- Application pages (static imports — lightweight) ---
import Login from './pages/Login';
import AgentLogin from './pages/AgentLogin';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import InviteUser from './pages/InviteUser';
import LogoThankYou from './pages/LogoThankYou';
import PricingPerfectBizAI from './pages/PricingPerfectBizAI';

// --- Application pages (lazy — heavy, loaded on demand) ---
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AgentCRM = React.lazy(() => import('./pages/AgentCRM'));
const AgentsManager = React.lazy(() => import('./pages/AgentsManager'));
const ClientDashboard = React.lazy(() => import('./pages/ClientDashboard'));
const CloseOsekPaturCRM = React.lazy(() => import('./pages/CloseOsekPaturCRM'));
const CreditsPage = React.lazy(() => import('./pages/CreditsPage'));
const GoalPage = React.lazy(() => import('./pages/GoalPage'));
const JourneyDashboard = React.lazy(() => import('./pages/JourneyDashboard'));
const LandingPageManager = React.lazy(() => import('./pages/LandingPageManager'));
const LandingPagePreview = React.lazy(() => import('./pages/LandingPagePreview'));
const LeadsAdmin = React.lazy(() => import('./pages/LeadsAdmin'));
const LogoProjectPage = React.lazy(() => import('./pages/LogoProjectPage'));
const MyProducts = React.lazy(() => import('./pages/MyProducts'));
const Summary = React.lazy(() => import('./pages/Summary'));


import __Layout from './Layout.jsx';


export const PAGES = {
    // Landing / public pages
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
    "Privacy": Privacy,
    "S": S,
    "SmartLogo": SmartLogo,
    "SocialDesigns": SocialDesigns,
    "Terms": Terms,
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
