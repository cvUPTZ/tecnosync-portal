import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Save, Eye, Settings, Palette, Layout, Type } from 'lucide-react';
import ThemeCustomization from '@/components/academy/ThemeCustomization';
import ContentManagement from '@/components/academy/ContentManagement';

interface PublicPage {
  id: string;
  slug: string;
  title: string;
  content: any;
  is_published: boolean;
  updated_at: string;
  meta_description?: string;
}

interface WebsiteSettings {
  id?: string;
  academy_id: string;
  template: string;
  primary_color: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  social_media?: any;
  seo_settings?: any;
  custom_css?: string;
  analytics_code?: string;
}

const WebsiteContentManagement = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pages, setPages] = useState<PublicPage[]>([]);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(null);
  const [selectedPage, setSelectedPage] = useState<PublicPage | null>(null);
  const [pageContent, setPageContent] = useState({
    title: '',
    content: {},
    meta_description: '',
    is_published: true
  });
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.academy_id) {
      setLoading(false);
      return;
    }
    const loadAll = async () => {
      try {
        await Promise.all([loadPages(), loadWebsiteSettings()]);
        const { data } = await supabase
          .from('academies')
          .select('subdomain')
          .eq('id', profile.academy_id)
          .maybeSingle();
        if (data?.subdomain) setSubdomain(data.subdomain);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [profile?.academy_id]);

  const loadPages = async () => {
    if (!profile?.academy_id) return;
    
    try {
      const { data, error } = await supabase
        .from('public_pages')
        .select('*')
        .eq('academy_id', profile.academy_id)
        .order('slug');

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      toast.error('Failed to load pages: ' + error.message);
    }
  };

  const loadWebsiteSettings = async () => {
    if (!profile?.academy_id) return;

    try {
      const { data, error } = await supabase
        .from('website_settings')
        .select('*')
        .eq('academy_id', profile.academy_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setWebsiteSettings(data || null);
      } catch (error: any) {
        toast.error('Failed to load website settings: ' + error.message);
      }
  };

  const saveWebsiteSettings = async () => {
    if (!profile?.academy_id || !websiteSettings) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('website_settings')
        .upsert({
          academy_id: profile.academy_id,
          ...websiteSettings
        });

      if (error) throw error;
      toast.success('Website settings saved successfully!');
    } catch (error: any) {
      toast.error('Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const savePageContent = async () => {
    if (!profile?.academy_id || !selectedPage) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('public_pages')
        .update({
          title: pageContent.title,
          content: pageContent.content,
          meta_description: pageContent.meta_description,
          is_published: pageContent.is_published,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPage.id);

      if (error) throw error;
      
      toast.success('Page content saved successfully!');
      setSelectedPage(null);
      loadPages();
    } catch (error: any) {
      toast.error('Failed to save page: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (selectedPage) {
      setPageContent({
        title: selectedPage.title,
        content: selectedPage.content || {},
        meta_description: selectedPage.meta_description || '',
        is_published: selectedPage.is_published
      });
    }
  }, [selectedPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading website content management...</p>
        </div>
      </div>
    );
  }

  if (!profile?.academy_id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">No academy access found. Please ensure you are logged in.</p>
        </div>
      </div>
    );
  }

  const previewUrl = subdomain
    ? `${window.location.origin}/site/${subdomain}`
    : `${window.location.origin}/site/academy`;


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Website Content Management</h1>
          <p className="text-muted-foreground">
            Manage your academy's public website content, theme, and settings
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={previewUrl} target="_blank" rel="noopener noreferrer">
            <Eye className="w-4 h-4 mr-2" />
            Preview Website
          </a>
        </Button>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="content">
            <Layout className="w-4 h-4 mr-1" />
            Content
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="w-4 h-4 mr-1" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <ContentManagement
            academyId={profile?.academy_id || ''}
            pageSlug="homepage"
            onContentUpdate={(content) => {
              toast.success('Content updated successfully!');
              loadPages();
            }}
          />
        </TabsContent>

        <TabsContent value="theme">
          <ThemeCustomization
            academyId={profile?.academy_id || ''}
            currentSettings={websiteSettings}
            onSettingsUpdate={(settings) => {
              setWebsiteSettings(settings);
              toast.success('Theme updated successfully!');
            }}
          />
        </TabsContent>

        <TabsContent value="pages">
          <div className="grid gap-6">
            {pages.map((page) => (
              <Card key={page.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="capitalize">{page.slug.replace('-', ' ')}</CardTitle>
                      <CardDescription>
                        Last updated: {new Date(page.updated_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={page.is_published ? "default" : "secondary"}>
                        {page.is_published ? "Published" : "Draft"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPage(page)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {page.meta_description || "No description available"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Website Settings</CardTitle>
              <CardDescription>Configure your academy's website settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={websiteSettings?.contact_email || ''}
                    onChange={(e) => setWebsiteSettings(prev => prev ? {...prev, contact_email: e.target.value} : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="contact-phone">Contact Phone</Label>
                  <Input
                    id="contact-phone"
                    value={websiteSettings?.contact_phone || ''}
                    onChange={(e) => setWebsiteSettings(prev => prev ? {...prev, contact_phone: e.target.value} : null)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={websiteSettings?.address || ''}
                  onChange={(e) => setWebsiteSettings(prev => prev ? {...prev, address: e.target.value} : null)}
                />
              </div>
              <div>
                <Label htmlFor="logo-url">Logo URL</Label>
                <Input
                  id="logo-url"
                  value={websiteSettings?.logo_url || ''}
                  onChange={(e) => setWebsiteSettings(prev => prev ? {...prev, logo_url: e.target.value} : null)}
                />
              </div>
              <Button onClick={saveWebsiteSettings} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize your website for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={websiteSettings?.seo_settings?.meta_title || ''}
                  onChange={(e) => setWebsiteSettings(prev => prev ? {
                    ...prev,
                    seo_settings: { ...prev.seo_settings, meta_title: e.target.value }
                  } : null)}
                />
              </div>
              <div>
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={websiteSettings?.seo_settings?.meta_description || ''}
                  onChange={(e) => setWebsiteSettings(prev => prev ? {
                    ...prev,
                    seo_settings: { ...prev.seo_settings, meta_description: e.target.value }
                  } : null)}
                />
              </div>
              <div>
                <Label htmlFor="meta-keywords">Meta Keywords (comma separated)</Label>
                <Input
                  id="meta-keywords"
                  value={websiteSettings?.seo_settings?.meta_keywords || ''}
                  onChange={(e) => setWebsiteSettings(prev => prev ? {
                    ...prev,
                    seo_settings: { ...prev.seo_settings, meta_keywords: e.target.value }
                  } : null)}
                />
              </div>
              <Button onClick={saveWebsiteSettings} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save SEO Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Website Preview</CardTitle>
              <CardDescription>Preview how your website looks to visitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title="Website Preview"
                />
              </div>
              <div className="mt-4 flex justify-center">
                <Button asChild>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                    Open in New Tab
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Page Editor Modal */}
      {selectedPage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Page: {selectedPage.title}</CardTitle>
              <CardDescription>Update the content for this page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="page-title">Page Title</Label>
                <Input
                  id="page-title"
                  value={pageContent.title}
                  onChange={(e) => setPageContent(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="meta-desc">Meta Description</Label>
                <Textarea
                  id="meta-desc"
                  value={pageContent.meta_description}
                  onChange={(e) => setPageContent(prev => ({ ...prev, meta_description: e.target.value }))}
                />
              </div>
              <div>
                <Label>Published Status</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    checked={pageContent.is_published}
                    onChange={(e) => setPageContent(prev => ({ ...prev, is_published: e.target.checked }))}
                  />
                  <span>Published</span>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedPage(null)}>
                  Cancel
                </Button>
                <Button onClick={savePageContent} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Page'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WebsiteContentManagement;