// StudentManagement.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  UserPlus,
  Eye,
  Edit,
  GraduationCap,
  Users,
  Calendar,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Filter,
  Download,
  MoreHorizontal,
  Award,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Student {
  id: string;
  student_code: string;
  full_name: string;
  date_of_birth: string;
  nationality: string;
  gender?: string;
  phone?: string;
  email?: string;
  address: string;
  parent_name?: string;
  parent_phone?: string;
  position?: string;
  group_id?: string;
  enrollment_date: string;
  status: string;
  monthly_fee?: number;
  payment_status: string;
  photo_url?: string;
  created_at: string;
}

interface StudentGroup {
  id: string;
  name: string;
  description?: string;
  min_age: number;
  max_age: number;
  max_capacity: number;
  is_active: boolean;
}

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  // isAdmin is likely a boolean, not a function
  const { profile, isAdmin } = useAuth();

  // Fetch students
  const fetchStudents = async () => {
    if (!profile?.academy_id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setStudents(data as any || []);
      setFilteredStudents(data as any || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب بيانات الطلاب',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch groups
  const fetchGroups = async () => {
    if (!profile?.academy_id) return;
    try {
      const { data, error } = await supabase
        .from('student_groups')
        .select('*')
        .eq('is_active', true)
        .order('min_age', { ascending: true });
      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, []);

  // Filter students
  useEffect(() => {
    let filtered = students;
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone?.includes(searchTerm)
      );
    }
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }
    // Filter by group
    if (groupFilter !== 'all') {
      filtered = filtered.filter(student => student.group_id === groupFilter);
    }
    setFilteredStudents(filtered);
  }, [students, searchTerm, statusFilter, groupFilter]);

  // Calculate age
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

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">نشط</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">غير نشط</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 border-red-200">موقوف</Badge>;
      case 'graduated':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">متخرج</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'current':
        return <Badge className="bg-green-100 text-green-800 border-green-200">محدث</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 border-red-200">متأخر</Badge>;
      case 'exempt':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">معفى</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get group name
  const getGroupName = (groupId?: string) => {
    if (!groupId) return 'غير محدد';
    const group = groups.find(g => g.id === groupId);
    return group?.name || 'غير محدد';
  };

  // Statistics
  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    inactive: students.filter(s => s.status === 'inactive').length,
    overdue: students.filter(s => s.payment_status === 'overdue').length,
  };

  // Groups with student counts
  const groupStats = groups.map(group => ({
    ...group,
    studentCount: students.filter(s => s.group_id === group.id && s.status === 'active').length
  }));

  if (loading) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tfa-blue">إدارة الطلاب</h1>
          <p className="text-muted-foreground">
            إدارة ملفات الطلاب والمجموعات التدريبية
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchStudents} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          {/* Use isAdmin directly as a boolean, not isAdmin() */}
          {(isAdmin || profile?.role === 'coach') && (
            <Button onClick={() => setShowAddForm(true)}>
              <UserPlus className="w-4 h-4 ml-2" />
              إضافة طالب
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students">الطلاب</TabsTrigger>
          <TabsTrigger value="groups">المجموعات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="students" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-tfa-blue" />
                  <div className="ml-2">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">إجمالي الطلاب</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-green-600" />
                  <div className="ml-2">
                    <p className="text-2xl font-bold">{stats.active}</p>
                    <p className="text-xs text-muted-foreground">طلاب نشطين</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-600" />
                  <div className="ml-2">
                    <p className="text-2xl font-bold">{stats.inactive}</p>
                    <p className="text-xs text-muted-foreground">غير نشطين</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Award className="h-4 w-4 text-red-600" />
                  <div className="ml-2">
                    <p className="text-2xl font-bold">{stats.overdue}</p>
                    <p className="text-xs text-muted-foreground">متأخرين بالدفع</p>
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
                      placeholder="البحث بالاسم، الكود، البريد الإلكتروني، أو الهاتف..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="تصفية حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                    <SelectItem value="suspended">موقوف</SelectItem>
                    <SelectItem value="graduated">متخرج</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="تصفية حسب المجموعة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المجموعات</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة الطلاب</CardTitle>
              <CardDescription>
                {filteredStudents.length} من أصل {students.length} طالب
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>كود الطالب</TableHead>
                      <TableHead>الاسم الكامل</TableHead>
                      <TableHead>العمر</TableHead>
                      <TableHead>المجموعة</TableHead>
                      <TableHead>تاريخ التسجيل</TableHead>
                      <TableHead>حالة الطالب</TableHead>
                      <TableHead>حالة الدفع</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono text-sm">
                          {student.student_code}
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.full_name}
                        </TableCell>
                        <TableCell>
                          {calculateAge(student.date_of_birth)} سنة
                        </TableCell>
                        <TableCell>
                          {getGroupName(student.group_id)}
                        </TableCell>
                        <TableCell>
                          {new Date(student.enrollment_date).toLocaleDateString('ar-DZ')}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(student.status)}
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(student.payment_status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {/* Use isAdmin directly as a boolean, not isAdmin() */}
                            {(isAdmin || profile?.role === 'coach') && (
                              <Button
                                variant="outline"
                                size="sm"
                                // Add onClick handler or other props as needed
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="groups" className="space-y-6">
          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupStats.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{group.name}</span>
                    <Badge variant="outline">
                      {group.studentCount}/{group.max_capacity}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>الفئة العمرية:</span>
                      <span>{group.min_age}-{group.max_age} سنة</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>عدد الطلاب:</span>
                      <span>{group.studentCount} طالب</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الحد الأقصى:</span>
                      <span>{group.max_capacity} طالب</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-tfa-blue h-2 rounded-full" 
                        style={{ 
                          width: `${(group.studentCount / group.max_capacity) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentManagement;
