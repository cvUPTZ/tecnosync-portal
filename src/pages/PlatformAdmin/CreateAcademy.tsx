import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const availableModules = [
  { id: 'registrations', label: 'Registration Management', description: 'Manage student registrations and enrollments' },
  { id: 'students', label: 'Student Management', description: 'Track student information and progress' },
  { id: 'users', label: 'User Management', description: 'Manage staff and user accounts' },
  { id: 'attendance', label: 'Attendance Tracking', description: 'Track student attendance and participation' },
  { id: 'coaches', label: 'Coach Management', description: 'Manage coaching staff and assignments' },
  { id: 'finance', label: 'Finance Management', description: 'Handle payments and financial tracking' },
  { id: 'reports', label: 'Financial Reports', description: 'Generate financial and performance reports' },
  { id: 'documents', label: 'Document Management', description: 'Store and manage academy documents' },
  { id: 'website', label: 'Website Content Management', description: 'Manage public website content and pages' },
] as const;

const websiteTemplates = [
  { 
    id: 'classic', 
    name: 'Classic Academy', 
    description: 'Traditional sports academy design with professional look',
    primaryColor: '#1e40af'
  },
  { 
    id: 'modern', 
    name: 'Modern Sports', 
    description: 'Contemporary design with bold colors and dynamic layouts',
    primaryColor: '#dc2626'
  },
  { 
    id: 'minimal', 
    name: 'Clean & Simple', 
    description: 'Minimalist design focusing on content and readability',
    primaryColor: '#059669'
  },
];

const createAcademySchema = z.object({
  academyName: z.string().min(3, 'Academy name must be at least 3 characters'),
  academySubdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(50, 'Subdomain must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens')
    .regex(/^[a-z0-9]/, 'Subdomain must start with a letter or number')
    .regex(/[a-z0-9]$/, 'Subdomain must end with a letter or number'),
  adminFullName: z.string().min(3, 'Admin name must be at least 3 characters'),
  adminEmail: z.string().email('Invalid email address'),
  adminPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  modules: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one module.',
  }),
  websiteConfig: z.object({
    welcomeMessage: z.string().min(10, 'Welcome message must be at least 10 characters').max(200, 'Welcome message must be less than 200 characters'),
    aboutDescription: z.string().min(50, 'About description must be at least 50 characters').max(1000, 'About description must be less than 1000 characters'),
    contactEmail: z.string().email('Invalid email address'),
    contactPhone: z.string().min(10, 'Phone number must be at least 10 characters'),
    address: z.string().min(10, 'Address must be at least 10 characters'),
    template: z.string(),
    primaryColor: z.string().optional(),
  }),
});

type CreateAcademyFormValues = z.infer<typeof createAcademySchema>;

interface CreatedAcademyInfo {
  id: string;
  name: string;
  subdomain: string;
  adminEmail: string;
  publicUrl: string;
  adminUrl: string;
}

interface SubdomainCheckState {
  isChecking: boolean;
  isAvailable: boolean | null;
  message: string;
}

