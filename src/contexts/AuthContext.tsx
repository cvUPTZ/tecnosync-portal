// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  academy_id: string | null;
  created_at: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  loading: boolean;
  isPlatformAdmin: () => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isDirector: () => boolean;
  hasModuleAccess: (module: string) => boolean;
  getAcademyId: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    console.log('[Auth] provider mounted');

    const initializeAuth = async () => {
      console.log('[Auth] initializeAuth start');
      try {
        setLoading(true);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[Auth] getSession error:', sessionError);
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
          return;
        }

        const currentUser = session?.user ?? null;
        if (mounted) setUser(currentUser);

        if (currentUser && mounted) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', currentUser.id)
              .maybeSingle();

            if (profileError && profileError.code !== 'PGRST116') {
              console.error('[Auth] profile fetch error:', profileError);
              setProfile(null);
            } else {
              setProfile(profileData);
            }
          } catch (profileErr) {
            console.error('[Auth] error fetching profile:', profileErr);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('[Auth] initializeAuth unexpected error:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          console.log('[Auth] initializeAuth done — setting loading=false');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        console.log('[Auth] onAuthStateChange fired:', event, session?.user?.id || 'no-user');

        try {
          const currentUser = session?.user ?? null;
          setUser(currentUser);

          if (currentUser) {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', currentUser.id)
              .maybeSingle();

            if (error && error.code !== 'PGRST116') {
              console.error('[Auth] profile fetch error on auth change:', error);
              setProfile(null);
            } else {
              setProfile(profileData);
            }
          } else {
            setProfile(null);
          }
        } catch (e) {
          console.error("[Auth] error in onAuthStateChange handler:", e);
          setUser(null);
          setProfile(null);
        } finally {
          // ✅ Always clear loading at the end
          console.log('[Auth] onAuthStateChange — setting loading=false');
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
        console.log('[Auth] unsubscribed auth listener');
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // onAuthStateChange will set loading=false
    } catch (error) {
      console.error('[Auth] signIn error:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('[Auth] signOut error:', e);
    } finally {
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const isDirector = () => profile?.role === 'director';
  const isPlatformAdmin = () => profile?.role === 'platform_admin';

  const hasModuleAccess = (module: string) => {
    if (!profile && !isPlatformAdmin()) return false;
    if (isPlatformAdmin()) return true;
    if (isDirector()) {
      const directorModules = [
        'dashboard', 'students', 'registrations', 'attendance',
        'finance', 'website', 'settings'
      ];
      return directorModules.includes(module);
    }
    return false;
  };

  const getAcademyId = () => profile?.academy_id || null;

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    isPlatformAdmin,
    isDirector,
    hasModuleAccess,
    getAcademyId
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
