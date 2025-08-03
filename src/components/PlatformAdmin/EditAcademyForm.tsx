import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

// Re-using the list of modules from the create page
const availableModules = [
  { id: 'registrations', label: 'Registration Management' },
  { id: 'students', label: 'Student Management' },
  { id: 'users', label: 'User Management' },
  { id: 'attendance', label: 'Attendance Tracking' },
  { id: 'coaches', label: 'Coach Management' },
  { id: 'finance', label: 'Finance Management' },
  { id: 'reports', label: 'Financial Reports' },
  { id: 'documents', label: 'Document Management' },
  { id: 'website', label: 'Website Content Management' },
  { id: 'schedule', label: 'Schedule & Events' },
  { id: 'messages', label: 'Messages' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'settings', label: 'Settings' },
] as const;

const editAcademySchema = z.object({
  name: z.string().min(3, 'Academy name must be at least 3 characters'),
  modules: z.array(z.string()),
});

type EditAcademyFormValues = z.infer<typeof editAcademySchema>;

interface EditAcademyFormProps {
  academy: {
    id: string;
    name: string;
    modules: Record<string, boolean>;
  };
  onSuccess: () => void; // Callback to close dialog and refresh list
}

const EditAcademyForm: React.FC<EditAcademyFormProps> = ({ academy, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Convert modules object to an array of enabled module IDs for the form's default state
  const defaultModules = Object.entries(academy.modules || {})
    .filter(([, isEnabled]) => isEnabled)
    .map(([moduleId]) => moduleId);

  const form = useForm<EditAcademyFormValues>({
    resolver: zodResolver(editAcademySchema),
    defaultValues: {
      name: academy.name,
      modules: defaultModules,
    },
  });

  const onSubmit = async (values: EditAcademyFormValues) => {
    setIsSubmitting(true);
    try {
      const modulesObject = availableModules.reduce((acc, module) => {
        acc[module.id] = values.modules.includes(module.id);
        return acc;
      }, {} as Record<string, boolean>);

      const { error } = await supabase
        .from('academies')
        .update({
          name: values.name,
          modules: modulesObject,
        })
        .eq('id', academy.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Academy updated successfully.' });
      onSuccess();

    } catch (error) {
      console.error('Error updating academy:', error);
      toast({ title: 'Error', description: 'Failed to update academy.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Academy Name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="modules"
          render={() => (
            <FormItem>
              <FormLabel>Enabled Modules</FormLabel>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {availableModules.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="modules"
                    render={({ field }) => (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value?.filter((value) => value !== item.id)
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{item.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditAcademyForm;
