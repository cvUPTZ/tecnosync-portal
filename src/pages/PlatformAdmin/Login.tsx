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
    setIsLoading(true);
    try {
      console.log('Starting login attempt for:', data.email);

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email.trim(),
        password: data.password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        toast({
          title: 'Login Failed',
          description: signInError.message || 'Authentication failed',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast({
          title: 'Login Failed',
          description: 'No user returned after login.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Fetch user profile from the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError);
        await supabase.auth.signOut();
        toast({
          title: 'Login Failed',
          description: 'User profile not found.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      console.log('User profile:', profile);

      // Check if user is active
      if (!profile.is_active) {
        await supabase.auth.signOut();
        toast({
          title: 'Access Denied',
          description: 'Your account is inactive.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Check if user is platform admin
      if (profile.role !== 'platform_admin') {
        await supabase.auth.signOut();
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this area.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: 'Login Successful',
        description: 'Welcome, Platform Administrator.',
      });

      navigate('/platform-admin');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