const CreateAcademyPage = () => {
  const { isPlatformAdmin, loading, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [lastCreatedAcademy, setLastCreatedAcademy] = useState<CreatedAcademyInfo | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [subdomainCheck, setSubdomainCheck] = useState<SubdomainCheckState>({
    isChecking: false,
    isAvailable: null,
    message: ''
  });

  const form = useForm<CreateAcademyFormValues>({
    resolver: zodResolver(createAcademySchema),
    defaultValues: {
      academyName: '',
      academySubdomain: '',
      adminFullName: '',
      adminEmail: '',
      adminPassword: '',
      modules: availableModules.map(m => m.id),
      websiteConfig: {
        welcomeMessage: 'Welcome to our Football Academy where champions are made!',
        aboutDescription: 'Our academy is dedicated to developing young talent through professional training, mentorship, and competitive opportunities. We believe in nurturing not just skilled players, but well-rounded individuals.',
        contactEmail: '',
        contactPhone: '',
        address: '',
        template: 'classic',
        primaryColor: '#1e40af',
      },
    },
  });

  const { isSubmitting } = form.formState;
  const selectedTemplate = form.watch('websiteConfig.template');

  // Update primary color when template changes
  React.useEffect(() => {
    const template = websiteTemplates.find(t => t.id === selectedTemplate);
    if (template) {
      form.setValue('websiteConfig.primaryColor', template.primaryColor);
    }
  }, [selectedTemplate, form]);

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainCheck({ isChecking: false, isAvailable: null, message: '' });
      return;
    }
    setSubdomainCheck({ isChecking: true, isAvailable: null, message: 'Checking availability...' });
    try {
      const { data, error } = await supabase
        .from('academies')
        .select('id')
        .eq('subdomain', subdomain)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      const isAvailable = !data;
      setSubdomainCheck({
        isChecking: false,
        isAvailable,
        message: isAvailable ? 'Subdomain is available!' : 'Subdomain is already taken'
      });
    } catch (error: any) {
      setSubdomainCheck({
        isChecking: false,
        isAvailable: false,
        message: 'Error checking subdomain availability'
      });
    }
  };

  const onSubdomainChange = (value: string) => {
    const lowercaseValue = value.toLowerCase();
    form.setValue('academySubdomain', lowercaseValue);
    // Debounce the availability check
    const timeoutId = setTimeout(() => {
      checkSubdomainAvailability(lowercaseValue);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const selectAllModules = () => {
    form.setValue('modules', availableModules.map(m => m.id));
  };

  const deselectAllModules = () => {
    form.setValue('modules', []);
  };

  const createDefaultContent = async (academyId: string, values: CreateAcademyFormValues) => {
    try {
      // Create default homepage content
      await supabase.from('public_pages').insert({
        academy_id: academyId,
        slug: 'homepage',
        title: values.academyName,
        content: {
          subtitle: values.websiteConfig.welcomeMessage,
          heroImage: null,
          sections: []
        },
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Create default about page
      await supabase.from('public_pages').insert({
        academy_id: academyId,
        slug: 'about-us',
        title: 'About Us',
        content: {
          description: values.websiteConfig.aboutDescription,
          mission: 'To develop exceptional football talent while building character and leadership.',
          vision: 'To be the premier football academy producing world-class players and citizens.',
          values: ['Excellence', 'Integrity', 'Teamwork', 'Dedication', 'Respect']
        },
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Create website settings
      await supabase.from('website_settings').insert({
        academy_id: academyId,
        template: values.websiteConfig.template,
        primary_color: values.websiteConfig.primaryColor,
        contact_email: values.websiteConfig.contactEmail,
        contact_phone: values.websiteConfig.contactPhone,
        address: values.websiteConfig.address,
        social_media: {},
        seo_settings: {
          title: values.academyName,
          description: values.websiteConfig.welcomeMessage,
          keywords: 'football academy, soccer training, youth sports'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log('Default content created successfully');
    } catch (error) {
      console.error('Error creating default content:', error);
    }
  };

  const onSubmit = async (values: CreateAcademyFormValues) => {
    try {
      // Final subdomain check
      if (subdomainCheck.isAvailable === false) {
        toast({
          title: 'Subdomain Not Available',
          description: 'Please choose a different subdomain.',
          variant: 'destructive',
        });
        return;
      }

      // Convert the array of module IDs into a JSON object
      const modulesObject = values.modules.reduce((acc, moduleId) => {
        acc[moduleId] = true;
        return acc;
      }, {} as Record<string, boolean>);

      const { data: newAcademy, error } = await supabase.rpc('create_new_academy', {
        academy_name: values.academyName,
        academy_subdomain: values.academySubdomain,
        admin_full_name: values.adminFullName,
        admin_email: values.adminEmail,
        admin_password: values.adminPassword,
        modules_config: modulesObject,
      });

      if (error) throw error;

      // Create default public content
      await createDefaultContent(newAcademy.id, values);

      const createdAcademyInfo: CreatedAcademyInfo = {
        id: newAcademy.id,
        name: values.academyName,
        subdomain: values.academySubdomain,
        adminEmail: values.adminEmail,
        publicUrl: `${window.location.origin}/site/${values.academySubdomain}`,
        adminUrl: `${window.location.origin}/login`,
      };

      toast({
        title: 'Success!',
        description: `Academy "${values.academyName}" created successfully with public website!`,
      });

      setLastCreatedAcademy(createdAcademyInfo);
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
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isPlatformAdmin()) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to view this page.
              {profile && (
                <div className="mt-2 text-sm">
                  Current role: {profile.role || 'No role assigned'}
                </div>
              )}
            </CardDescription>
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
      {lastCreatedAcademy ? (
        <Card className="w-full max-w-3xl text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Academy Created Successfully!</CardTitle>
            <CardDescription className="text-lg">
              "{lastCreatedAcademy.name}" is now live and ready to use.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <p className="font-semibold text-blue-900">Public Website</p>
                <a
                  href={lastCreatedAcademy.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {lastCreatedAcademy.publicUrl}
                </a>
              </div>
              <div className="p-4 border rounded-lg bg-green-50">
                <p className="font-semibold text-green-900">Admin Login</p>
                <a
                  href={lastCreatedAcademy.adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  {lastCreatedAcademy.adminUrl}
                </a>
              </div>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Admin Login Credentials:</strong>
                <br />
                Email: {lastCreatedAcademy.adminEmail}
                <br />
                Password: (as provided during creation)
              </AlertDescription>
            </Alert>
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="font-semibold mb-3">Next Steps:</p>
              <ul className="list-disc list-inside text-left space-y-2 text-sm">
                <li>Login to the admin panel and customize your academy settings</li>
                <li>Upload your academy logo and update branding</li>
                <li>Add team members, coaches, and staff information</li>
                <li>Create additional public pages and content</li>
                <li>Set up registration forms and payment processing</li>
                <li>Configure email notifications and communication settings</li>
              </ul>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setLastCreatedAcademy(null)} variant="outline">
                Create Another Academy
              </Button>
              <Button asChild>
                <a href={lastCreatedAcademy.adminUrl} target="_blank" rel="noopener noreferrer">
                  Go to Admin Panel
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Football Academy</CardTitle>
            <CardDescription>
              Set up a complete football academy with admin panel and public website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Academy Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Academy Details</h3>
                  <FormField
                    control={form.control}
                    name="academyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academy Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Tecno Football Academy" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be displayed on your public website and admin panel.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="academySubdomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subdomain *</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input 
                              placeholder="e.g., tecno-football" 
                              {...field}
                              onChange={(e) => onSubdomainChange(e.target.value)}
                            />
                            <div className="text-sm text-gray-600">
                              Your website will be: <code>{window.location.origin}/site/{field.value || 'your-subdomain'}</code>
                            </div>
                            {subdomainCheck.message && (
                              <div className={`flex items-center gap-2 text-sm ${
                                subdomainCheck.isAvailable === true ? 'text-green-600' : 
                                subdomainCheck.isAvailable === false ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {subdomainCheck.isChecking ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : subdomainCheck.isAvailable === true ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : subdomainCheck.isAvailable === false ? (
                                  <AlertCircle className="h-3 w-3" />
                                ) : null}
                                {subdomainCheck.message}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Only lowercase letters, numbers, and hyphens allowed. Must be unique.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Admin User Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Initial Admin User</h3>
                  <FormField
                    control={form.control}
                    name="adminFullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="e.g., admin@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          This email will be used to login to the admin panel.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adminPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Password *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="********" 
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Must contain at least 8 characters with uppercase, lowercase, and numbers.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Website Configuration Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Public Website Setup</h3>
                  <FormField
                    control={form.control}
                    name="websiteConfig.template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website Template *</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {websiteTemplates.map((template) => (
                              <div
                                key={template.id}
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                  field.value === template.id 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => field.onChange(template.id)}
                              >
                                <div className="flex items-center space-x-2 mb-2">
                                  <input
                                    type="radio"
                                    checked={field.value === template.id}
                                    onChange={() => field.onChange(template.id)}
                                    className="text-blue-600"
                                  />
                                  <span className="font-medium">{template.name}</span>
                                </div>
                                <p className="text-sm text-gray-600">{template.description}</p>
                                <div 
                                  className="w-full h-4 rounded mt-2" 
                                  style={{ backgroundColor: template.primaryColor }}
                                ></div>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="websiteConfig.welcomeMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Welcome Message *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Welcome to our Football Academy where champions are made!"
                            className="resize-none"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          This will appear as the main headline on your homepage.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="websiteConfig.aboutDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your academy's mission, values, and what makes it special..."
                            className="resize-none"
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          This will appear on your About Us page.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="websiteConfig.contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@academy.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="websiteConfig.contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="websiteConfig.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academy Address *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="123 Sports Complex Drive, City, State 12345"
                            className="resize-none"
                            rows={2}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Modules Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold border-b pb-2 flex-1">Enabled Modules</h3>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={selectAllModules}
                      >
                        Select All
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={deselectAllModules}
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="modules"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {availableModules.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="modules"
                              render={({ field }) => (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 border rounded-lg p-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== item.id)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="font-medium cursor-pointer">
                                      {item.label}
                                    </FormLabel>
                                    <FormDescription className="text-xs">
                                      {item.description}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting || subdomainCheck.isAvailable === false} 
                  className="w-full h-12 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Academy...
                    </>
                  ) : (
                    'Create Academy & Website'
                  )}
                </Button>

                {Object.keys(form.formState.errors).length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please fix the errors above before submitting.
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateAcademyPage;
