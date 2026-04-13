import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext(null);

// Check if current path needs auth (CRM, login, app pages)
function pathNeedsAuth() {
  const p = window.location.pathname;
  return p.startsWith('/CRM') || p.startsWith('/login') || p.startsWith('/APP')
    || p.startsWith('/Checkout') || p.startsWith('/agent') || p.startsWith('/Admin');
}

export const SupabaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // On portal pages (articles, homepage, calculators) — skip auth check entirely.
    // This saves ~200-500ms network call + avoids loading Supabase auth eagerly.
    // Auth initializes only when user navigates to CRM/login/app routes.
    if (!pathNeedsAuth()) {
      setIsLoadingAuth(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      }
      setIsLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        setIsLoadingAuth(false);
        if (event === 'SIGNED_OUT') setAuthError(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = useCallback(async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) window.location.href = '/login';
  }, []);

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signup = useCallback(async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: metadata }
    });
    if (error) throw error;
    return data;
  }, []);

  const loginWithOAuth = useCallback(async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) throw error;
    return data;
  }, []);

  const navigateToLogin = useCallback(() => {
    window.location.href = '/login?returnTo=%2FAPP';
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const { data, error } = await supabase.auth.updateUser({ data: updates });
    if (error) throw error;
    setUser(data.user);
    return data.user;
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoadingAuth, authError,
      logout, login, signup, loginWithOAuth, navigateToLogin, updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within SupabaseAuthProvider');
  return context;
};

// Safe version — returns defaults when outside AuthProvider (e.g. portal domain)
export const useAuthSafe = () => {
  const context = useContext(AuthContext);
  return context || { isAuthenticated: false, isLoadingAuth: false, user: null, session: null };
};

export default AuthContext;
