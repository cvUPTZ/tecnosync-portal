import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  RefreshCw,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'director' | 'comptabilite_chief' | 'coach' | 'parent';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const userSchema = z.object({
  full_name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().optional(),
  role: z.enum(['director', 'comptabilite_chief', 'coach', 'parent']),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل').optional(),
});

type UserFormData = z.infer<typeof userSchema>;

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      role: 'coach',
      password: '',
    },
  });

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data as UserProfile[] || []);
      setFilteredUsers(data as UserProfile[] || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  // Create new user
  const onSubmit = async (data: UserFormData) => {
    try {
      // Create user with email confirmation disabled
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password || 'temppassword123',
        options: {
          data: {
            full_name: data.full_name,
            role: data.role,
            admin_created: true, // Flag to indicate admin creation
          },
          emailRedirectTo: undefined, // Disable email redirect
        },
      });

      if (authError) throw authError;

      // Mark email as confirmed and update profile
      if (authData.user) {
        // Update the profile with additional data
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone: data.phone,
          })
          .eq('user_id', authData.user.id);

        if (profileError) throw profileError;

        // Note: Email confirmation will be handled by the trigger
        console.log('User created successfully:', authData.user.id);
      }

      toast({
        title: 'تم إنشاء المستخدم',
        description: 'تم إنشاء المستخدم الجديد بنجاح',
      });

      setShowAddDialog(false);
      form.reset();
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء إنشاء المستخدم',
        variant: 'destructive',
      });
    }
  };

  // Update user
  const updateUser = async (userId: string, updates: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, ...updates } : user
        )
      );

      toast({
        title: 'تم التحديث',
        description: 'تم تحديث بيانات المستخدم بنجاح',
      });

      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث المستخدم',
        variant: 'destructive',
      });
    }
  };

  // Toggle user status
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    await updateUser(userId, { is_active: !currentStatus });
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    const roleLabels = {
      director: { label: 'مدير', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      comptabilite_chief: { label: 'رئيس محاسبة', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      coach: { label: 'مدرب', className: 'bg-green-100 text-green-800 border-green-200' },
      parent: { label: 'ولي أمر', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    };

    const roleInfo = roleLabels[role as keyof typeof roleLabels] || roleLabels.coach;
    return <Badge className={roleInfo.className}>{roleInfo.label}</Badge>;
  };

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    directors: users.filter(u => u.role === 'director').length,
    coaches: users.filter(u => u.role === 'coach').length,
  };

  if (!isAdmin()) {
    return (
      <div className="space-y-6 p-6" dir="rtl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">غير مصرح</h3>
              <p className="text-muted-foreground">ليس لديك صلاحية للوصول إلى إدارة المستخدمين</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6" dir="rtl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tfa-blue">إدارة المستخدمين</h1>
          <p className="text-muted-foreground mt-1">
            إدارة حسابات المستخدمين والصلاحيات
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="w-4 h-4 ml-2" />
                إضافة مستخدم
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                <DialogDescription>
                  إنشاء حساب مستخدم جديد في النظام
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم الكامل</FormLabel>
                        <FormControl>
                          <Input placeholder="أدخل الاسم الكامل" {...field} />
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
                        <FormLabel>البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="user@example.com" {...field} />
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
                          <Input placeholder="0555123456" {...field} />
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
                              <SelectValue placeholder="اختر دور المستخدم" />
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
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      إنشاء المستخدم
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddDialog(false)}
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-2 bg-tfa-blue/10 rounded-lg">
                <User className="h-6 w-6 text-tfa-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">نشط</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.directors}</p>
                <p className="text-sm text-muted-foreground">مديرين</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.coaches}</p>
                <p className="text-sm text-muted-foreground">مدربين</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث بالاسم، البريد الإلكتروني، أو الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="تصفية حسب الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                <SelectItem value="director">مدير</SelectItem>
                <SelectItem value="comptabilite_chief">رئيس محاسبة</SelectItem>
                <SelectItem value="coach">مدرب</SelectItem>
                <SelectItem value="parent">ولي أمر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
          <CardDescription>
            {filteredUsers.length} من أصل {users.length} مستخدم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell>
                      <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {user.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('ar-DZ')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                        >
                          {user.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;