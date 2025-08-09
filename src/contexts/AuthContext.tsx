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
        
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        const currentUser = session?.user ?? null;
        
        if (mounted) {
          setUser(currentUser);
        }

        if (currentUser && mounted) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', currentUser.id)
              .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no profile exists

            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Error fetching profile:', profileError);
            }
            
            if (mounted) {
              setProfile(profileData);
            }
          } catch (profileErr) {
            console.error('Error in profile fetch:', profileErr);
            if (mounted) {
              setProfile(null);
            }
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
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth state
    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
          console.error("Error in onAuthStateChange handler:", e);
          setUser(null);
          setProfile(null);
        } finally {
          // Always set loading to false after auth state change
          if (mounted) {
            setLoading(false);
          }
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
      if (error) {
        setLoading(false);
        throw error;
      }
      // Auth state change will handle setting loading to false
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const isDirector = () => {
    return profile?.role === 'director';
  };

  const isPlatformAdmin = () => {
    // SECURITY FIX: Only check database profile, never trust user metadata
    // User metadata can be manipulated, only database profiles are authoritative
    return profile?.role === 'platform_admin';
  };

  const hasModuleAccess = (module: string) => {
    if (!profile && !isPlatformAdmin()) return false;
    
    // Platform admin has access to all modules
    if (isPlatformAdmin()) return true;
    
    // Director has access to certain modules
    if (isDirector()) {
      const directorModules = [
        'dashboard', 'students', 'registrations', 'attendance', 
        'finance', 'website', 'settings'
      ];
      return directorModules.includes(module);
    }
    
    return false;
  };

  const getAcademyId = () => {
    return profile?.academy_id || null;
  };

  const value = {
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
