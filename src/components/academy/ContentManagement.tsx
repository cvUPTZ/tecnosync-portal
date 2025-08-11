import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Save, 
  Plus, 
  Trash, 
  Eye, 
  EyeOff, 
  MoveUp, 
  MoveDown,
  Type,
  Image,
  Video,
  Layout,
  Users,
  MapPin
} from 'lucide-react';

interface ContentSection {
  id: string;
  type: 'hero' | 'about' | 'features' | 'team' | 'gallery' | 'contact' | 'custom';
  title: string;
  content: any;
  isVisible: boolean;
  order: number;
}

interface ContentManagementProps {
  academyId: string;
  pageSlug: string;
  onContentUpdate: (content: any) => void;
}

const ContentManagement: React.FC<ContentManagementProps> = ({
  academyId,
  pageSlug,
  onContentUpdate
}) => {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPageContent();
  }, [academyId, pageSlug]);

  const loadPageContent = async () => {
    try {
      const { data, error } = await supabase
        .from('public_pages')
        .select('*')
        .eq('academy_id', academyId)
        .eq('slug', pageSlug)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.content) {
        // Convert existing content to sections format
        const existingSections = convertContentToSections(data.content);
        setSections(existingSections);
      } else {
        // Create default sections for new page
        setSections(getDefaultSections());
      }
    } catch (error: any) {
      toast.error('Failed to load page content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const convertContentToSections = (content: any): ContentSection[] => {
    const sections: ContentSection[] = [];
    
    // Hero section
    if (content.hero_title || content.hero_subtitle) {
      sections.push({
        id: 'hero',
        type: 'hero',
        title: 'Hero Section',
        content: {
          title: content.hero_title || '',
          subtitle: content.hero_subtitle || '',
          description: content.hero_description || '',
          background_image: content.hero_background || '',
          cta_text: content.cta_text || '',
          cta_link: content.cta_link || ''
        },
        isVisible: true,
        order: 1
      });
    }

    // Features section
    if (content.features) {
      sections.push({
        id: 'features',
        type: 'features',
        title: 'Features Section',
        content: {
          title: 'Our Features',
          features: content.features || []
        },
        isVisible: true,
        order: 2
      });
    }

    // About section
    if (content.introduction || content.mission) {
      sections.push({
        id: 'about',
        type: 'about',
        title: 'About Section',
        content: {
          introduction: content.introduction || '',
          mission: content.mission || '',
          vision: content.vision || '',
          values: content.values || []
        },
        isVisible: true,
        order: 3
      });
    }

    return sections;
  };

  const getDefaultSections = (): ContentSection[] => [
    {
      id: 'hero',
      type: 'hero',
      title: 'Hero Section',
      content: {
        title: 'Welcome to Our Academy',
        subtitle: 'Excellence in Sports Training',
        description: 'Join us for world-class training and development',
        background_image: '',
        cta_text: 'Get Started',
        cta_link: '#contact'
      },
      isVisible: true,
      order: 1
    },
    {
      id: 'about',
      type: 'about',
      title: 'About Section',
      content: {
        introduction: 'Welcome to our academy...',
        mission: 'Our mission is...',
        vision: 'Our vision is...',
        values: ['Excellence', 'Integrity', 'Teamwork']
      },
      isVisible: true,
      order: 2
    },
    {
      id: 'features',
      type: 'features',
      title: 'Features Section',
      content: {
        title: 'Why Choose Us',
        features: [
          { title: 'Professional Coaching', description: 'Expert trainers with years of experience' },
          { title: 'Modern Facilities', description: 'State-of-the-art equipment and facilities' },
          { title: 'Flexible Programs', description: 'Programs for all ages and skill levels' }
        ]
      },
      isVisible: true,
      order: 3
    }
  ];

  const saveContent = async () => {
    try {
      setSaving(true);
      
      // Convert sections back to content format
      const content = convertSectionsToContent(sections);
      
      const { error } = await supabase
        .from('public_pages')
        .upsert(
          {
            academy_id: academyId,
            slug: pageSlug,
            title: pageSlug === 'homepage' ? 'Home' : 'About Us',
            content,
            is_published: true
          },
          { onConflict: 'academy_id,slug' }
        );

      if (error) throw error;

      toast.success('Content saved successfully!');
      onContentUpdate(content);
    } catch (error: any) {
      toast.error('Failed to save content: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const convertSectionsToContent = (sections: ContentSection[]) => {
    const content: any = {};
    
    sections.forEach(section => {
      if (!section.isVisible) return;
      
      switch (section.type) {
        case 'hero':
          content.hero_title = section.content.title;
          content.hero_subtitle = section.content.subtitle;
          content.hero_description = section.content.description;
          content.hero_background = section.content.background_image;
          content.cta_text = section.content.cta_text;
          content.cta_link = section.content.cta_link;
          break;
        case 'about':
          content.introduction = section.content.introduction;
          content.mission = section.content.mission;
          content.vision = section.content.vision;
          content.values = section.content.values;
          break;
        case 'features':
          content.features = section.content.features;
          break;
      }
    });
    
    return content;
  };

  const addSection = (type: ContentSection['type']) => {
    const newSection: ContentSection = {
      id: `${type}-${Date.now()}`,
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      content: getDefaultContentForType(type),
      isVisible: true,
      order: sections.length + 1
    };
    
    setSections([...sections, newSection]);
  };

  const getDefaultContentForType = (type: ContentSection['type']) => {
    switch (type) {
      case 'hero':
        return {
          title: 'New Hero Title',
          subtitle: 'Subtitle',
          description: 'Description',
          background_image: '',
          cta_text: 'Call to Action',
          cta_link: '#'
        };
      case 'about':
        return {
          introduction: 'Introduction text...',
          mission: 'Our mission...',
          vision: 'Our vision...',
          values: ['Value 1', 'Value 2', 'Value 3']
        };
      case 'features':
        return {
          title: 'Features Title',
          features: [
            { title: 'Feature 1', description: 'Description 1' },
            { title: 'Feature 2', description: 'Description 2' }
          ]
        };
      case 'gallery':
        return {
          title: 'Gallery',
          images: []
        };
      case 'contact':
        return {
          title: 'Contact Us',
          address: '',
          phone: '',
          email: '',
          map_embed: ''
        };
      default:
        return {};
    }
  };

  const updateSection = (id: string, updates: Partial<ContentSection>) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, ...updates } : section
    ));
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(section => section.id === id);
    if (index === -1) return;

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < sections.length) {
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      setSections(newSections);
    }
  };

  const renderSectionEditor = (section: ContentSection) => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={section.content.title || ''}
                  onChange={(e) => updateSection(section.id, {
                    content: { ...section.content, title: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input
                  value={section.content.subtitle || ''}
                  onChange={(e) => updateSection(section.id, {
                    content: { ...section.content, subtitle: e.target.value }
                  })}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={section.content.description || ''}
                onChange={(e) => updateSection(section.id, {
                  content: { ...section.content, description: e.target.value }
                })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CTA Button Text</Label>
                <Input
                  value={section.content.cta_text || ''}
                  onChange={(e) => updateSection(section.id, {
                    content: { ...section.content, cta_text: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>CTA Link</Label>
                <Input
                  value={section.content.cta_link || ''}
                  onChange={(e) => updateSection(section.id, {
                    content: { ...section.content, cta_link: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4">
            <div>
              <Label>Introduction</Label>
              <Textarea
                value={section.content.introduction || ''}
                onChange={(e) => updateSection(section.id, {
                  content: { ...section.content, introduction: e.target.value }
                })}
                rows={3}
              />
            </div>
            <div>
              <Label>Mission</Label>
              <Textarea
                value={section.content.mission || ''}
                onChange={(e) => updateSection(section.id, {
                  content: { ...section.content, mission: e.target.value }
                })}
                rows={2}
              />
            </div>
            <div>
              <Label>Vision</Label>
              <Textarea
                value={section.content.vision || ''}
                onChange={(e) => updateSection(section.id, {
                  content: { ...section.content, vision: e.target.value }
                })}
                rows={2}
              />
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-4">
            <div>
              <Label>Section Title</Label>
              <Input
                value={section.content.title || ''}
                onChange={(e) => updateSection(section.id, {
                  content: { ...section.content, title: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>Features</Label>
              {section.content.features?.map((feature: any, index: number) => (
                <div key={index} className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    placeholder="Feature title"
                    value={feature.title || ''}
                    onChange={(e) => {
                      const newFeatures = [...section.content.features];
                      newFeatures[index] = { ...feature, title: e.target.value };
                      updateSection(section.id, {
                        content: { ...section.content, features: newFeatures }
                      });
                    }}
                  />
                  <Input
                    placeholder="Feature description"
                    value={feature.description || ''}
                    onChange={(e) => {
                      const newFeatures = [...section.content.features];
                      newFeatures[index] = { ...feature, description: e.target.value };
                      updateSection(section.id, {
                        content: { ...section.content, features: newFeatures }
                      });
                    }}
                  />
                </div>
              )) || []}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newFeatures = [...(section.content.features || []), { title: '', description: '' }];
                  updateSection(section.id, {
                    content: { ...section.content, features: newFeatures }
                  });
                }}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Feature
              </Button>
            </div>
          </div>
        );

      default:
        return <div>Editor for {section.type} not implemented yet</div>;
    }
  };

  if (loading) {
    return <div>Loading content...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Content Management</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => addSection('hero')}>
            <Plus className="w-4 h-4 mr-1" />
            Add Section
          </Button>
          <Button onClick={saveContent} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Content'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card key={section.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <Badge variant={section.isVisible ? 'default' : 'secondary'}>
                    {section.isVisible ? 'Visible' : 'Hidden'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateSection(section.id, { isVisible: !section.isVisible })}
                  >
                    {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveSection(section.id, 'up')}
                    disabled={index === 0}
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveSection(section.id, 'down')}
                    disabled={index === sections.length - 1}
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSection(section.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderSectionEditor(section)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContentManagement;