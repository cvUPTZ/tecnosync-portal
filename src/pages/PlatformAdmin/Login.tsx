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

  // Helper function to create timeout promise
  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
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

      // Test 3: Supabase client initialization (with timeout)
      addDebugLog('🧪 Test 3: Testing Supabase client');
      
      try {
        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error: sessionError } = await withTimeout(sessionPromise, 15000);
        
        if (sessionError) {
          addDebugLog(`⚠️ Session check warning: ${sessionError.message}`);
        } else {
          addDebugLog(`✅ Session check: ${session ? 'Active session found' : 'No active session'}`);
        }
      } catch (sessionTimeout) {
        addDebugLog(`⚠️ Session check timed out - continuing with other tests`);
      }

      // Test 4: Database connectivity (with timeout)
      addDebugLog('🧪 Test 4: Testing database connectivity');
      
      try {
        const dbPromise = supabase
          .from('platform_admins')
          .select('*', { count: 'exact', head: true });
          
        const { data, error, count } = await withTimeout(dbPromise, 10000);

        if (error) {
          addDebugLog(`❌ Database query failed: ${error.message}`);
          addDebugLog(`❌ Error code: ${error.code}`);
          addDebugLog(`❌ Error hint: ${error.hint || 'No hint available'}`);
          
          if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
            addDebugLog('⚠️ Table "platform_admins" does not exist - use "Create Table" button');
          }
        } else {
          addDebugLog(`✅ Database query successful. Records found: ${count || 0}`);
        }
      } catch (dbError: any) {
        if (dbError.message.includes('timed out')) {
          addDebugLog(`❌ Database test timed out: ${dbError.message}`);
        } else {
          addDebugLog(`❌ Database test exception: ${dbError.message}`);
        }
      }

      // Test 5: Auth service (with timeout)
      addDebugLog('🧪 Test 5: Testing auth service');
      
      try {
        const authPromise = supabase.auth.admin.listUsers();
        const { data: { users }, error: usersError } = await withTimeout(authPromise, 5000);
        
        if (usersError) {
          addDebugLog(`⚠️ Admin user list (expected to fail): ${usersError.message}`);
        } else {
          addDebugLog(`✅ Auth service accessible. Users found: ${users?.length || 0}`);
        }
      } catch (adminError: any) {
        if (adminError.message.includes('timed out')) {
          addDebugLog(`⚠️ Auth admin functions timed out (this is normal)`);
        } else {
          addDebugLog(`⚠️ Admin functions not accessible (expected): ${adminError.message}`);
        }
      }

      setConnectionStatus({
        status: 'success',
        message: 'Connection tests completed'
      });
      addDebugLog('🎉 All connection tests completed');

    } catch (error: any) {
      addDebugLog(`💥 Connection test failed: ${error.message}`);
      setConnectionStatus({
        status: 'error',
        message: error.message
      });
    }
  };

  const createPlatformAdminsTable = async () => {
    addDebugLog('🔧 Creating platform_admins table...');
    
    try {
      // Direct SQL execution via edge function or RPC
      const { data, error } = await supabase.rpc('sql', {
        query: `
          CREATE TABLE IF NOT EXISTS platform_admins (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
          
          ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY IF NOT EXISTS "Users can read own platform_admin record" ON platform_admins
            FOR SELECT USING (auth.uid() = id);
            
          CREATE POLICY IF NOT EXISTS "Platform admins can read all records" ON platform_admins
            FOR ALL USING (EXISTS (
              SELECT 1 FROM platform_admins WHERE id = auth.uid()
            ));
        `
      });
      
      if (error) {
        addDebugLog(`❌ Failed to create table via RPC: ${error.message}`);
        addDebugLog('📝 Please run this SQL manually in your Supabase SQL Editor:');
        addDebugLog(`
CREATE TABLE IF NOT EXISTS platform_admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can read own platform_admin record" ON platform_admins
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY IF NOT EXISTS "Platform admins can read all records" ON platform_admins
  FOR ALL USING (EXISTS (
    SELECT 1 FROM platform_admins WHERE id = auth.uid()
  ));
        `);
      } else {
        addDebugLog('✅ Table created successfully');
        // Re-test connection to verify table creation
        setTimeout(() => testFullConnection(), 1000);
      }
      
    } catch (error: any) {
      addDebugLog(`❌ Table creation error: ${error.message}`);
    }
  };

  const addTestAdmin = async () => {
    addDebugLog('👤 Adding test admin user...');
    
    try {
      const testEmail = 'admin@techconsync.com';
      const testPassword = 'admin123456';
      
      addDebugLog(`🔑 Creating auth user: ${testEmail}`);
      
      const signUpPromise = supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      
      const { data: signUpData, error: signUpError } = await withTimeout(signUpPromise, 15000);
      
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          addDebugLog(`⚠️ User already exists: ${testEmail}`);
          addDebugLog(`📧 Try logging in with: ${testEmail} / ${testPassword}`);
        } else {
          addDebugLog(`❌ Failed to create auth user: ${signUpError.message}`);
        }
        return;
      }
      
      if (!signUpData.user) {
        addDebugLog('❌ No user returned from signup');
        return;
      }
      
      addDebugLog(`✅ Auth user created with ID: ${signUpData.user.id}`);
      
      // Add to platform_admins table
      const insertPromise = supabase
        .from('platform_admins')
        .insert({
          id: signUpData.user.id,
          email: testEmail
        });
        
      const { error: adminError } = await withTimeout(insertPromise, 10000);
        
      if (adminError) {
        addDebugLog(`❌ Failed to add to platform_admins: ${adminError.message}`);
      } else {
        addDebugLog('✅ Test admin added successfully');
        addDebugLog(`📧 Test credentials: ${testEmail} / ${testPassword}`);
      }
      
    } catch (error: any) {
      if (error.message.includes('timed out')) {
        addDebugLog(`❌ Add test admin timed out: ${error.message}`);
      } else {
        addDebugLog(`❌ Add test admin error: ${error.message}`);
      }
    }
  };

  const checkEnvironmentVariables = () => {
    addDebugLog('🧪 Environment Variables Check:');
    
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
    addDebugLog('🚀 Starting enhanced login process');
    setIsLoading(true);
    
    try {
      addDebugLog(`👤 Attempting login for: ${data.email}`);

      // Enhanced authentication with timeout
      const authPromise = supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      const { data: authData, error: signInError } = await withTimeout(authPromise, 15000);

      addDebugLog(`🔐 Auth result: ${JSON.stringify({
        userExists: !!authData.user,
        userId: authData.user?.id,
        error: signInError?.message
      })}`);

      if (signInError) {
        addDebugLog(`❌ Authentication failed: ${signInError.message}`);
        
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

      // Enhanced admin check with timeout
      const adminCheckPromise = supabase
        .from('platform_admins')
        .select('*')
        .eq('id', userId)
        .single();
        
      const { data: adminData, error: adminError } = await withTimeout(adminCheckPromise, 10000);

      if (adminError && adminError.code !== 'PGRST116') {
        addDebugLog(`❌ Admin check failed: ${adminError.message}`);
      }

      if (!adminData) {
        addDebugLog('❌ User is not a platform administrator');
        
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

      setTimeout(() => {
        addDebugLog('🏃 Navigating to platform admin panel');
        navigate('/platform-admin', { replace: true });
      }, 1000);

    } catch (error: any) {
      if (error.message.includes('timed out')) {
        addDebugLog(`💥 Login timed out: ${error.message}`);
        toast({
          title: 'Login Timeout',
          description: 'The login process timed out. Please try again.',
          variant: 'destructive',
        });
      } else {
        addDebugLog(`💥 Unexpected error during login: ${error.message}`);
        toast({
          title: 'Login Error',
          description: error.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
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
            <Shield className="w-20 h-20 mx-auto mb-4 text-blue-500" />
            <h1 className="text-3xl font-bold">Academy Creator</h1>
            <p className="text-gray-400">Platform Administration</p>
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
                            placeholder="admin@techconsync.com"
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
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
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
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={createPlatformAdminsTable}
                      className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black"
                    >
                      Create Table
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTestAdmin}
                      className="text-green-400 border-green-400 hover:bg-green-400 hover:text-black"
                    >
                      Add Test Admin
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
                Enhanced Debug Console (With Timeout Protection)
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
                    Enhanced debug info with timeout protection...
                    <br />
                    🔄 Connection test runs automatically on load
                    <br />
                    ⏱️ All operations now have timeouts to prevent hanging
                    <br />
                    🧪 Use buttons below to test specific functionality
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
