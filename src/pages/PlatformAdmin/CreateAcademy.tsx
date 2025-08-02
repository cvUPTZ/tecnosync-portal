import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const createAcademySchema = z.object({
  academyName: z.string().min(3, 'Academy name must be at least 3 characters'),
  academySubdomain: z.string().min(3, 'Subdomain must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
  adminFullName: z.string().min(3, 'Admin name must be at least 3 characters'),
  adminEmail: z.string().email('Invalid email address'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

type CreateAcademyFormValues = z.infer<typeof createAcademySchema>;

const CreateAcademyPage = () => {
  const { isPlatformAdmin, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CreateAcademyFormValues>({
    resolver: zodResolver(createAcademySchema),
    defaultValues: {
      academyName: '',
      academySubdomain: '',
      adminFullName: '',
      adminEmail: '',
      adminPassword: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: CreateAcademyFormValues) => {
    try {
      const { error } = await supabase.rpc('create_new_academy', {
        academy_name: values.academyName,
        academy_subdomain: values.academySubdomain,
        admin_full_name: values.adminFullName,
        admin_email: values.adminEmail,
        admin_password: values.adminPassword,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Success!',
        description: `Academy "${values.academyName}" created successfully.`,
      });
      form.reset();

    } catch (error: any) {
      console.error('Failed to create academy:', error);
      toast({
        title: 'Error Creating Academy',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isPlatformAdmin()) {
    // Or redirect to a 403 Forbidden page
    return (
        <div className="flex justify-center items-center h-screen">
            <Card>
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>You do not have permission to view this page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => navigate('/')}>Go to Homepage</Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create New Football Academy</CardTitle>
          <CardDescription>Fill out the form below to create a new academy and its first admin user.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Academy Details</h3>
                <FormField
                  control={form.control}
                  name="academyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academy Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Tecno Football Academy" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="academySubdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subdomain</FormLabel>
                      <FormControl><Input placeholder="e.g., tecno-football" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Initial Admin User</h3>
                 <FormField
                  control={form.control}
                  name="adminFullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Full Name</FormLabel>
                      <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl><Input type="email" placeholder="e.g., admin@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="adminPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Password</FormLabel>
                      <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Creating...' : 'Create Academy'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAcademyPage;
