import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, X } from 'lucide-react';

interface StudentGroup {
  id: string;
  name: string;
  min_age: number;
  max_age: number;
}

interface Registration {
  id: string;
  full_name: string;
  date_of_birth: string;
  nationality: string;
  phone: string;
  email: string;
  address: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  parent_id_number?: string;
  parent_profession?: string;
  position?: string;
  previous_experience?: string;
  medical_conditions?: string;
  preferred_foot?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  additional_notes?: string;
}

const convertStudentSchema = z.object({
  group_id: z.string().min(1, 'يجب اختيار المجموعة'),
  gender: z.string().min(1, 'يجب اختيار الجنس'),
  monthly_fee: z.string().transform(val => parseFloat(val) || 150),
  shirt_number: z.string().optional(),
  blood_type: z.string().optional(),
  allergies: z.string().optional(),
  school_name: z.string().optional(),
  school_grade: z.string().optional(),
  academic_performance: z.string().optional(),
  doctor_name: z.string().optional(),
  doctor_phone: z.string().optional(),
  additional_notes: z.string().optional(),
});

type ConvertStudentFormData = z.infer<typeof convertStudentSchema>;

interface ConvertToStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  onSuccess: () => void;
}

const ConvertToStudentDialog: React.FC<ConvertToStudentDialogProps> = ({
  isOpen,
  onClose,
  registration,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const { toast } = useToast();

  const form = useForm<ConvertStudentFormData>({
    resolver: zodResolver(convertStudentSchema),
    defaultValues: {
      group_id: '',
      gender: '',
      monthly_fee: 150,
      shirt_number: '',
      blood_type: '',
      allergies: '',
      school_name: '',
      school_grade: '',
      academic_performance: '',
      doctor_name: '',
      doctor_phone: '',
      additional_notes: '',
    },
  });

  // Calculate age and suggest group
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Fetch groups and suggest appropriate group
  React.useEffect(() => {
    if (isOpen && registration) {
      fetchGroups();
      const age = calculateAge(registration.date_of_birth);
      // Set default values based on registration data
      form.reset({
        group_id: '',
        gender: '',
        monthly_fee: 150,
        shirt_number: '',
        blood_type: '',
        allergies: registration.medical_conditions || '',
        school_name: '',
        school_grade: '',
        academic_performance: '',
        doctor_name: '',
        doctor_phone: '',
        additional_notes: registration.additional_notes || '',
      });
    }
  }, [isOpen, registration]);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('student_groups')
        .select('*')
        .eq('is_active', true)
        .order('min_age', { ascending: true });

      if (error) throw error;
      setGroups(data || []);

      // Auto-suggest group based on age
      if (registration) {
        const age = calculateAge(registration.date_of_birth);
        const suggestedGroup = data?.find(group => 
          age >= group.min_age && age <= group.max_age
        );
        if (suggestedGroup) {
          form.setValue('group_id', suggestedGroup.id);
        }
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const onSubmit = async (data: ConvertStudentFormData) => {
    if (!registration) return;

    setLoading(true);
    try {
      // Generate student code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_student_code');

      if (codeError) throw codeError;

      // Create student record
      const studentData = {
        student_code: codeData,
        registration_id: registration.id,
        full_name: registration.full_name,
        date_of_birth: registration.date_of_birth,
        nationality: registration.nationality,
        gender: data.gender,
        phone: registration.phone,
        email: registration.email,
        address: registration.address,
        parent_name: registration.parent_name,
        parent_phone: registration.parent_phone,
        parent_email: registration.parent_email,
        parent_id_number: registration.parent_id_number,
        parent_profession: registration.parent_profession,
        emergency_contact_name: registration.emergency_contact_name,
        emergency_contact_phone: registration.emergency_contact_phone,
        emergency_contact_relation: registration.emergency_contact_relation,
        position: registration.position,
        preferred_foot: registration.preferred_foot,
        previous_experience: registration.previous_experience,
        shirt_number: data.shirt_number ? parseInt(data.shirt_number) : null,
        medical_conditions: registration.medical_conditions,
        allergies: data.allergies,
        blood_type: data.blood_type,
        doctor_name: data.doctor_name,
        doctor_phone: data.doctor_phone,
        school_name: data.school_name,
        school_grade: data.school_grade,
        academic_performance: data.academic_performance,
        group_id: data.group_id,
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active',
        monthly_fee: data.monthly_fee,
        payment_status: 'current',
        notes: data.additional_notes,
      };

      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();

      if (studentError) throw studentError;

      // Create enrollment record
      const { error: enrollmentError } = await supabase
        .from('student_enrollments')
        .insert([{
          student_id: student.id,
          group_id: data.group_id,
          enrollment_date: new Date().toISOString().split('T')[0],
          is_active: true,
        }]);

      if (enrollmentError) throw enrollmentError;

      toast({
        title: 'تم بنجاح',
        description: `تم تحويل طلب ${registration.full_name} إلى طالب برقم ${codeData}`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error converting to student:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحويل الطلب إلى طالب',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!registration) return null;

  const age = calculateAge(registration.date_of_birth);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-tfa-blue" />
            تحويل إلى طالب
          </DialogTitle>
          <DialogDescription>
            تحويل طلب التسجيل إلى ملف طالب في الأكاديمية
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Registration Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-2">معلومات الطلب</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">الاسم:</span> {registration.full_name}</div>
              <div><span className="font-medium">العمر:</span> {age} سنة</div>
              <div><span className="font-medium">الجنسية:</span> {registration.nationality}</div>
              <div><span className="font-medium">الهاتف:</span> {registration.phone}</div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="group_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المجموعة التدريبية</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المجموعة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {groups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name} ({group.min_age}-{group.max_age} سنة)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الجنس</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الجنس" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ذكر">ذكر</SelectItem>
                          <SelectItem value="أنثى">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthly_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الرسوم الشهرية (دج)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="150"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shirt_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم القميص (اختياري)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="blood_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>فصيلة الدم (اختياري)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر فصيلة الدم" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {age < 18 && (
                  <>
                    <FormField
                      control={form.control}
                      name="school_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المدرسة</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="اسم المدرسة"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="school_grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الصف الدراسي</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="الصف الأول متوسط"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="academic_performance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الأداء الأكاديمي</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الأداء الأكاديمي" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ممتاز">ممتاز</SelectItem>
                              <SelectItem value="جيد جداً">جيد جداً</SelectItem>
                              <SelectItem value="جيد">جيد</SelectItem>
                              <SelectItem value="مقبول">مقبول</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="doctor_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الطبيب (اختياري)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="د. أحمد محمد"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doctor_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>هاتف الطبيب (اختياري)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0555123456"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحساسيات (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أي حساسيات أو أدوية يجب تجنبها..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additional_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات إضافية</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أي ملاحظات أخرى..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-tfa-blue hover:bg-tfa-blue/90"
                >
                  {loading ? 'جاري التحويل...' : 'تحويل إلى طالب'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertToStudentDialog;