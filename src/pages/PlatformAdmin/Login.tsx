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
  // State for login component
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'idle',
    message: 'Not tested'
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // State for debug tool component
  const [logs, setLogs] = useState<string[]>([]);
  const [testEmail, setTestEmail] = useState('admin@techconsync.com');
  const [testPassword, setTestPassword] = useState('admin123456');

  // Helper function to create timeout promise
  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  };

  // Helper function to add logs (both debugInfo and logs)
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [...prev, logMessage]);
    setDebugInfo(prev => [...prev, logMessage]); // Mirror to debugInfo for login component
  };

  // Test connection on component mount (login component logic)
  useEffect(() => {
    testFullConnection();
  }, []);

  const testFullConnection = async () => {
    setConnectionStatus({ status: 'testing', message: 'Testing connection...' });
    addLog('🔄 Starting comprehensive connection test...');
    try {
      // Test 1: Basic URL validation
      addLog('🧪 Test 1: Validating Supabase configuration');
      if (!supabase.supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }
      if (!supabase.supabaseKey) {
        throw new Error('Supabase key not configured');
      }
      addLog(`✅ Supabase URL: ${supabase.supabaseUrl}`);
      addLog(`✅ Supabase Key: ${supabase.supabaseKey.substring(0, 20)}...`);
      // Test 2: Network connectivity to Supabase
      addLog('🧪 Test 2: Testing network connectivity');
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
        addLog(`✅ Network response status: ${response.status}`);
        if (!response.ok) {
          addLog(`⚠️ Non-200 response: ${response.statusText}`);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        addLog(`❌ Network connectivity failed: ${fetchError.message}`);
        throw new Error(`Network connectivity failed: ${fetchError.message}`);
      }
      // Test 3: Supabase client initialization (with timeout)
      addLog('🧪 Test 3: Testing Supabase client');
      try {
        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error: sessionError } = await withTimeout(sessionPromise, 15000);
        if (sessionError) {
          addLog(`⚠️ Session check warning: ${sessionError.message}`);
        } else {
          addLog(`✅ Session check: ${session ? 'Active session found' : 'No active session'}`);
        }
      } catch (sessionTimeout) {
        addLog(`⚠️ Session check timed out - continuing with other tests`);
      }
      // Test 4: Database connectivity (with timeout)
      addLog('🧪 Test 4: Testing database connectivity');
      try {
        const dbPromise = supabase
          .from('platform_admins')
          .select('*', { count: 'exact', head: true });
        const { data, error, count } = await withTimeout(dbPromise, 10000);
        if (error) {
          addLog(`❌ Database query failed: ${error.message}`);
          addLog(`❌ Error code: ${error.code}`);
          addLog(`❌ Error hint: ${error.hint || 'No hint available'}`);
          if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
            addLog('⚠️ Table "platform_admins" does not exist - use "Create Table" button');
          }
        } else {
          addLog(`✅ Database query successful. Records found: ${count || 0}`);
        }
      } catch (dbError: any) {
        if (dbError.message.includes('timed out')) {
          addLog(`❌ Database test timed out: ${dbError.message}`);
        } else {
          addLog(`❌ Database test exception: ${dbError.message}`);
        }
      }
      // Test 5: Auth service (with timeout)
      addLog('🧪 Test 5: Testing auth service');
      try {
        const authPromise = supabase.auth.admin.listUsers();
        const { data: { users }, error: usersError } = await withTimeout(authPromise, 5000);
        if (usersError) {
          addLog(`⚠️ Admin user list (expected to fail): ${usersError.message}`);
        } else {
          addLog(`✅ Auth service accessible. Users found: ${users?.length || 0}`);
        }
      } catch (adminError: any) {
        if (adminError.message.includes('timed out')) {
          addLog(`⚠️ Auth admin functions timed out (this is normal)`);
        } else {
          addLog(`⚠️ Admin functions not accessible (expected): ${adminError.message}`);
        }
      }
      setConnectionStatus({
        status: 'success',
        message: 'Connection tests completed'
      });
      addLog('🎉 All connection tests completed');
    } catch (error: any) {
      addLog(`💥 Connection test failed: ${error.message}`);
      setConnectionStatus({
        status: 'error',
        message: error.message
      });
    }
  };

  const createPlatformAdminsTable = async () => {
    addLog('🔧 Creating platform_admins table...');
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
        addLog(`❌ Failed to create table via RPC: ${error.message}`);
        addLog('📝 Please run this SQL manually in your Supabase SQL Editor:');
        addLog(`
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
        addLog('✅ Table created successfully');
        // Re-test connection to verify table creation
        setTimeout(() => testFullConnection(), 1000);
      }
    } catch (error: any) {
      addLog(`❌ Table creation error: ${error.message}`);
    }
  };

  const addTestAdmin = async () => {
    addLog('👤 Adding test admin user...');
    try {
      const testEmail = 'admin@techconsync.com';
      const testPassword = 'admin123456';
      addLog(`🔑 Creating auth user: ${testEmail}`);
      const signUpPromise = supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      const { data: signUpData, error: signUpError } = await withTimeout(signUpPromise, 15000);
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          addLog(`⚠️ User already exists: ${testEmail}`);
          addLog(`📧 Try logging in with: ${testEmail} / ${testPassword}`);
        } else {
          addLog(`❌ Failed to create auth user: ${signUpError.message}`);
        }
        return;
      }
      if (!signUpData.user) {
        addLog('❌ No user returned from signup');
        return;
      }
      addLog(`✅ Auth user created with ID: ${signUpData.user.id}`);
      // Add to platform_admins table
      const insertPromise = supabase
        .from('platform_admins')
        .insert({
          id: signUpData.user.id,
          email: testEmail
        });
      const { error: adminError } = await withTimeout(insertPromise, 10000);
      if (adminError) {
        addLog(`❌ Failed to add to platform_admins: ${adminError.message}`);
      } else {
        addLog('✅ Test admin added successfully');
        addLog(`📧 Test credentials: ${testEmail} / ${testPassword}`);
      }
    } catch (error: any) {
      if (error.message.includes('timed out')) {
        addLog(`❌ Add test admin timed out: ${error.message}`);
      } else {
        addLog(`❌ Add test admin error: ${error.message}`);
      }
    }
  };

  const checkEnvironmentVariables = () => {
    addLog('🧪 Environment Variables Check:');
    const envVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];
    envVars.forEach(varName => {
      const value = (import.meta.env as any)[varName];
      if (value) {
        addLog(`✅ ${varName}: ${value.substring(0, 20)}...`);
      } else {
        addLog(`❌ ${varName}: Not found`);
      }
    });
    addLog(`🔧 Client using URL: ${supabase.supabaseUrl}`);
    addLog(`🔧 Client using key: ${supabase.supabaseKey?.substring(0, 20)}...`);
  };

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    addLog('🚀 Starting enhanced login process');
    setIsLoading(true);
    try {
      addLog(`👤 Attempting login for: ${data.email}`);
      // Enhanced authentication with timeout
      const authPromise = supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      const { data: authData, error: signInError } = await withTimeout(authPromise, 15000);
      addLog(`🔐 Auth result: ${JSON.stringify({
        userExists: !!authData.user,
        userId: authData.user?.id,
        error: signInError?.message
      })}`);
      if (signInError) {
        addLog(`❌ Authentication failed: ${signInError.message}`);
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
        addLog('❌ No user returned after authentication');
        toast({
          title: 'Login Failed',
          description: 'Authentication succeeded but no user data returned.',
          variant: 'destructive',
        });
        return;
      }
      const userId = authData.user.id;
      addLog(`👑 Checking admin privileges for user: ${userId}`);
      // Enhanced admin check with timeout
      const adminCheckPromise = supabase
        .from('platform_admins')
        .select('*')
        .eq('id', userId)
        .single();
      const { data: adminData, error: adminError } = await withTimeout(adminCheckPromise, 10000);
      if (adminError && adminError.code !== 'PGRST116') {
        addLog(`❌ Admin check failed: ${adminError.message}`);
      }
      if (!adminData) {
        addLog('❌ User is not a platform administrator');
        await supabase.auth.signOut();
        addLog('🚪 User signed out due to lack of admin privileges');
        toast({
          title: 'Access Denied',
          description: 'You do not have platform administrator privileges.',
          variant: 'destructive',
        });
        return;
      }
      addLog('🎉 Login successful - User is a platform administrator');
      toast({
        title: 'Login Successful',
        description: 'Welcome, Platform Administrator.',
      });
      setTimeout(() => {
        addLog('🏃 Navigating to platform admin panel');
        navigate('/platform-admin', { replace: true });
      }, 1000);
    } catch (error: any) {
      if (error.message.includes('timed out')) {
        addLog(`💥 Login timed out: ${error.message}`);
        toast({
          title: 'Login Timeout',
          description: 'The login process timed out. Please try again.',
          variant: 'destructive',
        });
      } else {
        addLog(`💥 Unexpected error during login: ${error.message}`);
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

  // Debug tool functions
  // Test basic fetch to auth endpoint
  const testAuthEndpoint = async () => {
    addLog('🔍 Testing auth endpoint directly...');
    try {
      const authUrl = `https://lztxjcfvzovibcsoeakm.supabase.co/auth/v1/token?grant_type=password`;
      addLog(`📍 Auth URL: ${authUrl}`);
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dHhqY2Z2em92aWJjc29lYWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjk1MTAsImV4cCI6MjA2OTY0NTUxMH0.az32QLm2PR90iMhVb51ffPOIhb9AZdVZkgTuZJPZOHc',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dHhqY2Z2em92aWJjc29lYWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjk1MTAsImV4cCI6MjA2OTY0NTUxMH0.az32QLm2PR90iMhVb51ffPOIhb9AZdVZkgTuZJPZOHc'
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      });
      addLog(`📊 Response status: ${response.status}`);
      addLog(`📊 Response headers: ${JSON.stringify([...response.headers.entries()])}`);
      const responseText = await response.text();
      addLog(`📊 Response body: ${responseText}`);
      if (response.status === 400) {
        const errorData = JSON.parse(responseText);
        if (errorData.error_description === 'Invalid login credentials') {
          addLog('❌ User does not exist - need to create user first');
        }
      }
    } catch (error: any) {
      addLog(`❌ Direct auth test failed: ${error.message}`);
    }
  };

  // Test sign up
  const testSignUp = async () => {
    addLog('👤 Testing user signup...');
    setIsLoading(true);
    try {
      const signUpUrl = `https://lztxjcfvzovibcsoeakm.supabase.co/auth/v1/signup`;
      const response = await withTimeout(fetch(signUpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dHhqY2Z2em92aWJjc29lYWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjk1MTAsImV4cCI6MjA2OTY0NTUxMH0.az32QLm2PR90iMhVb51ffPOIhb9AZdVZkgTuZJPZOHc'
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      }), 15000);
      addLog(`📊 SignUp status: ${response.status}`);
      const responseText = await response.text();
      addLog(`📊 SignUp response: ${responseText}`);
      if (response.ok) {
        addLog('✅ User created successfully!');
        // Now add to platform_admins table
        addLog('👑 Adding user to platform_admins table...');
        const userData = JSON.parse(responseText);
        if (userData.user && userData.user.id) {
          await testAddToPlatformAdmins(userData.user.id);
        }
      }
    } catch (error: any) {
      addLog(`❌ SignUp failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test adding to platform_admins
  const testAddToPlatformAdmins = async (userId: string) => {
    try {
      const insertUrl = `https://lztxjcfvzovibcsoeakm.supabase.co/rest/v1/platform_admins`;
      const response = await fetch(insertUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dHhqY2Z2em92aWJjc29lYWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjk1MTAsImV4cCI6MjA2OTY0NTUxMH0.az32QLm2PR90iMhVb51ffPOIhb9AZdVZkgTuZJPZOHc',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dHhqY2Z2em92aWJjc29lYWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjk1MTAsImV4cCI6MjA2OTY0NTUxMH0.az32QLm2PR90iMhVb51ffPOIhb9AZdVZkgTuZJPZOHc',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          id: userId,
          email: testEmail
        })
      });
      addLog(`📊 Platform admin insert status: ${response.status}`);
      const responseText = await response.text();
      addLog(`📊 Platform admin response: ${responseText}`);
      if (response.ok) {
        addLog('✅ User added to platform_admins successfully!');
        addLog(`🎉 You can now login with: ${testEmail} / ${testPassword}`);
      }
    } catch (error: any) {
      addLog(`❌ Failed to add to platform_admins: ${error.message}`);
    }
  };

  // Test database connectivity
  const testDatabaseQuery = async () => {
    addLog('🗄️ Testing database query...');
    try {
      const queryUrl = `https://lztxjcfvzovibcsoeakm.supabase.co/rest/v1/platform_admins?select=*`;
      const response = await withTimeout(fetch(queryUrl, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dHhqY2Z2em92aWJjc29lYWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjk1MTAsImV4cCI6MjA2OTY0NTUxMH0.az32QLm2PR90iMhVb51ffPOIhb9AZdVZkgTuZJPZOHc',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dHhqY2Z2em92aWJjc29lYWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjk1MTAsImV4cCI6MjA2OTY0NTUxMH0.az32QLm2PR90iMhVb51ffPOIhb9AZdVZkgTuZJPZOHc'
        }
      }), 10000);
      addLog(`📊 Database query status: ${response.status}`);
      const responseText = await response.text();
      addLog(`📊 Database query response: ${responseText}`);
      if (response.ok) {
        const data = JSON.parse(responseText);
        addLog(`✅ Found ${data.length} platform admin(s)`);
        data.forEach((admin: any, index: number) => {
          addLog(`👤 Admin ${index + 1}: ${admin.email} (${admin.id})`);
        });
      }
    } catch (error: any) {
      addLog(`❌ Database query failed: ${error.message}`);
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
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Supabase Auth Debug Tool</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Test email"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="Test password"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Button onClick={testAuthEndpoint} disabled={isLoading}>
                  Test Auth Endpoint
                </Button>
                <Button onClick={testDatabaseQuery} disabled={isLoading}>
                  Test Database Query
                </Button>
                <Button onClick={testSignUp} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                  Create Test User
                </Button>
                <Button onClick={() => setLogs([])} variant="outline">
                  Clear Logs
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Enhanced Debug Console (With Timeout Protection)
                <Button 
                  onClick={() => {
                    setDebugInfo([]);
                    setLogs([]);
                  }} 
                  variant="outline" 
                  size="sm"
                  disabled={debugInfo.length === 0 && logs.length === 0}
                >
                  Clear All Logs
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 p-4 rounded text-xs font-mono max-h-96 overflow-y-auto">
                {debugInfo.length === 0 && logs.length === 0 ? (
                  <div className="text-gray-500">
                    Enhanced debug info with timeout protection...
                    <br />
                    🔄 Connection test runs automatically on load
                    <br />
                    ⏱️ All operations now have timeouts to prevent hanging
                    <br />
                    🧪 Use buttons below to test specific functionality
                    <br />
                    <br />
                    Debug logs from Auth Debug Tool will also appear here...
                    <br />
                    1. First run "Test Database Query" to check if table exists
                    <br />
                    2. Then run "Create Test User" to create the admin user
                    <br />
                    3. Finally test "Test Auth Endpoint" to verify login works
                  </div>
                ) : (
                  [...debugInfo, ...logs]
                    .map((log, index) => (
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
