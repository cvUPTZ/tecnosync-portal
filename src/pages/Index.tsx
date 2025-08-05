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

  // Simplified Academy Creation Schema (removed async validation)
  const academyCreationSchema = z.object({
    academyName: z.string().min(2, "اسم الأكاديمية مطلوب"),
    subdomain: z.string()
      .min(3, "النطاق الفرعي يجب أن يكون 3 أحرف على الأقل")
      .regex(/^[a-zA-Z0-9-]+$/, "يجب أن يحتوي النطاق الفرعي على أحرف وأرقام وواصلات فقط"),
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
    
    try {
      const { data, error } = await supabase
        .from('academies')
        .select('subdomain')
        .eq('subdomain', subdomain)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // No rows returned, subdomain is available
        return true;
      }
      
      // If data exists, subdomain is taken
      return !data;
    } catch (error) {
      console.error('Error checking subdomain:', error);
      return false;
    }
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
      
      // Check subdomain availability before creating
      const isSubdomainAvailable = await checkSubdomainAvailability(data.subdomain);
      if (!isSubdomainAvailable) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "النطاق الفرعي غير متاح، يرجى اختيار نطاق آخر",
        });
        return;
      }
      
      // Create academy - Fixed destructuring
      const { data: academy, error: academyError } = await supabase
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
          is_active: true
        }])
        .select()
        .single();

      if (academyError) {
        console.error('Academy creation error:', academyError);
        throw new Error(`فشل في إنشاء الأكاديمية: ${academyError.message}`);
      }

      if (!academy) {
        throw new Error('فشل في إنشاء الأكاديمية - لم يتم إرجاع البيانات');
      }

      console.log('Academy created successfully:', academy);

      // Create director profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          full_name: data.contactEmail.split('@')[0],
          email: data.contactEmail,
          role: 'director',
          academy_id: academy.id,
          phone: data.contactPhone
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw here, academy is already created
        console.warn('Academy created but failed to create director profile');
      }

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
          content: defaultContent
        }]);

      if (contentError) {
        console.error('Error creating default content:', contentError);
        // Don't throw here since this is not critical
      }

      toast({
        title: "تم إنشاء الأكاديمية بنجاح",
        description: `تم إنشاء أكاديميتك ${data.academyName}. يمكنك الآن تسجيل الدخول للوحة التحكم.`,
      });

      // Reset form
      form.reset();
      
      navigate('/login');
    } catch (error: any) {
      console.error('Full error:', error);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الأكاديمية",
        description: error.message || 'حدث خطأ غير متوقع',
      });
    } finally {
      setIsCreatingAcademy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 1.5zm0 18a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM6.375 6.375a.75.75 0 011.06 0l1.061 1.061a.75.75 0 01-1.06 1.06L6.375 7.435a.75.75 0 010-1.06zm11.25 11.25a.75.75 0 01-1.06 0l-1.061-1.06a.75.75 0 011.06-1.061l1.06 1.061a.75.75 0 010 1.06zM22.5 12a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM3 12a.75.75 0 01-.75.75H1.5a.75.75 0 010-1.5h.75A.75.75 0 013 12z" />
              </svg>
              <span className="ml-3 text-2xl font-bold text-gray-900">TecnoFootball</span>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            أنشئ أكاديمية كرة قدم <br /> <span className="text-blue-600">احترافية بكل سهولة</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto">
            منصة شاملة ومتكاملة لإدارة أكاديميات كرة القدم، بدءًا من الموقع الإلكتروني وانتهاءً بلوحة التحكم الإدارية.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">ابدأ رحلتك نحو النجاح</h2>
            <p className="text-gray-700 mb-8 text-lg">
              أنشئ أكاديمية كرة قدم احترافية في دقائق. اختر اسم نطاقك، وحدد الميزات التي تحتاجها، وابدأ في استقبال المواهب الجديدة.
            </p>
            
            <Tabs defaultValue="create-academy" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-gray-200 rounded-lg">
                <TabsTrigger value="create-academy" className="py-2.5">إنشاء أكاديمية</TabsTrigger>
                <TabsTrigger value="admin-login" className="py-2.5">تسجيل دخول المشرف</TabsTrigger>
              </TabsList>

              <TabsContent value="create-academy">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">إنشاء أكاديمية جديدة</CardTitle>
                    <CardDescription>
                      املأ النموذج التالي لبدء رحلة أكاديميتك نحو التميز.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="academyName" className="font-semibold">اسم الأكاديمية</Label>
                          <Input
                            id="academyName"
                            {...form.register("academyName")}
                            placeholder="أكاديمية المستقبل لكرة القدم"
                            className="mt-1"
                          />
                          {form.formState.errors.academyName && (
                            <p className="text-red-600 text-sm mt-1">{form.formState.errors.academyName.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="subdomain" className="font-semibold">اختر رابط موقعك (Subdomain)</Label>
                          <div className="flex mt-1">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm">
                              https://
                            </span>
                            <Input
                              id="subdomain"
                              {...form.register("subdomain")}
                              onChange={onSubdomainChange}
                              placeholder="اسم-أكاديميتك"
                              className="rounded-l-none"
                            />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-100 text-gray-600 text-sm">
                              .tecnosync.com
                            </span>
                          </div>
                          <div id="subdomain-status" className="mt-1 text-sm h-4"></div>
                          {form.formState.errors.subdomain && (
                            <p className="text-red-600 text-sm mt-1">{form.formState.errors.subdomain.message}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="contactEmail" className="font-semibold">البريد الإلكتروني</Label>
                            <Input
                              id="contactEmail"
                              type="email"
                              {...form.register("contactEmail")}
                              placeholder="info@academy.com"
                              className="mt-1"
                            />
                            {form.formState.errors.contactEmail && (
                              <p className="text-red-600 text-sm mt-1">{form.formState.errors.contactEmail.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="contactPhone" className="font-semibold">رقم الهاتف</Label>
                            <Input
                              id="contactPhone"
                              {...form.register("contactPhone")}
                              placeholder="+213 XXX XXX XXX"
                              className="mt-1"
                            />
                            {form.formState.errors.contactPhone && (
                              <p className="text-red-600 text-sm mt-1">{form.formState.errors.contactPhone.message}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="font-semibold">اختر قالب الموقع</Label>
                        <div className="grid grid-cols-3 gap-4">
                          {['default', 'modern', 'classic'].map((template) => (
                            <div
                              key={template}
                              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                form.watch('selectedTemplate') === template 
                                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                                  : 'border-gray-200 hover:border-gray-400'
                              }`}
                              onClick={() => form.setValue('selectedTemplate', template)}
                            >
                              <div className="aspect-video bg-gray-200 rounded mb-2"></div>
                              <p className="text-center text-sm font-medium text-gray-700">
                                {template === 'default' ? 'افتراضي' : 
                                 template === 'modern' ? 'حديث' : 'كلاسيكي'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="font-semibold">حدد الميزات المطلوبة</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {availableModules.map((module) => (
                            <label
                              key={module.id}
                              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                                !module.enabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
                              } ${
                                form.watch('selectedModules').includes(module.id) 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-blue-600 rounded mr-3 border-gray-300 focus:ring-blue-500"
                                value={module.id}
                                {...form.register("selectedModules")}
                                disabled={!module.enabled}
                              />
                              <span className="text-gray-800">{module.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full text-lg py-3 bg-blue-600 hover:bg-blue-700"
                        disabled={isCreatingAcademy}
                      >
                        {isCreatingAcademy ? 'جاري الإنشاء...' : 'إنشاء الأكاديمية الآن'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="admin-login">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">تسجيل دخول المشرف</CardTitle>
                    <CardDescription>
                      أدخل بياناتك للوصول إلى لوحة تحكم أكاديميتك.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="email" className="font-semibold">البريد الإلكتروني</Label>
                        <Input id="email" type="email" placeholder="you@academy.com" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="password">كلمة المرور</Label>
                        <Input id="password" type="password" className="mt-1" />
                      </div>
                      <Button className="w-full text-lg py-3">تسجيل الدخول</Button>
                    </form>
                    <div className="mt-6 text-center">
                      <Link to="/platform-admin/login" className="text-sm text-blue-600 hover:underline">
                        تسجيل دخول المشرف العام للمنصة
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div className="order-1 lg:order-2">
            <img 
              src="https://images.unsplash.com/photo-1540552990290-9e0de118b5b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="لاعب كرة قدم شاب" 
              className="rounded-xl shadow-2xl w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-24 bg-white rounded-lg">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">كل ما تحتاجه لنجاح أكاديميتك</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "موقع إلكتروني احترافي",
                description: "احصل على موقع ويب متجاوب ومصمم خصيصًا لأكاديميتك، مع محرر محتوى سهل الاستخدام.",
                icon: "🌐"
              },
              {
                title: "إدارة شاملة للطلاب",
                description: "تتبع بيانات الطلاب، الحضور والغياب، الاشتراكات المالية، والتقارير الطبية في مكان واحد.",
                icon: "👥"
              },
              {
                title: "لوحة تحكم قوية",
                description: "واجهة بديهية لإدارة جميع جوانب أكاديميتك بكفاءة عالية ومن أي جهاز.",
                icon: "📊"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-5xl mb-5 flex items-center justify-center h-16 w-16 bg-blue-100 rounded-full mx-auto">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="py-24">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">خطط أسعار مرنة تناسب الجميع</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "الأساسية",
                price: "99",
                period: "شهريًا",
                features: ["موقع إلكتروني", "إدارة الطلاب (حتى 50 طالب)", "نظام التسجيل أونلاين", "دعم فني عبر البريد الإلكتروني"]
              },
              {
                name: "الاحترافية",
                price: "199",
                period: "شهريًا",
                features: ["جميع مزايا الخطة الأساسية", "تقارير مالية متقدمة", "جدولة التدريبات والمباريات", "دعم فني ذو أولوية"],
                popular: true
              },
              {
                name: "المؤسسية",
                price: "399",
                period: "شهريًا",
                features: ["جميع مزايا الخطة الاحترافية", "نطاق مخصص (yourname.com)", "تكامل مع أنظمة خارجية", "مدير حساب مخصص"]
              }
            ].map((plan, index) => (
              <Card key={index} className={`shadow-lg transition-transform hover:scale-105 ${plan.popular ? "border-2 border-blue-500" : ""}`}>
                <CardHeader className="p-6">
                  <CardTitle className="flex justify-between items-start">
                    <span className="text-2xl font-bold text-gray-800">{plan.name}</span>
                    {plan.popular && (
                      <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                        الأكثر شيوعًا
                      </span>
                    )}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600"> / {plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full text-lg py-3 ${plan.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-800 hover:bg-gray-900"}`}
                  >
                    ابدأ الآن
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <footer id="contact" className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center mb-4">
                <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" />
                </svg>
                <span className="ml-3 text-2xl font-bold">TecnoFootball</span>
              </div>
              <p className="text-gray-400 mt-4 leading-relaxed">
                منصة الإدارة المتكاملة لأكاديميات كرة القدم الطموحة.
              </p>
            </div>
            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-4 tracking-wider uppercase">روابط سريعة</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">الصفحة الرئيسية</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">الميزات</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">الأسعار</a></li>
              </ul>
            </div>
            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-4 tracking-wider uppercase">الدعم</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الوثائق</a></li>
                <li><a href="#" className="hover:text-white transition-colors">اتصل بنا</a></li>
              </ul>
            </div>
            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-4 tracking-wider uppercase">تواصل معنا</h3>
              <div className="space-y-3 text-gray-400">
                <p>الجزائر، الجزائر</p>
                <p>+213 XXX XXX XXX</p>
                <p>info@tecnofootball.dz</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>© 2024 TecnoFootball. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
