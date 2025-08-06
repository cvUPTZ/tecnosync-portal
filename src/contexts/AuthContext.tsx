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
  isPlatformAdmin: boolean; // Changed from function to boolean
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
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to check platform admin status
  const checkPlatformAdminStatus = async (userId: string) => {
    try {
      const { data: platformAdmin, error } = await supabase
        .from('platform_admins')
        .select('*')
        .eq('id', userId)
        .single();

      return !error && !!platformAdmin;
    } catch (error) {
      console.error('Error checking platform admin status:', error);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Check platform admin status
          const platformAdminStatus = await checkPlatformAdminStatus(currentUser.id);
          setIsPlatformAdmin(platformAdminStatus);

          // Fetch profile
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error);
            setProfile(null);
          } else {
            setProfile(profileData);
          }
        } else {
          setProfile(null);
          setIsPlatformAdmin(false);
        }
      } catch (e) {
        console.error("Error in initAuth:", e);
        setUser(null);
        setProfile(null);
        setIsPlatformAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setLoading(true);
          const currentUser = session?.user ?? null;
          setUser(currentUser);

          if (currentUser) {
            // Check platform admin status
            const platformAdminStatus = await checkPlatformAdminStatus(currentUser.id);
            setIsPlatformAdmin(platformAdminStatus);

            // Fetch profile
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', currentUser.id)
              .single();

            if (error && error.code !== 'PGRST116') {
              console.error('Error fetching profile on auth change:', error);
              setProfile(null);
            } else {
              setProfile(profileData);
            }
          } else {
            setProfile(null);
            setIsPlatformAdmin(false);
          }
        } catch (e) {
          console.error("Error in onAuthStateChange handler:", e);
          setUser(null);
          setProfile(null);
          setIsPlatformAdmin(false);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      throw error;
    }
    // Auth state change will handle the rest
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsPlatformAdmin(false);
  };

  const isDirector = () => {
    return profile?.role === 'director';
  };

  const hasModuleAccess = (module: string) => {
    if (!profile && !isPlatformAdmin) return false;
    
    // Platform admin has access to all modules
    if (isPlatformAdmin) return true;
    
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
    isPlatformAdmin, // Now a boolean, not a function
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
