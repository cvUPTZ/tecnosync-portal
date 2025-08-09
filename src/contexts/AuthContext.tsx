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

    const initializeAuth = async () => {
      try {
        setLoading(true);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
          return;
        }

        const currentUser = session?.user ?? null;
        if (mounted) setUser(currentUser);

        if (currentUser && mounted) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError);
            if (mounted) setProfile(null);
          } else if (mounted) {
            setProfile(profileData);
          }
        } else if (mounted) {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false); // ✅ always clear loading
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

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
              console.error('Error fetching profile on auth change:', error);
              setProfile(null);
            } else {
              setProfile(profileData);
            }
          } else {
            setProfile(null);
          }
        } catch (e) {
          console.error('Error in onAuthStateChange handler:', e);
          setUser(null);
          setProfile(null);
        } finally {
          if (mounted) setLoading(false); // ✅ always clear loading
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      // Let onAuthStateChange handle user/profile, but ensure we clear loading if it doesn't fire
      setTimeout(() => setLoading(false), 3000);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false); // ✅ prevent stuck loading after logout
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

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signOut,
      isPlatformAdmin,
      isDirector,
      hasModuleAccess,
      getAcademyId
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
