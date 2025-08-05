// src/components/academy/AcademyRegistration.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateRegistrationPDF } from '../RegistrationPDF';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

const arabicNameRegex = /^[\u0600-\u06FF\s]+$/;

const registrationSchema = z.object({
  full_name: z.string().min(2, "الاسم مطلوب").regex(arabicNameRegex, "يجب أن يكون الاسم باللغة العربية"),
  date_of_birth: z.string().min(1, "تاريخ الميلاد مطلوب"),
  nationality: z.string().min(1, "الجنسية مطلوبة").regex(arabicNameRegex, "يجب أن تكون الجنسية باللغة العربية"),
  phone: z.string().min(10, "رقم الهاتف مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  address: z.string().min(5, "العنوان مطلوب"),
  parent_name: z.string().min(2, "اسم ولي الأمر مطلوب").regex(arabicNameRegex, "يجب أن يكون الاسم باللغة العربية"),
  parent_phone: z.string().min(10, "رقم ولي الأمر مطلوب"),
  parent_email: z.string().email("بريد إلكتروني لولي الأمر غير صالح").optional(),
  parent_id_number: z.string().min(1, "رقم هوية ولي الأمر مطلوب"),
  parent_profession: z.string().min(1, "مهنة ولي الأمر مطلوبة").regex(arabicNameRegex, "يجب أن تكون المهنة باللغة العربية"),
  position: z.string().min(1, "المركز المفضل مطلوب"),
  previous_experience: z.string().optional(),
  medical_conditions: z.string().optional(),
  preferred_foot: z.string().min(1, "القدم المفضلة مطلوبة"),
  program_preference: z.string().min(1, "البرنامج المفضل مطلوب"),
  emergency_contact_name: z.string().min(2, "اسم جهة الاتصال في حالات الطوارئ مطلوب").regex(arabicNameRegex, "يجب أن يكون الاسم باللغة العربية"),
  emergency_contact_phone: z.string().min(10, "رقم جهة الاتصال في حالات الطوارئ مطلوب"),
  emergency_contact_relation: z.string().min(1, "علاقة جهة الاتصال في حالات الطوارئ مطلوبة").regex(arabicNameRegex, "يجب أن تكون العلاقة باللغة العربية"),
  how_did_you_hear: z.string().optional(),
  additional_notes: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const steps = [
  { id: 1, title: "المعلومات الشخصية", icon: "👤" },
  { id: 2, title: "معلومات ولي الأمر", icon: "👥" },
  { id: 3, title: "المعلومات الرياضية", icon: "⚽" },
  { id: 4, title: "معلومات الطوارئ", icon: "📞" },
  { id: 5, title: "المراجعة", icon: "📄" },
];

const AcademyRegistration = () => {
  const { subdomain } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [academy, setAcademy] = useState<any>(null);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      full_name: "",
      date_of_birth: "",
      nationality: "",
      phone: "",
      email: "",
      address: "",
      parent_name: "",
      parent_phone: "",
      parent_email: "",
      parent_id_number: "",
      parent_profession: "",
      position: "",
      previous_experience: "",
      medical_conditions: "",
      preferred_foot: "",
      program_preference: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relation: "",
      how_did_you_hear: "",
      additional_notes: "",
    }
  });

  useEffect(() => {
    const fetchAcademy = async () => {
      if (!subdomain) return;
      
      const { data, error } = await supabase
        .from('academies')
        .select('*')
        .eq('subdomain', subdomain)
        .single();
      
      if (error) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "تعذر العثور على الأكاديمية",
        });
        navigate('/');
        return;
      }
      
      setAcademy(data);
    };
    
    fetchAcademy();
  }, [subdomain, navigate, toast]);

  const nextStep = () => {
    if (currentStep < 5) {
      // Validate current step
      const fieldsToValidate = getFieldsForStep(currentStep);
      form.trigger(fieldsToValidate);
      
      const isValid = fieldsToValidate.every(field => form.getFieldState(field).isDirty && !form.getFieldState(field).error);
      if (isValid) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1:
        return ['full_name', 'date_of_birth', 'nationality', 'phone', 'email', 'address'];
      case 2:
        return ['parent_name', 'parent_phone', 'parent_email', 'parent_id_number', 'parent_profession'];
      case 3:
        return ['position', 'previous_experience', 'medical_conditions', 'preferred_foot', 'program_preference'];
      case 4:
        return ['emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation'];
      default:
        return [];
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    if (!academy) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('registrations').insert([{
        academy_id: academy.id,
        full_name: data.full_name,
        date_of_birth: data.date_of_birth,
        nationality: data.nationality,
        phone: data.phone,
        email: data.email,
        address: data.address,
        parent_name: data.parent_name,
        parent_phone: data.parent_phone,
        parent_email: data.parent_email || null,
        parent_id_number: data.parent_id_number,
        parent_profession: data.parent_profession || null,
        position: data.position || null,
        previous_experience: data.previous_experience || null,
        medical_conditions: data.medical_conditions || null,
        preferred_foot: data.preferred_foot || null,
        program_preference: data.program_preference || null,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        emergency_contact_relation: data.emergency_contact_relation,
        how_did_you_hear: data.how_did_you_hear || null,
        additional_notes: data.additional_notes || null,
      }]);

      if (error) throw error;

      // Generate PDF
      await generateRegistrationPDF({ data });

      toast({
        title: "تم التسجيل بنجاح",
        description: "تم حفظ طلب التسجيل الخاص بك. سيتواصل معك فريق الأكاديمية قريبًا.",
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate(`/site/${subdomain}`);
      }, 3000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في التسجيل",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!academy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-blue-600 mx-auto mb-4"></div>
          <p>جاري تحميل المعلومات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>نموذج التسجيل - {academy.name}</CardTitle>
              <Button variant="outline" asChild>
                <a href={`/site/${subdomain}`}>العودة إلى الموقع</a>
              </Button>
            </div>
            <CardDescription>
              املأ النموذج التالي لتسجيل طفلك في أكاديمية {academy.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Steps */}
            <div className="flex justify-between mb-8">
              {steps.map((step) => {
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isActive ? 'bg-blue-600 text-white' : 
                      isCompleted ? 'bg-green-600 text-white' : 
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : step.icon}
                    </div>
                    <span className="text-xs text-center">{step.title}</span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">المعلومات الشخصية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">الاسم الكامل *</Label>
                      <Input
                        id="full_name"
                        {...form.register("full_name")}
                        placeholder="أدخل الاسم الكامل"
                      />
                      {form.formState.errors.full_name && (
                        <p className="text-red-600 text-sm mt-1">{form.formState.errors.full_name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="date_of_birth">تاريخ الميلاد *</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        {...form.register("date_of_birth")}
                      />
                      {form.formState.errors.date_of_birth && (
                        <p className="text-red-600 text-sm mt-1">{form.formState.errors.date_of_birth.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nationality">الجنسية *</Label>
                      <Input
                        id="nationality"
                        {...form.register("nationality")}
                        placeholder="أدخل الجنسية"
                      />
                      {form.formState.errors.nationality && (
                        <p className="text-red-600 text-sm mt-1">{form.formState.errors.nationality.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">رقم الهاتف *</Label>
                      <Input
                        id="phone"
                        {...form.register("phone")}
                        placeholder="+213 XXX XXX XXX"
                      />
                      {form.formState.errors.phone && (
                        <p className="text-red-600 text-sm mt-1">{form.formState.errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="example@domain.com"
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="address">العنوان *</Label>
                    <Textarea
                      id="address"
                      {...form.register("address")}
                      placeholder="أدخل العنوان الكامل"
                      rows={3}
                    />
                    {form.formState.errors.address && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.address.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Parent Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">معلومات ولي الأمر</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parent_name">اسم ولي الأمر *</Label>
                      <Input
                        id="parent_name"
                        {...form.register("parent_name")}
                        placeholder="أدخل اسم ولي الأمر"
                      />
                      {form.formState.errors.parent_name && (
                        <p className="text-red-600 text-sm mt-1">{form.formState.errors.parent_name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="parent_phone">رقم ولي الأمر *</Label>
                      <Input
                        id="parent_phone"
                        {...form.register("parent_phone")}
                        placeholder="+213 XXX XXX XXX"
                      />
                      {form.formState.errors.parent_phone && (
                        <p className="text-red-600 text-sm mt-1">{form.formState.errors.parent_phone.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parent_email">البريد الإلكتروني لولي الأمر</Label>
                      <Input
                        id="parent_email"
                        type="email"
                        {...form.register("parent_email")}
                        placeholder="example@domain.com"
                      />
                      {form.formState.errors.parent_email && (
                        <p className="text-red-600 text-sm mt-1">{form.formState.errors.parent_email.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="parent_id_number">رقم هوية ولي الأمر *</Label>
                      <Input
                        id="parent_id_number"
                        {...form.register("parent_id_number")}
                        placeholder="أدخل رقم الهوية"
                      />
                      {form.formState.errors.parent_id_number && (
                        <p className="text-red-600 text-sm mt-1">{form.formState.errors.parent_id_number.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="parent_profession">مهنة ولي الأمر *</Label>
                    <Input
                      id="parent_profession"
                      {...form.register("parent_profession")}
                      placeholder="أدخل المهنة"
                    />
                    {form.formState.errors.parent_profession && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.parent_profession.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Sports Information */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">المعلومات الرياضية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="position">المركز المفضل *</Label>
                      <select
                        id="position"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        {...form.register("position")}
                      >
                        <option value="">اختر المركز</option>
                        <option value="goalkeeper">حارس مرمى</option>
                        <option value="defender">مدافع</option>
                        <option value="midfielder">وسط</option>
                        <option value="forward">مهاجم</option>
                      </select>
                      {form.formState.errors.position && (
                        <p className="text-red-600 text-sm mt-1">{form.formState.errors.position.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="preferred_foot">القدم المفضلة *</Label>
                      <select
                        id="preferred_foot"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        {...form.register("preferred_foot")}
                      >
                        <option value="">اختر القدم المفضلة</option>
                        <option value="right">اليمين</option>
                        <option value="left">اليسار</option>
                        <option value="both">كلاهما</option>
                      </select>
                      {form.formState.errors.preferred_foot && (
                        <p className="text-red-600 text-sm mt-1">{form.formState.errors.preferred_foot.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="program_preference">البرنامج المفضل *</Label>
                    <select
                      id="program_preference"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      {...form.register("program_preference")}
                    >
                      <option value="">اختر البرنامج</option>
                      <option value="children">الأطفال (5-8 سنوات)</option>
                      <option value="youth">الشباب (9-12 سنة)</option>
                      <option value="junior">الناشئين (13-16 سنة)</option>
                    </select>
                    {form.formState.errors.program_preference && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.program_preference.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="previous_experience">الخبرة السابقة</Label>
                    <Textarea
                      id="previous_experience"
                      {...form.register("previous_experience")}
                      placeholder="اذكر أي خبرة سابقة في كرة القدم"
                      rows={3}
                    />
                    {form.formState.errors.previous_experience && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.previous_experience.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="medical_conditions">الحالات الطبية</Label>
                    <Textarea
                      id="medical_conditions"
                      {...form.register("medical_conditions")}
                      placeholder="اذكر أي حالات طبية أو إعاقات"
                      rows={3}
                    />
                    {form.formState.errors.medical_conditions && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.medical_conditions.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Emergency Contact */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">معلومات الطوارئ</h3>
                  <div>
                    <Label htmlFor="emergency_contact_name">اسم جهة الاتصال في حالات الطوارئ *</Label>
                    <Input
                      id="emergency_contact_name"
                      {...form.register("emergency_contact_name")}
                      placeholder="أدخل الاسم"
                    />
                    {form.formState.errors.emergency_contact_name && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.emergency_contact_name.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergency_contact_phone">رقم جهة الاتصال في حالات الطوارئ *</Label>
                      <Input
                        id="emergency_contact_phone"
                        {...form.register("emergency_contact_phone")}
                        placeholder="+213 XXX XXX XXX"
                      />
                      {form.formState.errors.emergency_contact_phone && (
                        <p className="text-red-600 text-sm mt-1">{form.formState.errors.emergency_contact_phone.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="emergency_contact_relation">علاقة جهة الاتصال *</Label>
                      <Input
                        id="emergency_contact_relation"
                        {...form.register("emergency_contact_relation")}
                        placeholder="أدخل العلاقة"
                      />
                      {form.formState.errors.emergency_contact_relation && (
                        <p className="text-red-600 text-sm mt-1">{form.formState.errors.emergency_contact_relation.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">مراجعة المعلومات</h3>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold mb-4">المعلومات الشخصية</h4>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div><strong>الاسم الكامل:</strong> {form.getValues('full_name')}</div>
                      <div><strong>تاريخ الميلاد:</strong> {form.getValues('date_of_birth')}</div>
                      <div><strong>الجنسية:</strong> {form.getValues('nationality')}</div>
                      <div><strong>الهاتف:</strong> {form.getValues('phone')}</div>
                      <div><strong>البريد الإلكتروني:</strong> {form.getValues('email')}</div>
                      <div><strong>العنوان:</strong> {form.getValues('address')}</div>
                    </div>

                    <h4 className="font-semibold mb-4">معلومات ولي الأمر</h4>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div><strong>اسم ولي الأمر:</strong> {form.getValues('parent_name')}</div>
                      <div><strong>هاتف ولي الأمر:</strong> {form.getValues('parent_phone')}</div>
                      <div><strong>بريد ولي الأمر:</strong> {form.getValues('parent_email') || 'غير متوفر'}</div>
                      <div><strong>رقم الهوية:</strong> {form.getValues('parent_id_number')}</div>
                      <div><strong>المهنة:</strong> {form.getValues('parent_profession')}</div>
                    </div>

                    <h4 className="font-semibold mb-4">المعلومات الرياضية</h4>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div><strong>المركز المفضل:</strong> {form.getValues('position')}</div>
                      <div><strong>القدم المفضلة:</strong> {form.getValues('preferred_foot')}</div>
                      <div><strong>البرنامج المفضل:</strong> {form.getValues('program_preference')}</div>
                    </div>

                    <h4 className="font-semibold mb-4">معلومات الطوارئ</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><strong>اسم جهة الاتصال:</strong> {form.getValues('emergency_contact_name')}</div>
                      <div><strong>رقم جهة الاتصال:</strong> {form.getValues('emergency_contact_phone')}</div>
                      <div><strong>العلاقة:</strong> {form.getValues('emergency_contact_relation')}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep} className="flex items-center">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    العودة
                  </Button>
                )}
                {currentStep < 5 ? (
                  <Button type="button" onClick={nextStep} className="flex items-center ml-auto">
                    التالي
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="ml-auto">
                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال التسجيل'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcademyRegistration;
