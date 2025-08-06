// src/pages/PlatformAdmin/Login.tsx - Debug Version
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const PlatformAdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const addDebugLog = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev, message]);
  };

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    addDebugLog('🟡 Login process started');
    setIsLoading(true);
    
    try {
      addDebugLog(`🟡 Step 1: Attempting login for: ${data.email}`);
addDebugLog(`🟡 Step 1.1: Attempting login for: ${data}`);
      // Step 1: Authenticate user
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email.trim(),
        password: data.password,
      });

      addDebugLog(`🟡 Step 1 Result - User ID: ${authData.user?.id || 'null'}, Error: ${signInError?.message || 'none'}`);

      if (signInError) {
        addDebugLog(`🔴 Authentication failed: ${signInError.message}`);
        toast({
          title: 'Login Failed',
          description: signInError.message || 'Authentication failed',
          variant: 'destructive',
        });
        return;
      }

      if (!authData.user) {
        addDebugLog('🔴 No user returned after authentication');
        toast({
          title: 'Login Failed',
          description: 'No user returned after login.',
          variant: 'destructive',
        });
        return;
      }

      const userId = authData.user.id;
      addDebugLog(`🟡 Step 2: Checking platform admin status for user ID: ${userId}`);

      // Step 2: Check platform_admins table
      const { data: platformAdmin, error: platformAdminError } = await supabase
        .from('platform_admins')
        .select('*')
        .eq('id', userId)
        .single();

      addDebugLog(`🟡 Step 2 Result - Platform admin data: ${JSON.stringify(platformAdmin)}`);
      addDebugLog(`🟡 Step 2 Result - Platform admin error: ${JSON.stringify(platformAdminError)}`);

      // Let's also try a broader query to see what's in the table
      const { data: allPlatformAdmins, error: allError } = await supabase
        .from('platform_admins')
        .select('*');
      
      addDebugLog(`🟡 Debug: All platform admins: ${JSON.stringify(allPlatformAdmins)}`);
      addDebugLog(`🟡 Debug: All platform admins error: ${JSON.stringify(allError)}`);

      if (platformAdminError || !platformAdmin) {
        const errorMsg = platformAdminError?.message || 'User not found in platform_admins table.';
        addDebugLog(`🔴 Platform admin check failed: ${errorMsg}`);
        
        // Sign out the user since they don't have platform admin access
        await supabase.auth.signOut();
        addDebugLog('🟡 User signed out due to lack of platform admin privileges');
        
        toast({
          title: 'Access Denied',
          description: 'You do not have platform administrator privileges.',
          variant: 'destructive',
        });
        return;
      }

      addDebugLog('🟡 Step 3: Checking user profile');
      
      // Step 3: Fetch user profile (optional, for additional info)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      addDebugLog(`🟡 Step 3 Result - Profile: ${JSON.stringify(profile)}, Error: ${JSON.stringify(profileError)}`);

      if (profileError) {
        addDebugLog(`🟠 Profile fetch warning: ${profileError.message}`);
      }

      addDebugLog('🟢 All checks passed - Login successful');
      
      toast({
        title: 'Login Successful',
        description: 'Welcome, Platform Administrator.',
      });

      // Small delay to ensure all state updates complete
      setTimeout(() => {
        addDebugLog('🟡 Navigating to /platform-admin');
        navigate('/platform-admin', { replace: true });
      }, 500);

    } catch (error: any) {
      addDebugLog(`🔴 Unexpected error: ${error.message}`);
      console.error('Unexpected Login error:', error);
      toast({
        title: 'Login Error',
        description: error.message || 'An unexpected error occurred during login.',
        variant: 'destructive',
      });
    } finally {
      addDebugLog('🟡 Login process finished');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex gap-8">
        {/* Login Form */}
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Shield className="w-20 h-20 mx-auto mb-4 text-tfa-blue" />
            <h1 className="text-3xl font-bold">Academy Creator</h1>
            <p className="text-muted-foreground">Platform Administration</p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" />
                Super Admin Login
              </CardTitle>
              <CardDescription>
                Enter your credentials to access the platform panel.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  addDebugLog("🟡 Form submit handler triggered");
                  form.handleSubmit(onSubmit)(e);
                }} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="superadmin@creator.com"
                            {...field}
                            className="bg-gray-700 border-gray-600 text-white"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="bg-gray-700 border-gray-600 text-white"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-tfa-blue hover:bg-tfa-blue/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Debug Panel */}
        <div className="w-full max-w-md">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm">Debug Console</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 p-4 rounded text-xs font-mono max-h-96 overflow-y-auto">
                {debugInfo.length === 0 ? (
                  <div className="text-gray-500">Debug info will appear here...</div>
                ) : (
                  debugInfo.map((log, index) => (
                    <div key={index} className="mb-1 text-green-400">
                      {log}
                    </div>
                  ))
                )}
              </div>
              {debugInfo.length > 0 && (
                <Button 
                  onClick={() => setDebugInfo([])} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  Clear
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlatformAdminLogin;
