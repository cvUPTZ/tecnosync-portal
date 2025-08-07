import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus,
  Users,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  UserCheck,
  GraduationCap,
  Award,
  Clock,
  MapPin,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Coach {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  assigned_groups?: StudentGroup[];
  recent_sessions?: TrainingSession[];
}

interface StudentGroup {
  id: string;
  name: string;
  min_age: number;
  max_age: number;
  max_capacity: number;
  student_count?: number;
}

interface TrainingSession {
  id: string;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  group_name?: string;
}

interface CoachFormData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  qualifications: string;
  experience: string;
  specialization: string;
}

const CoachManagement = () => {
  const { profile, isDirector, isPlatformAdmin } = useAuth();
  const { toast } = useToast();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [academyName, setAcademyName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [formData, setFormData] = useState<CoachFormData>({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    qualifications: '',
    experience: '',
    specialization: ''
  });

  useEffect(() => {
    fetchCoaches();
    fetchGroups();
  }, []);

  const fetchCoaches = async () => {
    try {
      setLoading(true);

      if (profile?.academy_id) {
        const { data: academyData, error: academyError } = await supabase
          .from('academies')
          .select('name')
          .eq('id', profile.academy_id)
          .single();
        if (academyData) setAcademyName(academyData.name);
        else if (academyError) console.error('Error fetching academy name:', academyError);
      }
      
      // Fetch coaches from profiles table
      const { data: coachesData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'coach')
        .order('full_name');

      if (error) throw error;

      // Fetch additional data for each coach
      const coachesWithDetails = await Promise.all(
        (coachesData || []).map(async (coach) => {
          // Get assigned groups through training sessions
          const { data: sessionsData } = await supabase
            .from('training_sessions')
            .select(`
              group_id,
              student_groups(id, name, min_age, max_age, max_capacity)
            `)
            .eq('coach_id', coach.user_id)
            .eq('is_active', true);

          // Get unique groups
          const uniqueGroups = sessionsData?.reduce((acc, session) => {
            const group = Array.isArray(session.student_groups) ? session.student_groups[0] : session.student_groups;
            if (group && !acc.find(g => g.id === group.id)) {
              acc.push(group);
            }
            return acc;
          }, [] as any[]) || [];

          // Get recent training sessions
          const { data: recentSessions } = await supabase
            .from('training_sessions')
            .select(`
              id,
              title,
              session_date,
              start_time,
              end_time,
              student_groups(name)
            `)
            .eq('coach_id', coach.user_id)
            .gte('session_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .order('session_date', { ascending: false })
            .limit(5);

          return {
            ...coach,
            assigned_groups: uniqueGroups,
            recent_sessions: recentSessions?.map(session => ({
              ...session,
              group_name: Array.isArray(session.student_groups) ? session.student_groups[0]?.name : session.student_groups?.name
            })) || []
          };
        })
      );

      setCoaches(coachesWithDetails);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل بيانات المدربين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data: groupsData } = await supabase
        .from('student_groups')
        .select(`
          *,
          students(id)
        `)
        .eq('is_active', true);

      const groupsWithCount = groupsData?.map(group => ({
        ...group,
        student_count: group.students?.length || 0
      })) || [];

      setGroups(groupsWithCount);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const createCoach = async () => {
    if (!formData.full_name || !formData.email || !formData.password) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        user_metadata: {
          full_name: formData.full_name,
          role: 'coach',
          admin_created: true
        }
      });

      if (authError) throw authError;

      // Update profile with additional information
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone: formData.phone || null,
            // Note: We could store qualifications, experience, etc. in a separate coaches table if needed
          })
          .eq('user_id', authData.user.id);

        if (profileError) throw profileError;
      }

      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء حساب المدرب بنجاح",
      });

      setFormData({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        qualifications: '',
        experience: '',
        specialization: ''
      });
      setShowAddDialog(false);
      fetchCoaches();

    } catch (error: any) {
      console.error('Error creating coach:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في إنشاء حساب المدرب",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCoachStatus = async (coachId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', coachId);

      if (error) throw error;

      setCoaches(prev => prev.map(coach => 
        coach.id === coachId 
          ? { ...coach, is_active: !currentStatus }
          : coach
      ));

      toast({
        title: "تم التحديث",
        description: `تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} المدرب بنجاح`,
      });

    } catch (error) {
      console.error('Error updating coach status:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحديث حالة المدرب",
        variant: "destructive",
      });
    }
  };

  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = coach.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coach.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && coach.is_active) ||
                         (statusFilter === 'inactive' && !coach.is_active);

    return matchesSearch && matchesStatus;
  });

  const getCoachStats = () => {
    const total = coaches.length;
    const active = coaches.filter(c => c.is_active).length;
    const totalGroups = coaches.reduce((sum, coach) => sum + (coach.assigned_groups?.length || 0), 0);
    const totalSessions = coaches.reduce((sum, coach) => sum + (coach.recent_sessions?.length || 0), 0);
    
    return { total, active, totalGroups, totalSessions };
  };

  const stats = getCoachStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isDirector() && !isPlatformAdmin()) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tfa-blue">إدارة المدربين</h1>
          <p className="text-muted-foreground mt-1">
            إدارة فريق التدريب في {academyName || 'الأكاديمية'}
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-tfa-blue hover:bg-tfa-blue/90">
              <UserPlus className="ml-2 h-4 w-4" />
              إضافة مدرب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>إضافة مدرب جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات المدرب الجديد
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name">الاسم الكامل *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="أحمد محمد"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="coach@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+213 XXX XXX XXX"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">كلمة المرور *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="كلمة مرور قوية"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="qualifications">المؤهلات</Label>
                <Textarea
                  id="qualifications"
                  value={formData.qualifications}
                  onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                  placeholder="الشهادات والمؤهلات..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="experience">الخبرة</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  placeholder="سنوات الخبرة والأندية السابقة..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={createCoach}
                disabled={submitting}
                className="bg-tfa-blue hover:bg-tfa-blue/90"
              >
                {submitting ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-tfa-blue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدربين</CardTitle>
            <Users className="h-4 w-4 text-tfa-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tfa-blue">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-tfa-green/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المدربين النشطين</CardTitle>
            <CheckCircle className="h-4 w-4 text-tfa-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tfa-green">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="border-tfa-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المجموعات المُدارة</CardTitle>
            <GraduationCap className="h-4 w-4 text-tfa-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tfa-gold">{stats.totalGroups}</div>
          </CardContent>
        </Card>

        <Card className="border-tfa-red/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الجلسات الأخيرة</CardTitle>
            <Clock className="h-4 w-4 text-tfa-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tfa-red">{stats.totalSessions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-tfa-blue" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="اسم المدرب أو البريد الإلكتروني"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المدربين</SelectItem>
                  <SelectItem value="active">النشطين فقط</SelectItem>
                  <SelectItem value="inactive">غير النشطين فقط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coaches Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-tfa-blue" />
            قائمة المدربين
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCoaches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد مدربين</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المدرب</TableHead>
                  <TableHead>معلومات الاتصال</TableHead>
                  <TableHead>المجموعات المُدارة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoaches.map((coach) => (
                  <TableRow key={coach.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={coach.avatar_url} />
                          <AvatarFallback>
                            {coach.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{coach.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            انضم في {format(new Date(coach.created_at), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {coach.email}
                        </div>
                        {coach.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {coach.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {coach.assigned_groups?.length ? (
                          coach.assigned_groups.map((group) => (
                            <Badge key={group.id} variant="outline" className="mr-1">
                              {group.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">لا توجد مجموعات</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {coach.is_active ? (
                        <Badge className="bg-tfa-green text-white">نشط</Badge>
                      ) : (
                        <Badge variant="destructive">غير نشط</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCoach(coach);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={coach.is_active ? "destructive" : "default"}
                          onClick={() => toggleCoachStatus(coach.id, coach.is_active)}
                          className={!coach.is_active ? "bg-tfa-green hover:bg-tfa-green/90" : ""}
                        >
                          {coach.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Coach Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              تفاصيل المدرب
            </DialogTitle>
          </DialogHeader>
          {selectedCoach && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">المعلومات الأساسية</TabsTrigger>
                <TabsTrigger value="groups">المجموعات</TabsTrigger>
                <TabsTrigger value="sessions">الجلسات الأخيرة</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedCoach.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {selectedCoach.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedCoach.full_name}</h3>
                    <p className="text-muted-foreground">{selectedCoach.email}</p>
                    {selectedCoach.phone && (
                      <p className="text-sm text-muted-foreground">{selectedCoach.phone}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">الحالة</Label>
                    <p className="mt-1">
                      {selectedCoach.is_active ? (
                        <Badge className="bg-tfa-green text-white">نشط</Badge>
                      ) : (
                        <Badge variant="destructive">غير نشط</Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">تاريخ الانضمام</Label>
                    <p className="mt-1 text-sm">
                      {format(new Date(selectedCoach.created_at), 'dd MMMM yyyy', { locale: ar })}
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="groups" className="space-y-4">
                {selectedCoach.assigned_groups?.length ? (
                  selectedCoach.assigned_groups.map((group) => (
                    <Card key={group.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{group.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              العمر: {group.min_age} - {group.max_age} سنة
                            </p>
                          </div>
                          <Badge variant="outline">
                            {group.student_count || 0} / {group.max_capacity} طالب
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    لا توجد مجموعات مُعينة لهذا المدرب
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="sessions" className="space-y-4">
                {selectedCoach.recent_sessions?.length ? (
                  selectedCoach.recent_sessions.map((session) => (
                    <Card key={session.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{session.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {session.group_name} • {session.start_time} - {session.end_time}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {format(new Date(session.session_date), 'dd/MM')}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    لا توجد جلسات تدريب أخيرة
                  </p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoachManagement;