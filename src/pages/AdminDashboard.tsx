import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalRegistrations: number;
  pendingRegistrations: number;
  activeCoaches: number;
  totalRevenue: number;
  todaySessions: number;
}

const AdminDashboard = () => {
  const { profile, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    pendingRegistrations: 0,
    activeCoaches: 0,
    totalRevenue: 0,
    todaySessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch registrations count
        const { count: totalRegistrations } = await supabase
          .from('registrations')
          .select('*', { count: 'exact', head: true });

        const { count: pendingRegistrations } = await supabase
          .from('registrations')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch active coaches count if admin
        let activeCoaches = 0;
        if (isAdmin()) {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'coach')
            .eq('is_active', true);
          activeCoaches = count || 0;
        }

        setStats({
          totalRegistrations: totalRegistrations || 0,
          pendingRegistrations: pendingRegistrations || 0,
          activeCoaches,
          totalRevenue: 0, // Will be implemented with payments system
          todaySessions: 0, // Will be implemented with schedule system
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'نهارك سعيد';
    return 'مساء الخير';
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'director': return 'مدير الأكاديمية';
      case 'comptabilite_chief': return 'رئيس المحاسبة';
      case 'coach': return 'مدرب';
      case 'parent': return 'ولي أمر';
      default: return 'مستخدم';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tfa-blue">
            {getGreeting()}، {profile?.full_name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {getRoleTitle(profile?.role || '')} - {profile?.academies?.name || 'الأكاديمية'}
          </p>
        </div>
        <div className="text-left">
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('ar-DZ', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-tfa-blue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <Users className="h-4 w-4 text-tfa-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tfa-blue">{stats.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              جميع طلبات التسجيل
            </p>
          </CardContent>
        </Card>

        <Card className="border-tfa-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">طلبات معلقة</CardTitle>
            <UserPlus className="h-4 w-4 text-tfa-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tfa-gold">{stats.pendingRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              بانتظار المراجعة
            </p>
          </CardContent>
        </Card>

        {isAdmin() && (
          <Card className="border-tfa-green/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المدربين النشطين</CardTitle>
              <CheckCircle className="h-4 w-4 text-tfa-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-tfa-green">{stats.activeCoaches}</div>
              <p className="text-xs text-muted-foreground">
                فريق التدريب
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="border-tfa-red/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">جلسات اليوم</CardTitle>
            <Clock className="h-4 w-4 text-tfa-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tfa-red">{stats.todaySessions}</div>
            <p className="text-xs text-muted-foreground">
              التدريبات المجدولة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-tfa-blue" />
              إجراءات سريعة
            </CardTitle>
            <CardDescription>
              العمليات الأكثر استخداماً
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/admin/students">
              <Button className="w-full justify-start bg-tfa-blue hover:bg-tfa-blue/90">
                <Users className="ml-2 h-4 w-4" />
                إدارة الطلاب
              </Button>
            </Link>
            
            <Link to="/admin/registrations">
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="ml-2 h-4 w-4" />
                مراجعة طلبات التسجيل
              </Button>
            </Link>
            
            {isAdmin() && (
              <Link to="/admin/finance">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="ml-2 h-4 w-4" />
                  إدارة المدفوعات
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-tfa-green" />
              إحصائيات سريعة
            </CardTitle>
            <CardDescription>
              نظرة عامة على الأداء
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">معدل قبول الطلبات</span>
              <span className="text-lg font-bold text-tfa-green">85%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">متوسط الحضور</span>
              <span className="text-lg font-bold text-tfa-blue">92%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">عدد اللاعبين النشطين</span>
              <span className="text-lg font-bold text-tfa-gold">156</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-tfa-blue" />
            النشاطات الأخيرة
          </CardTitle>
          <CardDescription>
            آخر العمليات في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-tfa-green rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">طلب تسجيل جديد</p>
                <p className="text-xs text-muted-foreground">منذ 5 دقائق</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-tfa-blue rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">تم تسجيل حضور الجلسة الصباحية</p>
                <p className="text-xs text-muted-foreground">منذ 30 دقيقة</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-tfa-gold rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">تم قبول طلب تسجيل جديد</p>
                <p className="text-xs text-muted-foreground">منذ ساعة</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;