// src/pages/Index.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreatingAcademy, setIsCreatingAcademy] = useState(false);
  const [availableModules, setAvailableModules] = useState([
    { id: 'student-management', label: 'إدارة الطلاب', enabled: true },
    { id: 'attendance', label: 'الحضور والانصراف', enabled: true },
    { id: 'finance', label: 'الإدارة المالية', enabled: true },
    { id: 'website', label: 'محتوى الموقع', enabled: true },
    { id: 'schedule', label: 'الجداول والمواعيد', enabled: true },
    { id: 'messages', label: 'الرسائل', enabled: true },
    { id: 'gallery', label: 'المعرض', enabled: true },
    { id: 'documents', label: 'المستندات', enabled: true },
  ]);

  // Public Academy Creation Schema
  const academyCreationSchema = z.object({
    academyName: z.string().min(2, "اسم الأكاديمية مطلوب"),
    subdomain: z.string()
      .min(3, "النطاق الفرعي يجب أن يكون 3 أحرف على الأقل")
      .regex(/^[a-zA-Z0-9-]+$/, "يجب أن يحتوي النطاق الفرعي على أحرف وأرقام وواصلات فقط")
      .refine(async (subdomain) => {
        const { data, error } = await supabase
          .from('academies')
          .select('subdomain')
          .eq('subdomain', subdomain)
          .single();
        return !data;
      }, "هذا النطاق الفرعي غير متاح"),
    contactEmail: z.string().email("بريد إلكتروني غير صالح"),
    contactPhone: z.string().min(10, "رقم الهاتف مطلوب"),
    selectedTemplate: z.string().min(1, "يرجى اختيار قالب للموقع"),
    selectedModules: z.array(z.string()).min(1, "يرجى اختيار وحدة واحدة على الأقل")
  });

  const form = useForm({
    resolver: zodResolver(academyCreationSchema),
    defaultValues: {
      academyName: "",
      subdomain: "",
      contactEmail: "",
      contactPhone: "",
      selectedTemplate: "default",
      selectedModules: ["student-management", "attendance", "finance", "website"]
    }
  });

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (subdomain.length < 3) return false;
    
    const { data, error } = await supabase
      .from('academies')
      .select('subdomain')
      .eq('subdomain', subdomain)
      .single();
    
    return !data;
  };

  const onSubdomainChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-zA-Z0-9-]/g, '');
    form.setValue('subdomain', value);
    
    if (value.length >= 3) {
      const isAvailable = await checkSubdomainAvailability(value);
      const subdomainStatus = document.getElementById('subdomain-status');
      if (subdomainStatus) {
        subdomainStatus.textContent = isAvailable ? 'متاح' : 'غير متاح';
        subdomainStatus.className = isAvailable ? 'text-green-600 text-sm' : 'text-red-600 text-sm';
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsCreatingAcademy(true);
      
      // Create academy
      const {  academy, error: academyError } = await supabase
        .from('academies')
        .insert([{
          name: data.academyName,
          subdomain: data.subdomain,
          contact_email: data.contactEmail,
          contact_phone: data.contactPhone,
          template: data.selectedTemplate,
          modules: data.selectedModules.reduce((acc: any, moduleId: string) => {
            acc[moduleId] = true;
            return acc;
          }, {}),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (academyError) throw academyError;

      // Create director profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          full_name: data.contactEmail.split('@')[0],
          email: data.contactEmail,
          role: 'director',
          academy_id: academy.id,
          phone: data.contactPhone,
          created_at: new Date().toISOString()
        }]);

      if (profileError) throw profileError;

      // Create default website content
      const defaultContent = {
        hero: {
          title: `مرحباً بأكاديمية ${data.academyName}`,
          subtitle: 'التميز في التدريب الرياضي',
          description: 'انضم إلينا للحصول على تدريب عالمي المستوى والتطوير',
          background_image: '',
          cta_text: 'ابدأ الآن',
          cta_link: '#contact'
        },
        about: {
          introduction: `مرحباً بأكاديمية ${data.academyName}...`,
          mission: 'مهمتنا هي...',
          vision: 'رؤيتنا هي...',
          values: ['التميز', 'النزاهة', 'العمل الجماعي']
        },
        features: {
          title: 'لماذا تختارنا',
          features: [
            { title: 'تدريب عالمي المستوى', description: 'مدربون معتمدون وخبرات دولية' },
            { title: 'برامج متكاملة', description: 'من البراعم إلى الناشئين' },
            { title: 'مرافق متطورة', description: 'ملعب عشبي طبيعي ومعدات حديثة' }
          ]
        }
      };

      const { error: contentError } = await supabase
        .from('website_content')
        .insert([{
          academy_id: academy.id,
          content: defaultContent,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (contentError) console.error('Error creating default content:', contentError);

      toast({
        title: "تم إنشاء الأكاديمية بنجاح",
        description: `تم إنشاء أكاديميتك ${data.academyName}. يمكنك الآن تسجيل الدخول للوحة التحكم.`,
      });

      navigate('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الأكاديمية",
        description: error.message,
      });
    } finally {
      setIsCreatingAcademy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">TecnoFootball</span>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Button variant="outline" asChild>
                <Link to="/login">تسجيل الدخول</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            أنشئ أكاديمية كرة قدم <span className="text-blue-600">احترافية</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            منصة شاملة لإدارة أكاديميات كرة القدم - من الموقع الإلكتروني إلى لوحة التحكم الإدارية
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1540552990290-9e0de118b5b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Football Academy" 
              className="rounded-lg shadow-xl"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">ابدأ رحلتك الآن</h2>
            <p className="text-gray-600 mb-8">
              أنشئ أكاديمية كرة قدم احترافية في دقائق معدودة. اختر اسم نطاقك، وحدد الميزات التي تحتاجها، وابدأ في جذب الطلاب.
            </p>
            
            <Tabs defaultValue="create-academy" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="create-academy">إنشاء أكاديمية</TabsTrigger>
                <TabsTrigger value="admin-login">تسجيل دخول المشرف</TabsTrigger>
              </TabsList>

              <TabsContent value="create-academy">
                <Card>
                  <CardHeader>
                    <CardTitle>إنشاء أكاديمية جديدة</CardTitle>
                    <CardDescription>
                      أكمل النموذج التالي لإنشاء أكاديميتك الخاصة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="academyName">اسم الأكاديمية</Label>
                          <Input
                            id="academyName"
                            {...form.register("academyName")}
                            placeholder="أكاديمية تكنو لكرة القدم"
                          />
                          {form.formState.errors.academyName && (
                            <p className="text-red-600 text-sm mt-1">{form.formState.errors.academyName.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="subdomain">نطاق الموقع (subdomain)</Label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              https://
                            </span>
                            <Input
                              id="subdomain"
                              {...form.register("subdomain")}
                              onChange={onSubdomainChange}
                              placeholder="اسم-أكاديميتك"
                              className="rounded-l-none"
                            />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              .tecnosync.com
                            </span>
                          </div>
                          <div id="subdomain-status" className="mt-1 text-sm"></div>
                          {form.formState.errors.subdomain && (
                            <p className="text-red-600 text-sm mt-1">{form.formState.errors.subdomain.message}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="contactEmail">البريد الإلكتروني</Label>
                            <Input
                              id="contactEmail"
                              type="email"
                              {...form.register("contactEmail")}
                              placeholder="info@academy.com"
                            />
                            {form.formState.errors.contactEmail && (
                              <p className="text-red-600 text-sm mt-1">{form.formState.errors.contactEmail.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="contactPhone">رقم الهاتف</Label>
                            <Input
                              id="contactPhone"
                              {...form.register("contactPhone")}
                              placeholder="+213 XXX XXX XXX"
                            />
                            {form.formState.errors.contactPhone && (
                              <p className="text-red-600 text-sm mt-1">{form.formState.errors.contactPhone.message}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>قالب الموقع</Label>
                        <div className="grid grid-cols-2 gap-4">
                          {['default', 'modern', 'classic'].map((template) => (
                            <div
                              key={template}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                form.watch('selectedTemplate') === template 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => form.setValue('selectedTemplate', template)}
                            >
                              <div className="aspect-video bg-gray-200 rounded mb-2"></div>
                              <p className="text-center text-sm font-medium">
                                {template === 'default' ? 'افتراضي' : 
                                 template === 'modern' ? 'حديث' : 'كلاسيكي'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>الميزات المطلوبة</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {availableModules.map((module) => (
                            <label
                              key={module.id}
                              className={`flex items-center p-2 rounded border cursor-pointer ${
                                !module.enabled ? 'opacity-50 cursor-not-allowed' : ''
                              } ${
                                form.watch('selectedModules').includes(module.id) 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="mr-2"
                                value={module.id}
                                {...form.register("selectedModules")}
                                disabled={!module.enabled}
                              />
                              {module.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={isCreatingAcademy}
                      >
                        {isCreatingAcademy ? 'جاري الإنشاء...' : 'إنشاء الأكاديمية'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="admin-login">
                <Card>
                  <CardHeader>
                    <CardTitle>تسجيل دخول المشرف</CardTitle>
                    <CardDescription>
                      سجل دخول إلى لوحة تحكم أكاديميتك
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input id="email" type="email" placeholder="you@academy.com" />
                      </div>
                      <div>
                        <Label htmlFor="password">كلمة المرور</Label>
                        <Input id="password" type="password" />
                      </div>
                      <Button className="w-full">تسجيل الدخول</Button>
                    </form>
                    <div className="mt-4 text-center">
                      <Link to="/platform-admin/login" className="text-blue-600 hover:underline">
                        تسجيل دخول المشرف العام
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">الميزات الشاملة</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "موقع إلكتروني احترافي",
                description: "موقع ويب متجاوب مصمم خصيصًا لأكاديمية كرة القدم الخاصة بك مع محرر محتوى سهل الاستخدام",
                icon: "🌐"
              },
              {
                title: "إدارة الطلاب",
                description: "تتبع الطلاب، الحضور، الدفع، والبيانات الطبية في مكان واحد",
                icon: "👥"
              },
              {
                title: "لوحة تحكم إدارية",
                description: "واجهة بديهية لإدارة جميع جوانب أكاديميتك من أي مكان",
                icon: "📊"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">الخطط والأسعار</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "الأساسي",
                price: "99",
                period: "شهريًا",
                features: ["موقع إلكتروني", "إدارة الطلاب", "نظام التسجيل", "دعم محدود"]
              },
              {
                name: "الاحترافي",
                price: "199",
                period: "شهريًا",
                features: ["جميع ميزات الخطة الأساسية", "تقارير مالية", "جدولة التدريبات", "دعم أولوي"],
                popular: true
              },
              {
                name: "المؤسسي",
                price: "399",
                period: "شهريًا",
                features: ["جميع الميزات", "نطاق مخصص", "تكامل مع أنظمة خارجية", "دعم مخصص"]
              }
            ].map((plan, index) => (
              <Card key={index} className={plan.popular ? "border-blue-500 shadow-lg" : ""}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{plan.name}</span>
                    {plan.popular && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        الأكثر شيوعًا
                      </span>
                    )}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-600"> {plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={plan.popular ? "w-full bg-blue-600 hover:bg-blue-700" : "w-full"}
                  >
                    البدء
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <footer id="contact" className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="ml-2 text-xl font-bold">TecnoFootball</span>
              </div>
              <p className="text-gray-400">
                منصة إدارة متكاملة لأكاديميات كرة القدم
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">الصفحة الرئيسية</a></li>
                <li><a href="#features" className="hover:text-white">الميزات</a></li>
                <li><a href="#pricing" className="hover:text-white">الأسعار</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">الدعم</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-white">الوثائق</a></li>
                <li><a href="#" className="hover:text-white">اتصل بنا</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">اتصل بنا</h3>
              <div className="space-y-2 text-gray-400">
                <p>الجزائر، الجزائر</p>
                <p>+213 XXX XXX XXX</p>
                <p>info@tecnofootball.dz</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TecnoFootball. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
