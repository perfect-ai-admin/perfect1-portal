import React, { Suspense, createContext, useContext, useState } from 'react';

// Shared auth context — used by both stub and real providers
export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoadingAuth: false,
  authError: null,
  logout: async () => {},
  login: async () => {},
  signup: async () => {},
  loginWithOAuth: async () => {},
  navigateToLogin: () => { window.location.href = '/login'; },
  updateProfile: async () => {},
});

// Hook that works with both stub and real context — NO supabase import
export function useAuthFromContext() {
  return useContext(AuthContext);
}

// Check if current path needs real auth (loads Supabase SDK)
function pathNeedsAuth() {
  const p = window.location.pathname;
  return p.startsWith('/CRM') || p.startsWith('/login') || p.startsWith('/APP')
    || p.startsWith('/Checkout') || p.startsWith('/agent') || p.startsWith('/Admin');
}

// Lazy-load the real AuthProvider only when needed
const RealAuthProvider = React.lazy(() =>
  import('@/lib/SupabaseAuthContext').then(mod => ({
    default: mod.SupabaseAuthProvider
  }))
);

export function LazyAuthProvider({ children }) {
  if (!pathNeedsAuth()) {
    // Portal pages — provide stub context, don't load Supabase (saves 194KB)
    return (
      <AuthContext.Provider value={{
        user: null,
        isAuthenticated: false,
        isLoadingAuth: false,
        authError: null,
        logout: async () => {},
        login: async () => {},
        signup: async () => {},
        loginWithOAuth: async () => {},
        navigateToLogin: () => { window.location.href = '/login'; },
        updateProfile: async () => {},
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  // CRM/Login/App pages — load real AuthProvider with Supabase
  return (
    <Suspense fallback={
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '4px solid #e2e8f0', borderTop: '4px solid #1e293b', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <RealAuthProvider>{children}</RealAuthProvider>
    </Suspense>
  );
}
