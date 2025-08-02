import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Trash2 } from 'lucide-react';

const homePageSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  content: z.object({
    subtitle: z.string().optional(),
  }),
});

const aboutPageSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  hero_image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  content: z.object({
    introduction: z.string().min(10, 'Introduction is required'),
    mission: z.string().optional(),
    vision: z.string().optional(),
  }),
});

const teamMemberSchema = z.object({
  id: z.string().uuid().optional(),
  full_name: z.string().min(3, 'Name is required'),
  position: z.string().min(2, 'Position is required'),
  bio: z.string().optional(),
  photo_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const websiteContentSchema = z.object({
  homePage: homePageSchema,
  aboutPage: aboutPageSchema,
  teamMembers: z.array(teamMemberSchema),
});

type WebsiteContentFormValues = z.infer<typeof websiteContentSchema>;

const WebsiteContentManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<WebsiteContentFormValues>({
    resolver: zodResolver(websiteContentSchema),
    defaultValues: {
      homePage: {
        title: '',
        content: { subtitle: '' },
      },
      aboutPage: {
        title: '',
        hero_image_url: '',
        content: { introduction: '', mission: '', vision: '' },
      },
      teamMembers: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "teamMembers",
  });

  useEffect(() => {
    fetchWebsiteContent();
  }, []);

  const fetchWebsiteContent = async () => {
    if (!profile?.academy_id) return;
    setLoading(true);
    try {
      // Fetch Homepage and About Us pages
      const { data: pagesData, error: pagesError } = await supabase
        .from('public_pages')
        .select('*')
        .eq('academy_id', profile.academy_id)
        .in('slug', ['homepage', 'about-us']);

      if (pagesError) throw pagesError;

      const homePageData = pagesData.find(p => p.slug === 'homepage');
      const aboutPageData = pagesData.find(p => p.slug === 'about-us');

      if (homePageData) {
        form.setValue('homePage', {
          title: homePageData.title,
          content: homePageData.content ? homePageData.content : { subtitle: '' },
        });
      }
      if (aboutPageData) {
        form.setValue('aboutPage', {
          title: aboutPageData.title,
          hero_image_url: aboutPageData.hero_image_url || '',
          content: aboutPageData.content ? aboutPageData.content : { introduction: '', mission: '', vision: '' },
        });
      }

      // Fetch team members
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('academy_id', profile.academy_id)
        .order('display_order');

      if (teamError) throw teamError;

      if (teamData) {
        form.setValue('teamMembers', teamData);
      }

    } catch (error) {
      console.error('Error fetching website content:', error);
      toast({ title: 'Error', description: 'Failed to fetch website content.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: WebsiteContentFormValues) => {
    if (!profile?.academy_id) return;
    setSaving(true);
    try {
      // Upsert Homepage and About Us pages
      const pagesToUpsert = [
        {
          academy_id: profile.academy_id,
          slug: 'homepage',
          title: values.homePage.title,
          content: values.homePage.content,
          updated_at: new Date().toISOString(),
        },
        {
          academy_id: profile.academy_id,
          slug: 'about-us',
          title: values.aboutPage.title,
          hero_image_url: values.aboutPage.hero_image_url,
          content: values.aboutPage.content,
          updated_at: new Date().toISOString(),
        }
      ];

      const { error: pageError } = await supabase
        .from('public_pages')
        .upsert(pagesToUpsert, { onConflict: 'academy_id, slug' });

      if (pageError) throw pageError;

      // Upsert Team Members
      const { error: teamError } = await supabase
        .from('team_members')
        .upsert(
          values.teamMembers.map((member, index) => ({
            id: member.id, // Let Supabase handle create vs update
            academy_id: profile.academy_id,
            full_name: member.full_name,
            position: member.position,
            bio: member.bio,
            photo_url: member.photo_url,
            display_order: index,
          }))
        );

      if (teamError) throw teamError;

      toast({ title: 'Success', description: 'Website content saved successfully.' });
      fetchWebsiteContent(); // Refresh data

    } catch (error) {
      console.error('Error saving website content:', error);
      toast({ title: 'Error', description: 'Failed to save website content.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading website content editor...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Website Content</h1>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>

        <Tabs defaultValue="homepage">
          <TabsList>
            <TabsTrigger value="homepage">Homepage</TabsTrigger>
            <TabsTrigger value="about-page">About Us Page</TabsTrigger>
            <TabsTrigger value="team-members">Team Members</TabsTrigger>
          </TabsList>

          <TabsContent value="homepage">
            <Card>
              <CardHeader>
                <CardTitle>Edit Homepage</CardTitle>
                <CardDescription>Set the main title and subtitle for your academy's public homepage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="homePage.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Homepage Title</FormLabel>
                      <FormControl><Input {...field} placeholder="Welcome to Our Academy" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="homePage.content.subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Homepage Subtitle</FormLabel>
                      <FormControl><Textarea {...field} placeholder="Your home for football excellence." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about-page">
            <Card>
              <CardHeader>
                <CardTitle>Edit "About Us" Page</CardTitle>
                <CardDescription>This content will be displayed on your public website.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="aboutPage.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Title</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aboutPage.hero_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero Image URL</FormLabel>
                      <FormControl><Input {...field} placeholder="https://example.com/image.png" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aboutPage.content.introduction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Introduction</FormLabel>
                      <FormControl><Textarea {...field} rows={5} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="aboutPage.content.mission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Our Mission</FormLabel>
                      <FormControl><Textarea {...field} rows={3} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="aboutPage.content.vision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Our Vision</FormLabel>
                      <FormControl><Textarea {...field} rows={3} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team-members">
            <Card>
              <CardHeader>
                <CardTitle>Manage Team Members</CardTitle>
                <CardDescription>Add, edit, or remove members of your staff.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4 relative">
                    <div className="space-y-4">
                       <FormField
                          control={form.control}
                          name={`teamMembers.${index}.full_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`teamMembers.${index}.position`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`teamMembers.${index}.bio`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Biography</FormLabel>
                              <FormControl><Textarea {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`teamMembers.${index}.photo_url`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Photo URL</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                    <Button type="button" variant="destructive" size="sm" className="absolute top-4 right-4" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ full_name: '', position: '' })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Team Member
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};

export default WebsiteContentManagement;
