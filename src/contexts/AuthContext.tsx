import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Academy {
  id: string;
  name: string;
  modules: Record<string, boolean>;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'director' | 'comptabilite_chief' | 'coach' | 'parent' | 'platform_admin';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  academy_id?: string;
  academies?: Academy; // This will hold the joined academy data
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isPlatformAdmin: () => boolean;
  isModuleEnabled: (moduleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      // Step 1: Fetch the basic profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      if (!profileData) {
        console.log('No profile found for user:', userId);
        return null;
      }

      let academyData = null;
      // Step 2: If profile has an academy_id, fetch the academy details
      if (profileData.academy_id) {
        const { data: fetchedAcademyData, error: academyError } = await supabase
          .from('academies')
          .select('*')
          .eq('id', profileData.academy_id)
          .single();

        if (academyError) {
          console.error('Error fetching academy details:', academyError);
          // Don't fail the whole profile load, just the academy part
        } else {
          academyData = fetchedAcademyData;
        }
      }

      // Step 3: Combine the data
      const fullProfile: Profile = {
        ...profileData,
        academies: academyData,
      };

      console.log('Profile fetched successfully:', fullProfile);
      return fullProfile;

    } catch (error) {
      console.error('Error in fetchProfile process:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      }
      setLoading(false);
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Add timeout to profile fetch to prevent hanging
          const fetchWithTimeout = Promise.race([
            fetchProfile(session.user.id),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile fetch timeout')), 10000) // Increased to 10s
            )
          ]);
          
          try {
            const userProfile = await fetchWithTimeout as Profile | null;
            setProfile(userProfile);
          } catch (error) {
            console.error('Profile fetch failed or timed out:', error);
            // Create a default profile for directors
            if (session.user.email === 'excelzed@gmail.com') {
              setProfile({
                id: 'temp-id',
                user_id: session.user.id,
                full_name: 'مدير النظام',
                email: session.user.email,
                role: 'director',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            } else {
              setProfile(null);
            }
          }
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    const redirectUrl = `${window.location.origin}/admin`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role: string): boolean => {
    return profile?.role === role;
  };

  const isAdmin = (): boolean => {
    return profile?.role === 'director' || profile?.role === 'comptabilite_chief';
  };

  const isPlatformAdmin = (): boolean => {
    return profile?.role === 'platform_admin';
  };

  const isModuleEnabled = (moduleName: string): boolean => {
    if (isPlatformAdmin()) return true; // Platform admin has access to all modules
    return profile?.academies?.modules?.[moduleName] ?? false;
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
    isPlatformAdmin,
    isModuleEnabled,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};