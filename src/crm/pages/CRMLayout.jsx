import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Columns3, Users, ListTodo, Settings, ChevronRight, ChevronLeft,
  Bell, Menu, X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/supabaseClient';

const NAV_ITEMS = [
  { to: '/CRM', label: 'Pipeline', icon: Columns3, exact: true },
  { to: '/CRM/leads', label: 'לידים', icon: Users },
  { to: '/CRM/dashboard', label: 'דשבורד', icon: LayoutDashboard },
  { to: '/CRM/tasks', label: 'משימות', icon: ListTodo },
  { to: '/CRM/settings', label: 'הגדרות', icon: Settings },
];

export default function CRMLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const { data: notifications = [] } = useQuery({
    queryKey: ['crm-notifications-unread'],
    queryFn: async () => {
      const all = await entities.Notification.list('-created_at', 50);
      return all.filter(n => !n.is_read);
    },
    refetchInterval: 30000,
  });

  const unreadCount = notifications.length;

  const SidebarContent = () => (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = item.exact
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to);

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
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        );
      })}
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
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </Button>
            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
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
