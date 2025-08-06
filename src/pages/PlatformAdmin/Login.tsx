// src/pages/PlatformAdmin/Login.tsx
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('Login onSubmit started');
    setIsLoading(true);
    try {
      console.log('Step 1: Starting login attempt for:', data.email);

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email.trim(),
        password: data.password,
      });

      console.log('Step 1 Result - Auth Data:', !!authData, 'Auth Error:', signInError);

      if (signInError) {
        console.error('Sign in error:', signInError);
        toast({
          title: 'Login Failed',
          description: signInError.message || 'Authentication failed',
          variant: 'destructive',
        });
        return; // Exit early on auth error
      }

      if (!authData.user) {
        const errorMsg = 'No user returned after login.';
        console.error('Login Error:', errorMsg);
        toast({
          title: 'Login Failed',
          description: errorMsg,
          variant: 'destructive',
        });
        return; // Exit early if no user
      }

      console.log('Step 2: Checking platform admin status for user ID:', authData.user.id);
      // Check if user exists in platform_admins table
      const { data: platformAdmin, error: platformAdminError } = await supabase
        .from('platform_admins')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      console.log('Step 2 Result - Platform Admin Data:', platformAdmin, 'Platform Admin Error:', platformAdminError);

      if (platformAdminError || !platformAdmin) {
        const errorMsg = platformAdminError?.message || 'User not found in platform_admins table.';
        console.error('Platform admin check error:', errorMsg);
        // Important: Await the signOut to ensure it completes before proceeding
        await supabase.auth.signOut();
        toast({
          title: 'Access Denied',
          description: 'You do not have platform administrator privileges.',
          variant: 'destructive',
        });
        return; // Exit early if not platform admin
      }

      console.log('Step 3: Fetching user profile for user ID:', authData.user.id);
      // Optionally, also fetch user profile for additional info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      console.log('Step 3 Result - Profile Data:', profile, 'Profile Error:', profileError);

      if (profileError) {
        // Log profile error but don't fail login necessarily
        console.warn('Profile fetch error (non-critical):', profileError);
        // You might choose to show a warning toast here instead of failing
        // toast({
        //   title: 'Notice',
        //   description: 'Profile information could not be loaded.',
        //   variant: 'default', // or a warning variant if you have one
        // });
      }

      console.log('Step 4: All checks passed. Preparing success toast and navigation.');
      toast({
        title: 'Login Successful',
        description: 'Welcome, Platform Administrator.',
      });

      // Use setTimeout to ensure state updates and toast are processed
      // before navigation, which might trigger context changes
      setTimeout(() => {
        console.log('Step 5: Navigating to /platform-admin');
        navigate('/platform-admin', { replace: true }); // Use replace to avoid back button issues
      }, 100); // Small delay

    } catch (error: any) {
      console.error('Unexpected Login error:', error);
      toast({
        title: 'Login Error',
        description: error.message || 'An unexpected error occurred during login.',
        variant: 'destructive',
      });
    } finally {
      console.log('Login process finished (finally block)');
      // Ensure loading state is always reset
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
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
                e.preventDefault(); // Prevent default form submission
                console.log("Form submit handler triggered");
                form.handleSubmit(onSubmit)(e); // Call the onSubmit handler
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
    </div>
  );
};

export default PlatformAdminLogin;
