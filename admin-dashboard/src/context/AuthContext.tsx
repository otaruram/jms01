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
        if (error?.response?.status !== 401) {
          console.error('Failed to fetch user role', error);
        } else {
          // Silent catch for 401
          await supabase.auth.signOut();
          if (window.location.pathname !== '/login') {
             window.location.href = '/login';
          }
        }
        if (mounted) setUser(null);
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
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (mounted) setLoading(true);
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
