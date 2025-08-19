import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';

const editUserSchema = z.object({
  full_name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  phone: z.string().optional(),
  role: z.enum(['director', 'comptabilite_chief', 'coach', 'parent']),
  academy_id: z.string().nullable(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserFormProps {
  user: any;
  academies: any[];
  onUpdate: (userId: string, updates: Partial<EditUserFormData>) => void;
  onCancel: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user, academies, onUpdate, onCancel }) => {
  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      full_name: user.full_name,
      phone: user.phone || '',
      role: user.role,
      academy_id: user.academy_id || null,
    },
  });

  useEffect(() => {
    form.reset({
      full_name: user.full_name,
      phone: user.phone || '',
      role: user.role,
      academy_id: user.academy_id || null,
    });
  }, [user, form]);

  const onSubmit = (data: EditUserFormData) => {
    onUpdate(user.id, data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم الكامل</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم الهاتف (اختياري)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الدور</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="director">مدير</SelectItem>
                  <SelectItem value="comptabilite_chief">رئيس محاسبة</SelectItem>
                  <SelectItem value="coach">مدرب</SelectItem>
                  <SelectItem value="parent">ولي أمر</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="academy_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الأكاديمية</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر أكاديمية" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value=""><em>لا شيء</em></SelectItem>
                  {academies.map((academy) => (
                    <SelectItem key={academy.id} value={academy.id}>
                      {academy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">حفظ التغييرات</Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default EditUserForm;
