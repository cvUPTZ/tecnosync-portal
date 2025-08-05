import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateRegistrationPDF } from "./RegistrationPDF";
import { 
  User, 
  Users, 
  Activity, 
  Phone, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Check
} from "lucide-react";

// Arabic name validation regex
const arabicNameRegex = /^[\u0600-\u06FF\s]+$/;

// Define the form schema
const registrationSchema = z.object({
  // Personal Information
  full_name: z.string()
    .min(2, "الاسم يجب أن يكون حرفين على الأقل")
    .regex(arabicNameRegex, "يجب أن يحتوي الاسم على أحرف عربية فقط"),
  date_of_birth: z.string().min(1, "تاريخ الميلاد مطلوب"),
  nationality: z.string()
    .min(1, "الجنسية مطلوبة")
    .regex(arabicNameRegex, "يجب أن تحتوي الجنسية على أحرف عربية فقط"),
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  address: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل"),
  
  // Parent Information
  parent_name: z.string()
    .min(2, "اسم ولي الأمر مطلوب")
    .regex(arabicNameRegex, "يجب أن يحتوي اسم ولي الأمر على أحرف عربية فقط"),
  parent_phone: z.string().min(10, "رقم هاتف ولي الأمر مطلوب"),
  parent_email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  parent_id_number: z.string().min(1, "رقم الهوية مطلوب"),
  parent_profession: z.string().optional(),
  
  // Technical Information
  position: z.string().optional(),
  previous_experience: z.string().optional(),
  medical_conditions: z.string().optional(),
  preferred_foot: z.string().optional(),
  program_preference: z.string().optional(),
  
  // Emergency Information
  emergency_contact_name: z.string()
    .min(2, "اسم جهة الاتصال في الطوارئ مطلوب")
    .regex(arabicNameRegex, "يجب أن يحتوي اسم جهة الاتصال على أحرف عربية فقط"),
  emergency_contact_phone: z.string().min(10, "رقم هاتف الطوارئ مطلوب"),
  emergency_contact_relation: z.string().min(1, "علاقة جهة الاتصال مطلوبة"),
  
  // Other Information
  how_did_you_hear: z.string().optional(),
  additional_notes: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const steps = [
  {
    id: 1,
    title: "المعلومات الشخصية",
    icon: User,
    description: "البيانات الأساسية للاعب"
  },
  {
    id: 2,
    title: "معلومات ولي الأمر",
    icon: Users,
    description: "بيانات ولي أمر اللاعب"
  },
  {
    id: 3,
    title: "المعلومات التقنية",
    icon: Activity,
    description: "المعلومات الرياضية والطبية"
  },
  {
    id: 4,
    title: "معلومات الطوارئ",
    icon: Phone,
    description: "جهات الاتصال في حالات الطوارئ"
  },
  {
    id: 5,
    title: "معلومات أخرى",
    icon: FileText,
    description: "معلومات إضافية"
  }
];

interface RegistrationFormProps {
  onClose?: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
    },
  });

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      // For now, get the first academy. Later this should be passed as a prop or from URL
      const { data: academyData } = await supabase
        .from('academies')
        .select('id')
        .limit(1)
        .single();

      if (!academyData) {
        throw new Error('No academy found');
      }

      const { error } = await supabase
        .from('registrations')
        .insert([{
          academy_id: academyData.id,
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

      // Generate and download PDF with proper data mapping
      const pdfData = {
        full_name: data.full_name,
        date_of_birth: data.date_of_birth,
        nationality: data.nationality,
        phone: data.phone,
        email: data.email,
        address: data.address,
        parent_name: data.parent_name,
        parent_phone: data.parent_phone,
        parent_email: data.parent_email || "",
        parent_id_number: data.parent_id_number,
        parent_profession: data.parent_profession || "",
        position: data.position || "",
        previous_experience: data.previous_experience || "",
        medical_conditions: data.medical_conditions || "",
        preferred_foot: data.preferred_foot || "",
        program_preference: data.program_preference || "",
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        emergency_contact_relation: data.emergency_contact_relation,
        how_did_you_hear: data.how_did_you_hear || "",
        additional_notes: data.additional_notes || "",
      };
      
      await generateRegistrationPDF(pdfData);

      toast({
        title: "تم إرسال الطلب بنجاح",
        description: "تم تحميل ملف PDF بتفاصيل التسجيل. سيتم التواصل معك قريباً.",
      });

      form.reset();
      setCurrentStep(1);
      onClose?.();
    } catch (error) {
      console.error("Error submitting registration:", error);
      toast({
        title: "خطأ في إرسال الطلب",
        description: "حدث خطأ أثناء إرسال طلب التسجيل. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل *</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل الاسم الكامل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الميلاد *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الجنسية *</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل الجنسية" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف *</FormLabel>
                    <FormControl>
                      <Input placeholder="+213 xxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني *</FormLabel>
                    <FormControl>
                      <Input placeholder="example@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان الكامل *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="أدخل العنوان الكامل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="parent_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم ولي الأمر *</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم ولي الأمر" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="parent_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم هاتف ولي الأمر *</FormLabel>
                    <FormControl>
                      <Input placeholder="+213 xxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parent_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="parent@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="parent_id_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهوية *</FormLabel>
                    <FormControl>
                      <Input placeholder="رقم بطاقة الهوية" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parent_profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المهنة (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="مهنة ولي الأمر" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المركز المفضل (اختياري)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المركز" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="goalkeeper">حارس مرمى</SelectItem>
                        <SelectItem value="defender">مدافع</SelectItem>
                        <SelectItem value="midfielder">وسط ميدان</SelectItem>
                        <SelectItem value="forward">مهاجم</SelectItem>
                        <SelectItem value="any">أي مركز</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferred_foot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القدم المفضلة (اختياري)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر القدم المفضلة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="right">اليمنى</SelectItem>
                        <SelectItem value="left">اليسرى</SelectItem>
                        <SelectItem value="both">كلاهما</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="program_preference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البرنامج المفضل (اختياري)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر البرنامج" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="children">البراعم (5-8 سنوات)</SelectItem>
                      <SelectItem value="youth">الأشبال (9-12 سنة)</SelectItem>
                      <SelectItem value="junior">الناشئين (13-16 سنة)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="previous_experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الخبرة السابقة (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="صف أي خبرة سابقة في كرة القدم..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medical_conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحالات الطبية (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="أذكر أي حالات طبية أو حساسية..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="emergency_contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم جهة الاتصال في الطوارئ *</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم الشخص للاتصال به في الطوارئ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emergency_contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم هاتف الطوارئ *</FormLabel>
                    <FormControl>
                      <Input placeholder="+213 xxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact_relation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>علاقة القرابة *</FormLabel>
                    <FormControl>
                      <Input placeholder="مثل: العم، الخال، الجد..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="how_did_you_hear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>كيف سمعت عن الأكاديمية؟ (اختياري)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الإجابة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="social_media">وسائل التواصل الاجتماعي</SelectItem>
                      <SelectItem value="friends">من الأصدقاء</SelectItem>
                      <SelectItem value="family">من العائلة</SelectItem>
                      <SelectItem value="internet">البحث على الإنترنت</SelectItem>
                      <SelectItem value="advertisement">إعلان</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additional_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أي معلومات إضافية تود إضافتها..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4" dir="rtl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-tfa-blue">استمارة التسجيل الإلكترونية</CardTitle>
          <CardDescription>يرجى ملء جميع الحقول المطلوبة بدقة</CardDescription>
        </CardHeader>

        {/* Steps Indicator */}
        <div className="px-6 mb-6">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center text-center max-w-[120px]">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors
                    ${isCompleted ? 'bg-tfa-green text-white' : 
                      isActive ? 'bg-tfa-blue text-white' : 
                      'bg-gray-200 text-gray-600'}
                  `}>
                    {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <div className={`text-xs font-medium ${isActive ? 'text-tfa-blue' : 'text-gray-600'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 hidden md:block">
                    {step.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  السابق
                </Button>

                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-tfa-blue hover:bg-tfa-blue/90 flex items-center gap-2"
                  >
                    التالي
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-tfa-green hover:bg-tfa-green/90 flex items-center gap-2 min-w-[150px]"
                  >
                    {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب وتحميل PDF"}
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
