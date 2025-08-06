// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useToast } from '@/hooks/use-toast';
// import { supabase } from '@/integrations/supabase/client';
// import { LogIn, Shield } from 'lucide-react';

// const loginSchema = z.object({
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
// });

// type LoginFormData = z.infer<typeof loginSchema>;

// const PlatformAdminLogin = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();
//   const navigate = useNavigate();

//   const form = useForm<LoginFormData>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       email: '',
//       password: '',
//     },
//   });

//   const onSubmit = async (data: LoginFormData) => {
//     setIsLoading(true);
//     try {
//       console.log('Starting login attempt for:', data.email);
//       console.log('Password length:', data.password.length);
      
//       const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
//         email: data.email.trim(),
//         password: data.password,
//       });

//       console.log('Auth response received');
//       console.log('Auth data:', authData);
//       console.log('Sign in error:', signInError);

//       if (signInError) {
//         console.error('Sign in error details:', {
//           message: signInError.message,
//           status: signInError.status,
//           statusText: signInError.statusText,
//           name: signInError.name
//         });
//         toast({
//           title: 'Login Failed',
//           description: signInError.message || 'Authentication failed',
//           variant: 'destructive',
//         });
//         setIsLoading(false);
//         return;
//       }

//       if (!authData || !authData.user) {
//         console.error('No user data returned despite no error');
//         toast({
//           title: 'Login Failed',
//           description: 'No user data received',
//           variant: 'destructive',
//         });
//         setIsLoading(false);
//         return;
//       }

//       console.log('Sign in successful! Auth data:', authData);
//       console.log('User from sign in:', authData.user);
//       console.log('User metadata from sign in:', authData.user?.user_metadata);
//       console.log('App metadata from sign in:', authData.user?.app_metadata);
      
//       // Wait a moment for session to be established
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       // Get the current user again to ensure fresh data
//       const { data: { user }, error: userError } = await supabase.auth.getUser();
      
//       if (userError || !user) {
//         console.error('Error getting user:', userError);
//         await supabase.auth.signOut();
//         toast({
//           title: 'Login Failed',
//           description: 'Authentication failed.',
//           variant: 'destructive',
//         });
//         setIsLoading(false);
//         return;
//       }

//       console.log('Current user from getUser():', user);
//       console.log('User metadata from getUser():', user.user_metadata);
//       console.log('App metadata from getUser():', user.app_metadata);
//       console.log('User email:', user.email);

//       // Check multiple ways for platform admin status
//       const isPlatformAdminByMetadata = user.user_metadata?.role === 'platform_admin';
//       const isPlatformAdminByAppMetadata = user.app_metadata?.role === 'platform_admin';
//       const isPlatformAdminByEmail = user.email === 'superadmin2@creator.com';
      
//       // Try RPC call to check database directly
//       let isPlatformAdminByRPC = false;
//       try {
//         const { data: rpcResult, error: rpcError } = await supabase.rpc('check_platform_admin');
//         if (!rpcError) {
//           console.log('RPC result:', rpcResult);
//           isPlatformAdminByRPC = rpcResult === true;
//         } else {
//           console.log('RPC error:', rpcError);
//         }
//       } catch (rpcError) {
//         console.log('RPC failed (function may not exist):', rpcError);
//       }

//       console.log('Platform admin checks:', {
//         byMetadata: isPlatformAdminByMetadata,
//         byAppMetadata: isPlatformAdminByAppMetadata,
//         byEmail: isPlatformAdminByEmail,
//         byRPC: isPlatformAdminByRPC,
//         userEmail: user.email
//       });

//       // For now, let's allow login if it's the correct email address
//       // You should fix the metadata in the database
//       const isPlatformAdmin = isPlatformAdminByMetadata || isPlatformAdminByAppMetadata || isPlatformAdminByEmail || isPlatformAdminByRPC;

