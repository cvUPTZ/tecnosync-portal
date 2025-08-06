// Enhanced Debug Version - Platform Admin Login
import React, { useState, useEffect } from 'react';
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
import { LogIn, Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface ConnectionStatus {
  status: 'idle' | 'testing' | 'success' | 'error';
  message: string;
}

const PlatformAdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'idle',
    message: 'Not tested'
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugInfo(prev => [...prev, logMessage]);
  };

  // Test connection on component mount
  useEffect(() => {
    testFullConnection();
  }, []);

  const testFullConnection = async () => {
    setConnectionStatus({ status: 'testing', message: 'Testing connection...' });
    addDebugLog('🔄 Starting comprehensive connection test...');

    try {
      // Test 1: Basic URL validation
      addDebugLog('🧪 Test 1: Validating Supabase configuration');
      
      if (!supabase.supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }
      
      if (!supabase.supabaseKey) {
        throw new Error('Supabase key not configured');
      }

      addDebugLog(`✅ Supabase URL: ${supabase.supabaseUrl}`);
      addDebugLog(`✅ Supabase Key: ${supabase.supabaseKey.substring(0, 20)}...`);

      // Test 2: Network connectivity to Supabase
      addDebugLog('🧪 Test 2: Testing network connectivity');
      
      const healthCheckUrl = `${supabase.supabaseUrl}/rest/v1/`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(healthCheckUrl, {
          method: 'GET',
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        addDebugLog(`✅ Network response status: ${response.status}`);
        
        if (!response.ok) {
          addDebugLog(`⚠️ Non-200 response: ${response.statusText}`);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        addDebugLog(`❌ Network connectivity failed: ${fetchError.message}`);
        throw new Error(`Network connectivity failed: ${fetchError.message}`);
      }

      // Test 3: Supabase client initialization
      addDebugLog('🧪 Test 3: Testing Supabase client');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        addDebugLog(`⚠️ Session check warning: ${sessionError.message}`);
      } else {
        addDebugLog(`✅ Session check: ${session ? 'Active session found' : 'No active session'}`);
      }

      // Test 4: Database connectivity
      addDebugLog('🧪 Test 4: Testing database connectivity');
      
      const { data, error, count } = await supabase
        .from('platform_admins')
        .select('*', { count: 'exact', head: true });

      if (error) {
        addDebugLog(`❌ Database query failed: ${error.message}`);
        addDebugLog(`❌ Error details: ${JSON.stringify(error)}`);
        throw new Error(`Database connectivity failed: ${error.message}`);
      }

      addDebugLog(`✅ Database query successful. Records found: ${count}`);

      // Test 5: Auth service
      addDebugLog('🧪 Test 5: Testing auth service');
      
      try {
        // This might fail if we don't have admin privileges, but that's expected
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError) {
          addDebugLog(`⚠️ Admin user list (expected to fail): ${usersError.message}`);
        } else {
          addDebugLog(`✅ Auth service accessible. Users found: ${users?.length || 0}`);
        }
      } catch (adminError: any) {
        addDebugLog(`⚠️ Admin functions not accessible (expected): ${adminError.message}`);
      }

      setConnectionStatus({
        status: 'success',
        message: 'All connectivity tests passed'
      });
      addDebugLog('🎉 All connection tests completed successfully');

    } catch (error: any) {
      addDebugLog(`💥 Connection test failed: ${error.message}`);
      setConnectionStatus({
        status: 'error',
        message: error.message
      });
    }
  };

  const checkEnvironmentVariables = () => {
    addDebugLog('🧪 Environment Variables Check:');
    
    // These would be your actual env var names
    const envVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];

    envVars.forEach(varName => {
      const value = (import.meta.env as any)[varName];
      if (value) {
        addDebugLog(`✅ ${varName}: ${value.substring(0, 20)}...`);
      } else {
        addDebugLog(`❌ ${varName}: Not found`);
      }
    });

    // Also log what's actually being used by the client
    addDebugLog(`🔧 Client using URL: ${supabase.supabaseUrl}`);
    addDebugLog(`🔧 Client using key: ${supabase.supabaseKey?.substring(0, 20)}...`);
  };

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (connectionStatus.status === 'error') {
      toast({
        title: 'Connection Error',
        description: 'Please fix connection issues before attempting login.',
        variant: 'destructive',
      });
      return;
    }

    addDebugLog('🚀 Starting enhanced login process');
    setIsLoading(true);
    
    try {
      addDebugLog(`👤 Attempting login for: ${data.email}`);

      // Enhanced authentication with better error handling
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      addDebugLog(`🔐 Auth result: ${JSON.stringify({
        userExists: !!authData.user,
        userId: authData.user?.id,
        error: signInError?.message
      })}`);

      if (signInError) {
        addDebugLog(`❌ Authentication failed: ${signInError.message}`);
        
        // Provide more specific error messages
        let userMessage = signInError.message;
        if (signInError.message.includes('Invalid login credentials')) {
          userMessage = 'Invalid email or password. Please check your credentials.';
        } else if (signInError.message.includes('Email not confirmed')) {
          userMessage = 'Please confirm your email address before logging in.';
        }

        toast({
          title: 'Login Failed',
          description: userMessage,
          variant: 'destructive',
        });
        return;
      }

      if (!authData.user) {
        addDebugLog('❌ No user returned after authentication');
        toast({
          title: 'Login Failed',
          description: 'Authentication succeeded but no user data returned.',
          variant: 'destructive',
        });
        return;
      }

      const userId = authData.user.id;
      addDebugLog(`👑 Checking admin privileges for user: ${userId}`);

      // Enhanced admin check with multiple strategies
      const adminChecks = await Promise.allSettled([
        // Strategy 1: Check by id
        supabase.from('platform_admins').select('*').eq('id', userId).single(),
        // Strategy 2: Check by user_id
        supabase.from('platform_admins').select('*').eq('user_id', userId).single(),
        // Strategy 3: Check by email
        supabase.from('platform_admins').select('*').eq('email', data.email).single(),
        // Strategy 4: Get all admins for debugging
        supabase.from('platform_admins').select('*')
      ]);

      adminChecks.forEach((result, index) => {
        const strategy = ['by id', 'by user_id', 'by email', 'all admins'][index];
        if (result.status === 'fulfilled') {
          addDebugLog(`✅ Admin check ${strategy}: ${JSON.stringify(result.value.data)}`);
        } else {
          addDebugLog(`❌ Admin check ${strategy}: ${result.reason.message}`);
        }
      });

      // Determine if user is admin
      const adminData = adminChecks.find((result, index) => 
        result.status === 'fulfilled' && 
        result.value.data && 
        index < 3 // Only consider the first 3 specific user checks
      );

      if (!adminData || adminData.status === 'rejected') {
        addDebugLog('❌ User is not a platform administrator');
        
        // Sign out the user
        await supabase.auth.signOut();
        addDebugLog('🚪 User signed out due to lack of admin privileges');
        
        toast({
          title: 'Access Denied',
          description: 'You do not have platform administrator privileges.',
          variant: 'destructive',
        });
        return;
      }

      addDebugLog('🎉 Login successful - User is a platform administrator');
      
      toast({
        title: 'Login Successful',
        description: 'Welcome, Platform Administrator.',
      });

      // Navigate to admin panel
      setTimeout(() => {
        addDebugLog('🏃 Navigating to platform admin panel');
        navigate('/platform-admin', { replace: true });
      }, 1000);

    } catch (error: any) {
      addDebugLog(`💥 Unexpected error during login: ${error.message}`);
      console.error('Login error:', error);
      toast({
        title: 'Login Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'testing':
        return <AlertCircle className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex gap-8">
        {/* Login Form */}
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Shield className="w-20 h-20 mx-auto mb-4 text-tfa-blue" />
            <h1 className="text-3xl font-bold">Academy Creator</h1>
            <p className="text-muted-foreground">Platform Administration</p>
          </div>

          {/* Connection Status */}
          <Card className="bg-gray-800 border-gray-700 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-sm">
                  Connection Status: {connectionStatus.message}
                </span>
              </div>
            </CardContent>
          </Card>

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
                            placeholder="admin@example.com"
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
                    disabled={isLoading || connectionStatus.status === 'error'}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={testFullConnection}
                      disabled={connectionStatus.status === 'testing'}
                    >
                      Test Connection
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={checkEnvironmentVariables}
                    >
                      Check Config
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Debug Panel */}
        <div className="w-full max-w-2xl">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Enhanced Debug Console
                <Button 
                  onClick={() => setDebugInfo([])} 
                  variant="outline" 
                  size="sm"
                  disabled={debugInfo.length === 0}
                >
                  Clear
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 p-4 rounded text-xs font-mono max-h-96 overflow-y-auto">
                {debugInfo.length === 0 ? (
                  <div className="text-gray-500">
                    Enhanced debug info will appear here...
                    <br />
                    🔄 Connection test runs automatically on load
                    <br />
                    🧪 Use "Test Connection" to re-run diagnostics
                    <br />
                    🔧 Use "Check Config" to verify environment setup
                  </div>
                ) : (
                  debugInfo.map((log, index) => (
                    <div key={index} className={`mb-1 ${
                      log.includes('❌') ? 'text-red-400' :
                      log.includes('✅') ? 'text-green-400' :
                      log.includes('⚠️') ? 'text-yellow-400' :
                      log.includes('🎉') ? 'text-blue-400' :
                      'text-gray-300'
                    }`}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlatformAdminLogin;
