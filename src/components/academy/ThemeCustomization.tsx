import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, Palette, Layout, Settings, Monitor, Smartphone } from 'lucide-react';

interface ThemeCustomizationProps {
  academyId: string;
  currentSettings: any;
  onSettingsUpdate: (settings: any) => void;
}

const ThemeCustomization: React.FC<ThemeCustomizationProps> = ({
  academyId,
  currentSettings,
  onSettingsUpdate
}) => {
  const [settings, setSettings] = useState(currentSettings || {});
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('website_settings')
        .upsert({ 
          academy_id: academyId,
          ...settings 
        });

      if (error) throw error;

      toast.success('Theme settings saved successfully!');
      onSettingsUpdate(settings);
    } catch (error: any) {
      toast.error('Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const colorPresets = [
    { name: 'Ocean Blue', primary: '#0ea5e9', secondary: '#06b6d4' },
    { name: 'Forest Green', primary: '#10b981', secondary: '#059669' },
    { name: 'Sunset Orange', primary: '#f97316', secondary: '#ea580c' },
    { name: 'Royal Purple', primary: '#8b5cf6', secondary: '#7c3aed' },
    { name: 'Rose Red', primary: '#e11d48', secondary: '#be123c' },
    { name: 'Slate Gray', primary: '#64748b', secondary: '#475569' }
  ];

  const fontOptions = [
    { name: 'Modern Sans', value: 'Inter, system-ui, sans-serif' },
    { name: 'Classic Serif', value: 'Georgia, "Times New Roman", serif' },
    { name: 'Display', value: '"Playfair Display", serif' },
    { name: 'Mono', value: '"JetBrains Mono", monospace' }
  ];

  return (
    <div className="space-y-6">
      {/* Preview Mode Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Theme Customization</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('desktop')}
          >
            <Monitor className="w-4 h-4 mr-1" />
            Desktop
          </Button>
          <Button
            variant={previewMode === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('mobile')}
          >
            <Smartphone className="w-4 h-4 mr-1" />
            Mobile
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors">
            <Palette className="w-4 h-4 mr-1" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="layout">
            <Layout className="w-4 h-4 mr-1" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Settings className="w-4 h-4 mr-1" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>Customize your academy's brand colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Color Presets */}
              <div>
                <Label className="text-sm font-medium">Quick Presets</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setSettings({
                        ...settings,
                        primary_color: preset.primary,
                        secondary_color: preset.secondary
                      })}
                      className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex gap-1">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.secondary }}
                        />
                      </div>
                      <span className="text-xs">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Custom Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="primary-color"
                      type="color"
                      value={settings.primary_color || '#1e40af'}
                      onChange={(e) => setSettings({
                        ...settings,
                        primary_color: e.target.value
                      })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={settings.primary_color || '#1e40af'}
                      onChange={(e) => setSettings({
                        ...settings,
                        primary_color: e.target.value
                      })}
                      placeholder="#1e40af"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={settings.secondary_color || '#0ea5e9'}
                      onChange={(e) => setSettings({
                        ...settings,
                        secondary_color: e.target.value
                      })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={settings.secondary_color || '#0ea5e9'}
                      onChange={(e) => setSettings({
                        ...settings,
                        secondary_color: e.target.value
                      })}
                      placeholder="#0ea5e9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Customize fonts and text styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="font-family">Font Family</Label>
                <select
                  id="font-family"
                  value={settings.font_family || fontOptions[0].value}
                  onChange={(e) => setSettings({
                    ...settings,
                    font_family: e.target.value
                  })}
                  className="w-full p-2 border rounded-md"
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="heading-scale">Heading Scale</Label>
                  <select
                    id="heading-scale"
                    value={settings.heading_scale || 'normal'}
                    onChange={(e) => setSettings({
                      ...settings,
                      heading_scale: e.target.value
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="small">Small</option>
                    <option value="normal">Normal</option>
                    <option value="large">Large</option>
                    <option value="xl">Extra Large</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="body-size">Body Text Size</Label>
                  <select
                    id="body-size"
                    value={settings.body_size || 'normal'}
                    onChange={(e) => setSettings({
                      ...settings,
                      body_size: e.target.value
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="small">Small</option>
                    <option value="normal">Normal</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
              <CardDescription>Configure layout and spacing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template">Template Style</Label>
                <select
                  id="template"
                  value={settings.template || 'classic'}
                  onChange={(e) => setSettings({
                    ...settings,
                    template: e.target.value
                  })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                  <option value="minimal">Minimal</option>
                  <option value="dynamic">Dynamic</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="container-width">Container Width</Label>
                  <select
                    id="container-width"
                    value={settings.container_width || 'normal'}
                    onChange={(e) => setSettings({
                      ...settings,
                      container_width: e.target.value
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="narrow">Narrow</option>
                    <option value="normal">Normal</option>
                    <option value="wide">Wide</option>
                    <option value="full">Full Width</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="section-spacing">Section Spacing</Label>
                  <select
                    id="section-spacing"
                    value={settings.section_spacing || 'normal'}
                    onChange={(e) => setSettings({
                      ...settings,
                      section_spacing: e.target.value
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="tight">Tight</option>
                    <option value="normal">Normal</option>
                    <option value="loose">Loose</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Custom CSS and advanced configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="custom-css">Custom CSS</Label>
                <Textarea
                  id="custom-css"
                  value={settings.custom_css || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    custom_css: e.target.value
                  })}
                  placeholder="/* Add your custom CSS here */"
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="analytics-code">Analytics Code</Label>
                <Textarea
                  id="analytics-code"
                  value={settings.analytics_code || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    analytics_code: e.target.value
                  })}
                  placeholder="<!-- Google Analytics or other tracking code -->"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Theme Settings'}
        </Button>
      </div>
    </div>
  );
};

export default ThemeCustomization;