//       if (isPlatformAdmin) {
//         toast({
//           title: 'Login Successful',
//           description: 'Welcome, Platform Administrator.',
//         });
//         navigate('/platform-admin');
//       } else {
//         await supabase.auth.signOut();
//         toast({
//           title: 'Access Denied',
//           description: `You do not have permission to access this area. Email: ${user.email}`,
//           variant: 'destructive',
//         });
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       toast({
//         title: 'Login Error',
//         description: 'An unexpected error occurred.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <Shield className="w-20 h-20 mx-auto mb-4 text-tfa-blue" />
//           <h1 className="text-3xl font-bold">Academy Creator</h1>
//           <p className="text-muted-foreground">Platform Administration</p>
//         </div>

//         <Card className="bg-gray-800 border-gray-700">
//           <CardHeader className="text-center">
//             <CardTitle className="flex items-center justify-center gap-2">
//               <LogIn className="w-5 h-5" />
//               Super Admin Login
//             </CardTitle>
//             <CardDescription>
//               Enter your credentials to access the platform panel.
//             </CardDescription>
//           </CardHeader>

//           <CardContent>
//             <Form {...form}>
//               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                 <FormField
//                   control={form.control}
//                   name="email"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Email</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="email"
//                           placeholder="superadmin@creator.com"
//                           {...field}
//                           className="bg-gray-700 border-gray-600 text-white"
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="password"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Password</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="password"
//                           placeholder="••••••••"
//                           {...field}
//                           className="bg-gray-700 border-gray-600 text-white"
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <Button
//                   type="submit"
//                   className="w-full bg-tfa-blue hover:bg-tfa-blue/90"
//                   disabled={isLoading}
//                 >
//                   {isLoading ? 'Signing In...' : 'Sign In'}
//                 </Button>
//               </form>
//             </Form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default PlatformAdminLogin;













import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const SimpleLoginTest = () => {
  const [email, setEmail] = useState('superadmin@creator.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testLogin = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('Testing basic auth...');
      console.log('Supabase URL:', supabase.supabaseUrl);
      
      // Test 1: Just try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      console.log('Raw response:', { data, error });

      if (error) {
        setResult({
          success: false,
          message: error.message,
          details: {
            name: error.name,
            status: error.status,
            statusText: error.statusText,
            stack: error.stack
          }
        });
      } else if (data && data.user) {
        setResult({
          success: true,
          message: 'Login successful!',
          user: {
            id: data.user.id,
            email: data.user.email,
            metadata: data.user.user_metadata,
            app_metadata: data.user.app_metadata
          }
        });
      } else {
        setResult({
          success: false,
          message: 'No error but no user data returned',
          data: data
        });
      }
    } catch (err) {
      console.error('Caught exception:', err);
      setResult({
        success: false,
        message: 'Exception caught',
        details: {
          name: err.name,
          message: err.message,
          stack: err.stack
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Just test if we can connect to Supabase at all
      const { data, error } = await supabase.auth.getSession();
      
      setResult({
        success: !error,
        message: error ? 'Connection failed' : 'Connection successful',
        details: { error, hasSession: !!data.session }
      });
    } catch (err) {
      setResult({
        success: false,
        message: 'Connection test failed',
        details: err
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Simple Login Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Button 
                onClick={testConnection}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Test Connection
              </Button>
              
              <Button 
                onClick={testLogin}
                disabled={isLoading || !password}
                className="w-full"
              >
                {isLoading ? 'Testing...' : 'Test Login'}
              </Button>
            </div>

            {result && (
              <div className={`p-4 rounded border ${
                result.success 
                  ? 'border-green-500 bg-green-900/20' 
                  : 'border-red-500 bg-red-900/20'
              }`}>
                <div className="font-medium mb-2">
                  {result.success ? '✅ Success' : '❌ Failed'}
                </div>
                <div className="text-sm mb-2">{result.message}</div>
                {result.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer">Details</summary>
                    <pre className="mt-2 p-2 bg-gray-800 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
                {result.user && (
                  <div className="text-xs mt-2">
                    <strong>User Info:</strong>
                    <pre className="mt-1 p-2 bg-gray-800 rounded overflow-auto">
                      {JSON.stringify(result.user, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleLoginTest;
