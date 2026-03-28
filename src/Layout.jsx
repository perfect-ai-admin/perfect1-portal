import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { supabase } from '@/api/supabaseClient';

import ClientFooter from './components/client/ClientFooter';
import CriticalCSS from './components/performance/CriticalCSS';
import ResourceHints from './components/performance/ResourceHints';
import WebVitalsMonitor from './components/performance/WebVitalsMonitor';
import { Toaster } from "@/components/ui/sonner";

// Public / landing pages — no auth required
const PUBLIC_PAGES = [
    'Home', 'Pricing', 'Features', 'FAQ', 'Terms', 'Privacy', 'S',
    'AiMentor', 'AvatarAi', 'BrandedLandingPage', 'BrandedQuote',
    'Branding', 'BusinessPresentation', 'BusinessSticker',
    'DigitalBusinessCard', 'SmartLogo', 'SocialDesigns', 'Goal',
    'login',
];

// Standalone pages — rendered without any layout wrapper
const STANDALONE_PAGES = ['LandingPagePreview'];

export default function Layout({ children, currentPageName }) {
    const location = useLocation();
    const isPublic = PUBLIC_PAGES.includes(currentPageName);
    const [isCheckingAuth, setIsCheckingAuth] = useState(!isPublic);

    // Auth check for private (app) pages only
    useEffect(() => {
      if (isPublic) return;
      const checkAuth = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            window.location.href = '/login?redirect=' + encodeURIComponent(location.pathname);
            return;
          }
        } catch (err) {
          console.log('Auth check failed');
        } finally {
          setIsCheckingAuth(false);
        }
      };
      checkAuth();
    }, [location.pathname, isPublic]);

    useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, [location.pathname, location.search]);

    // Standalone pages — no wrapper at all
    if (STANDALONE_PAGES.includes(currentPageName)) {
      return children;
    }

    // Public / landing pages — lightweight wrapper with fonts, no auth gate
    if (isPublic) {
      return (
        <HelmetProvider>
        <div dir="rtl">
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
            :root {
              --font-sans: 'Assistant', sans-serif;
              --font-heading: 'Assistant', sans-serif;
              --font-number: 'Inter', sans-serif;
            }
            * { font-family: var(--font-sans); }
            h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); letter-spacing: -0.02em; }
            .font-number { font-family: var(--font-number); }
            html { scroll-behavior: smooth; overflow-x: hidden; }
            body { overflow-x: hidden; width: 100%; position: relative; }
            [dir="rtl"] { text-align: right; }
          `}</style>
          {children}
          <Toaster />
        </div>
        </HelmetProvider>
      );
    }

    // App pages — wait for auth, show full app layout
    if (isCheckingAuth) {
      return null;
    }

    return (
      <HelmetProvider>
        <CriticalCSS />
        <ResourceHints priorityImages={['/logo.png']} />
        <WebVitalsMonitor />

        <div className="min-h-screen bg-[#F8F9FA] w-screen overflow-x-hidden" dir="rtl">
          <main className="w-full overflow-x-hidden">
            {children}
          </main>
          <div className="hidden md:block">
            <ClientFooter />
          </div>
        </div>
        <Toaster />
      </HelmetProvider>
    );
}
