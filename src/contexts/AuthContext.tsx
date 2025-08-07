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
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          const currentUser = session?.user ?? null;
          setUser(currentUser);

          if (currentUser) {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', currentUser.id)
              .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is not an error in this case
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
  };

  const isDirector = () => {
    return profile?.role === 'director';
  };

  const isPlatformAdmin = () => {
    // Check if user exists in platform_admins table through profile role
    // The database RLS policies will enforce proper access control
    return profile?.role === 'platform_admin' || user?.user_metadata?.role === 'platform_admin';
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
