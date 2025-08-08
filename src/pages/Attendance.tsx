import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Users,
  CalendarDays,
  UserCheck,
  Search,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Student {
  id: string;
  full_name: string;
  student_code: string;
  group_id: string;
  group_name?: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  session_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string | null;
  student?: {
    id: string;
    full_name: string;
    student_code: string;
  };
}

interface TrainingSession {
  id: string;
  group_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  title: string;
  description?: string;
  location?: string;
  group_name?: string;
}

interface StudentGroup {
  id: string;
  name: string;
}

const Attendance = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedGroup && selectedDate) {
      fetchStudentsAndAttendance();
    }
  }, [selectedGroup, selectedDate]);

  const fetchInitialData = async () => {
    try {
      // Fetch groups
      const { data: groupsData } = await supabase
        .from('student_groups')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      setGroups(groupsData || []);

      // Fetch training sessions for today
      const { data: sessionsData } = await supabase
        .from('training_sessions')
        .select(`
          *,
          student_groups(name)
        `)
        .eq('session_date', selectedDate)
        .eq('is_active', true)
        .order('start_time');

      setSessions(sessionsData?.map(session => ({
        ...session,
        group_name: Array.isArray(session.student_groups) ? session.student_groups[0]?.name : session.student_groups?.name
      })) || []);

    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndAttendance = async () => {
    if (!selectedGroup) return;

    try {
      setLoading(true);

      // Fetch students in the selected group
      const { data: studentsData } = await supabase
        .from('students')
        .select(`
          id,
          full_name,
          student_code,
          group_id,
          student_groups(name)
        `)
        .eq('group_id', selectedGroup)
        .eq('status', 'active')
        .order('full_name');

      const formattedStudents = studentsData?.map(student => ({
        ...student,
        group_name: Array.isArray(student.student_groups) ? student.student_groups[0]?.name : (student.student_groups as any)?.name
      })) || [];

      setStudents(formattedStudents);

      // Fetch existing attendance for the selected date and group
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select(`
          *,
          students(id, full_name, student_code)
        `)
        .eq('session_date', selectedDate)
        .in('student_id', formattedStudents.map(s => s.id));

      setAttendance(attendanceData?.map(record => ({
        id: record.id,
        student_id: record.student_id,
        session_date: record.session_date,
        status: record.status as 'present' | 'absent' | 'late' | 'excused',
        notes: record.notes,
        student: record.students ? {
          id: record.students.id,
          full_name: record.students.full_name,
          student_code: record.students.student_code
        } : undefined
      })) || []);

    } catch (error) {
      console.error('Error fetching students and attendance:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل بيانات الطلاب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId: string, status: 'present' | 'absent' | 'late' | 'excused', notes?: string) => {
    try {
      // Check if attendance already exists
      const existingRecord = attendance.find(a => a.student_id === studentId);

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('attendance')
          .update({
            status,
            notes: notes || null,
            recorded_by: profile?.user_id
          })
          .eq('id', existingRecord.id);

        if (error) throw error;

        // Update local state
        setAttendance(prev => prev.map(record => 
          record.id === existingRecord.id 
            ? { ...record, status, notes }
            : record
        ));
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('attendance')
          .insert({
            student_id: studentId,
            session_date: selectedDate,
            status,
            notes: notes || null,
            recorded_by: profile?.user_id
          })
          .select()
          .single();

        if (error) throw error;

        // Add to local state
        const student = students.find(s => s.id === studentId);
        setAttendance(prev => [...prev, {
          id: data.id,
          student_id: data.student_id,
          session_date: data.session_date,
          status: data.status as 'present' | 'absent' | 'late' | 'excused',
          notes: data.notes,
          student: student ? {
            id: student.id,
            full_name: student.full_name,
            student_code: student.student_code
          } : undefined
        }]);
      }

      toast({
        title: "تم الحفظ",
        description: "تم تسجيل الحضور بنجاح",
      });

    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تسجيل الحضور",
        variant: "destructive",
      });
    }
  };

  const createTrainingSession = async () => {
    if (!selectedGroup || !newSession.title || !newSession.start_time || !newSession.end_time) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('training_sessions')
        .insert({
          group_id: selectedGroup,
          session_date: selectedDate,
          title: newSession.title,
          description: newSession.description || null,
          start_time: newSession.start_time,
          end_time: newSession.end_time,
          location: newSession.location || null,
          coach_id: profile?.user_id
        });

      if (error) throw error;

      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء جلسة التدريب بنجاح",
      });

      setNewSession({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: ''
      });
      setShowSessionDialog(false);
      fetchInitialData();

    } catch (error) {
      console.error('Error creating training session:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إنشاء جلسة التدريب",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getAttendanceStatus = (studentId: string) => {
    const record = attendance.find(a => a.student_id === studentId);
    return record?.status || null;
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-tfa-green text-white">حاضر</Badge>;
      case 'absent':
        return <Badge variant="destructive">غائب</Badge>;
      case 'late':
        return <Badge className="bg-tfa-gold text-white">متأخر</Badge>;
      case 'excused':
        return <Badge variant="secondary">معذور</Badge>;
      default:
        return <Badge variant="outline">لم يسجل</Badge>;
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAttendanceStats = () => {
    const total = students.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const excused = attendance.filter(a => a.status === 'excused').length;
    
    return { total, present, absent, late, excused };
  };

  const stats = getAttendanceStats();

  if (loading && !selectedGroup) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tfa-blue">الحضور والغياب</h1>
          <p className="text-muted-foreground mt-1">
            إدارة حضور الطلاب في جلسات التدريب
          </p>
        </div>
        <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
          <DialogTrigger asChild>
            <Button className="bg-tfa-blue hover:bg-tfa-blue/90">
              <Plus className="ml-2 h-4 w-4" />
              إنشاء جلسة تدريب
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إنشاء جلسة تدريب جديدة</DialogTitle>
              <DialogDescription>
                أدخل تفاصيل جلسة التدريب الجديدة
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">عنوان الجلسة *</Label>
                <Input
                  id="title"
                  value={newSession.title}
                  onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                  placeholder="تدريب المهارات الأساسية"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={newSession.description}
                  onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                  placeholder="وصف أنشطة الجلسة..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="start_time">وقت البداية *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={newSession.start_time}
                    onChange={(e) => setNewSession({...newSession, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">وقت النهاية *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={newSession.end_time}
                    onChange={(e) => setNewSession({...newSession, end_time: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">المكان</Label>
                <Input
                  id="location"
                  value={newSession.location}
                  onChange={(e) => setNewSession({...newSession, location: e.target.value})}
                  placeholder="الملعب الرئيسي"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={createTrainingSession}
                disabled={submitting}
                className="bg-tfa-blue hover:bg-tfa-blue/90"
              >
                {submitting ? 'جاري الإنشاء...' : 'إنشاء الجلسة'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-tfa-blue" />
            تحديد الجلسة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="group">المجموعة</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المجموعة" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">البحث عن طالب</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="اسم الطالب أو الرقم"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Sessions */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-tfa-blue" />
              جلسات التدريب لهذا اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{session.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {session.group_name} • {session.start_time} - {session.end_time}
                      {session.location && ` • ${session.location}`}
                    </p>
                  </div>
                  <Badge variant="outline">{session.group_name}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {selectedGroup && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card className="border-tfa-blue/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المجموع</CardTitle>
                <Users className="h-4 w-4 text-tfa-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-tfa-blue">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="border-tfa-green/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">حاضر</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-tfa-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-tfa-green">{stats.present}</div>
              </CardContent>
            </Card>

            <Card className="border-red-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">غائب</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.absent}</div>
              </CardContent>
            </Card>

            <Card className="border-tfa-gold/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متأخر</CardTitle>
                <Clock className="h-4 w-4 text-tfa-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-tfa-gold">{stats.late}</div>
              </CardContent>
            </Card>

            <Card className="border-gray-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معذور</CardTitle>
                <Shield className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-500">{stats.excused}</div>
              </CardContent>
            </Card>
          </div>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-tfa-blue" />
                تسجيل الحضور - {format(new Date(selectedDate), 'EEEE, d MMMM yyyy', { locale: ar })}
              </CardTitle>
              <CardDescription>
                انقر على حالة الحضور لتغييرها
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tfa-blue mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">لا توجد طلاب في هذه المجموعة</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الرقم التعريفي</TableHead>
                      <TableHead>اسم الطالب</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const currentStatus = getAttendanceStatus(student.id);
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.student_code}</TableCell>
                          <TableCell>{student.full_name}</TableCell>
                          <TableCell>{getStatusBadge(currentStatus)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={currentStatus === 'present' ? 'default' : 'outline'}
                                onClick={() => markAttendance(student.id, 'present')}
                                className={currentStatus === 'present' ? 'bg-tfa-green hover:bg-tfa-green/90' : ''}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={currentStatus === 'absent' ? 'destructive' : 'outline'}
                                onClick={() => markAttendance(student.id, 'absent')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={currentStatus === 'late' ? 'default' : 'outline'}
                                onClick={() => markAttendance(student.id, 'late')}
                                className={currentStatus === 'late' ? 'bg-tfa-gold hover:bg-tfa-gold/90' : ''}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={currentStatus === 'excused' ? 'secondary' : 'outline'}
                                onClick={() => markAttendance(student.id, 'excused')}
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Attendance;