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
  const [initialized, setInitialized] = useState(false);

  const logLoading = (msg: string, value: boolean) => {
    console.log(`[AuthContext] ${msg} → loading =`, value);
    setLoading(value);
  };

  const fetchProfile = async (uid: string) => {
    console.log(`[AuthContext] Fetching profile for user_id=${uid}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`user_id.eq.${uid},id.eq.${uid}`)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('[AuthContext] Error fetching profile:', error);
      return null;
    }
    console.log('[AuthContext] Profile fetched:', data);
    return data;
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log('[AuthContext] Initializing auth...');
      logLoading('initial load start', true);

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('[AuthContext] getSession result:', { session, sessionError });

        if (sessionError) {
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
          return;
        }

        const currentUser = session?.user ?? null;
        if (mounted) {
          setUser(currentUser);
          console.log('[AuthContext] User set from getSession:', currentUser);
        }

        if (currentUser && mounted) {
          const profileData = await fetchProfile(currentUser.id);
          if (mounted) setProfile(profileData);
        } else if (mounted) {
          setProfile(null);
        }
      } catch (err) {
        console.error('[AuthContext] Error initializing auth:', err);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          logLoading('initial load end', false);
          setInitialized(true);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[AuthContext] onAuthStateChange event: ${event}`, session);

      if (!initialized) {
        logLoading('auth change before init', true);
      } else {
        console.log('[AuthContext] Already initialized → NOT setting loading=true');
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      console.log('[AuthContext] User set from auth change:', currentUser);

      if (currentUser) {
        setTimeout(async () => {
          const profileData = await fetchProfile(currentUser.id);
          setProfile(profileData);
        }, 0);
      } else {
        setProfile(null);
      }

      // End loading immediately; profile fetch continues in background
      logLoading('auth change end', false);
    });

    // After listener is set up, perform initial session check
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove initialized from dependencies to prevent infinite loop

  const signIn = async (email: string, password: string) => {
    logLoading('signIn start', true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      logLoading('signIn end', false);
    }
  };

  const signOut = async () => {
    logLoading('signOut start', true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } finally {
      logLoading('signOut end', false);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signOut,
        isPlatformAdmin,
        isDirector,
        hasModuleAccess,
        getAcademyId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
