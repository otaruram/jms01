import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import api from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isReadOnly: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isSuperAdmin: false,
  isAdmin: false,
  isReadOnly: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUserRole = async (session: any) => {
      if (!session || !session.access_token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await api.get('/auth/me');

        if (response.data.success) {
          if (mounted) setUser(response.data.data);
        } else {
          if (mounted) setUser(null);
        }
      } catch (error: any) {
        if (error?.response?.status === 401) {
          // Hanya logout jika token benar-benar ditolak (401)
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } catch (e) {}
          // Force clear storage if signOut fails
          localStorage.clear();
          sessionStorage.clear();
          if (window.location.pathname !== '/login') {
             window.location.href = '/login';
          }
          if (mounted) setUser(null);
        } else {
          // Jika 500 atau 403, JANGAN keluarkan user, biarkan session tetap ada
          // Tapi kita bisa set default role sementara agar tidak crash
          console.error('Failed to fetch user role, but keeping session active:', error);
          if (mounted && !user) {
             setUser({
               id: session.user.id,
               email: session.user.email || '',
               name: session.user.user_metadata?.full_name || 'User',
               role: 'USER' // Fallback role if backend is unreachable
             });
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchUserRole(session);
        } else {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        }
      } catch (e) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Only show loading screen for initial sign in, not token refresh
        if (mounted && !user) setLoading(true);
        fetchUserRole(session);
      } else if (event === 'TOKEN_REFRESHED') {
        // Token refreshed in background, just update the role silently without unmounting the app
        fetchUserRole(session);
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    isReadOnly: user?.role === 'USER' || !user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
