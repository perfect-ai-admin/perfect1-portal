import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Columns3, Users, ListTodo, Settings, ChevronRight, ChevronLeft,
  Bell, Menu, X, LogOut, CreditCard, AlertTriangle,
  Globe, Users2, Mail, Inbox, FileText, Activity, Send
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { entities, supabase } from '@/api/supabaseClient';
import { useOpenAlertCount } from '../hooks/useCRM';
import { useOutreachUnreadReplies } from '../hooks/useOutreach';

const NAV_ITEMS = [
  { to: '/CRM', label: 'לידים', icon: Users, exact: true },
  { to: '/CRM/dashboard', label: 'דשבורד', icon: LayoutDashboard },
  { to: '/CRM/tasks', label: 'משימות', icon: ListTodo },
  { to: '/CRM/subscriptions', label: 'מנויים', icon: CreditCard },
  { to: '/CRM/billing-alerts', label: 'התראות בילינג', icon: AlertTriangle, badgeKey: 'billingAlerts' },
  { to: '/CRM/settings', label: 'הגדרות', icon: Settings },
];

const OUTREACH_NAV_ITEMS = [
  { to: '/CRM/outreach', label: 'סקירה', icon: Activity, exact: true },
  { to: '/CRM/outreach/websites', label: 'אתרים', icon: Globe },
  { to: '/CRM/outreach/contacts', label: 'אנשי קשר', icon: Users2 },
  { to: '/CRM/outreach/campaigns', label: 'קמפיינים', icon: Send },
  { to: '/CRM/outreach/inbox', label: 'תיבת דואר', icon: Inbox, badgeKey: 'outreachReplies' },
  { to: '/CRM/outreach/templates', label: 'תבניות', icon: FileText },
  { to: '/CRM/outreach/domain-health', label: 'בריאות דומיין', icon: Mail },
];

export default function CRMLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const mainRef = useRef(null);

  // Scroll main content to top on route change
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);
  const navigate = useNavigate();

  // Auth check — redirect to login if not authenticated.
  // Hardened: handles getSession() rejection (corrupt JWT from old deploy, network blip,
  // etc.) so the spinner never leaks into an infinite "מתחבר למערכת..." state.
  // Also enforces a 5s safety timeout — if Supabase hangs we redirect to login instead
  // of showing a frozen page.
  useEffect(() => {
    let cancelled = false;
    let initialAuthDone = false;

    // Safety net: if nothing resolves within 5s, force redirect to login.
    const safetyTimer = setTimeout(() => {
      if (!cancelled && !initialAuthDone) {
        // eslint-disable-next-line no-console
        console.warn('[CRMLayout] auth check timed out — redirecting to login');
        navigate('/login?returnTo=/CRM', { replace: true });
      }
    }, 5000);

    // Initial auth check — runs once on mount via getSession().
    // Only this path redirects to login when unauthenticated.
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return;
        initialAuthDone = true;
        clearTimeout(safetyTimer);
        if (!session) {
          navigate('/login?returnTo=/CRM', { replace: true });
        } else {
          setUser(session.user);
          setAuthChecked(true);
        }
      })
      .catch((err) => {
        // Corrupt token, network error, or project-mismatch — clear and bounce to login.
        // eslint-disable-next-line no-console
        console.error('[CRMLayout] getSession failed:', err);
        try { supabase.auth.signOut(); } catch {}
        if (!cancelled) {
          initialAuthDone = true;
          clearTimeout(safetyTimer);
          navigate('/login?returnTo=/CRM', { replace: true });
        }
      });

    // onAuthStateChange — only handles explicit SIGNED_OUT after initial auth.
    // Does NOT redirect on null session from TOKEN_REFRESHED or INITIAL_SESSION
    // events, which can momentarily fire with null before the token is ready.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'SIGNED_OUT') {
        navigate('/login?returnTo=/CRM', { replace: true });
        return;
      }
      // Update user when token is refreshed or session changes
      if (session?.user) {
        setUser(session.user);
        if (!initialAuthDone) {
          // Race: auth state arrived before getSession resolved
          initialAuthDone = true;
          clearTimeout(safetyTimer);
          setAuthChecked(true);
        }
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [navigate]);

  const { data: notifications = [] } = useQuery({
    queryKey: ['crm-notifications-unread'],
    queryFn: async () => {
      const all = await entities.Notification.list('-created_at', 50);
      return all.filter(n => !n.is_read);
    },
    refetchInterval: 30000,
    enabled: authChecked,
  });

  const unreadCount = notifications.length;

  // Must be called before any conditional return (Rules of Hooks)
  const { data: openAlertCount } = useOpenAlertCount();
  const { data: outreachReplyCount } = useOutreachUnreadReplies();

  if (!authChecked) {
    return (
      <div dir="rtl" className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">מתחבר למערכת...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const badgeCounts = {
    billingAlerts: openAlertCount || 0,
    outreachReplies: outreachReplyCount || 0,
  };

  const renderNavItems = (items) =>
    items.map(item => {
      const Icon = item.icon;
      const isActive = item.exact
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to);
      const badge = item.badgeKey && badgeCounts[item.badgeKey] > 0 ? badgeCounts[item.badgeKey] : null;

      return (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
            isActive
              ? 'bg-[#1E3A5F] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Icon size={18} />
          {sidebarOpen && <span className="flex-1">{item.label}</span>}
          {sidebarOpen && badge && (
            <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{badge}</span>
          )}
        </NavLink>
      );
    });

  const SidebarContent = () => (
    <nav className="flex flex-col gap-1 p-3">
      {renderNavItems(NAV_ITEMS)}
      <div className="my-2 border-t border-slate-200" />
      {sidebarOpen && (
        <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Outreach</div>
      )}
      {renderNavItems(OUTREACH_NAV_ITEMS)}
    </nav>
  );

  return (
    <div dir="rtl" className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-l border-slate-200 bg-white transition-all duration-200 ${
          sidebarOpen ? 'w-56' : 'w-16'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          {sidebarOpen && (
            <h1 className="text-lg font-bold text-[#1E3A5F]">CRM</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8"
          >
            {sidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-lg font-bold text-[#1E3A5F]">CRM</h1>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X size={18} />
              </Button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile menu button only */}
        <div className="md:hidden flex items-center px-4 py-2 bg-white border-b border-slate-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </Button>
        </div>

        {/* Page Content */}
        <main ref={mainRef} className="flex-1 overflow-auto p-3 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);

  const labels = {
    CRM: 'CRM',
    leads: 'לידים',
    dashboard: 'דשבורד',
    tasks: 'משימות',
    settings: 'הגדרות',
    clients: 'לקוחות',
  };

  return (
    <div className="flex items-center gap-1 text-sm text-slate-500">
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronLeft size={14} className="mx-1" />}
          <span className={i === parts.length - 1 ? 'text-slate-900 font-medium' : ''}>
            {labels[part] || part}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
