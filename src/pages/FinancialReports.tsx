import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar as CalendarIcon,
  Download,
  FileText,
  PieChart,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Receipt,
  Calculator
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface RevenueData {
  month: string;
  revenue: number;
  payments_count: number;
}

interface PaymentSummary {
  payment_type: string;
  total_amount: number;
  count: number;
  avg_amount: number;
}

interface StudentPaymentStatus {
  student_id: string;
  student_name: string;
  student_code: string;
  group_name: string;
  total_due: number;
  total_paid: number;
  outstanding: number;
  overdue_count: number;
}

interface FinancialMetrics {
  totalRevenue: number;
  monthlyAverage: number;
  growthRate: number;
  collectionRate: number;
  overdueRate: number;
  activeStudents: number;
}

const FinancialReports = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: startOfYear(new Date()),
    to: new Date()
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary[]>([]);
  const [studentStatus, setStudentStatus] = useState<StudentPaymentStatus[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    monthlyAverage: 0,
    growthRate: 0,
    collectionRate: 0,
    overdueRate: 0,
    activeStudents: 0
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchReportsData();
  }, [dateRange, selectedPeriod]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchRevenueData(),
        fetchPaymentSummary(),
        fetchStudentPaymentStatus(),
        fetchFinancialMetrics()
      ]);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل التقارير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('paid_date, amount, payment_type')
      .eq('status', 'paid')
      .gte('paid_date', format(dateRange.from, 'yyyy-MM-dd'))
      .lte('paid_date', format(dateRange.to, 'yyyy-MM-dd'))
      .order('paid_date');

    if (error) throw error;

    // Group by month
    const monthlyData: { [key: string]: { revenue: number; count: number } } = {};
    
    data?.forEach(payment => {
      if (!payment.paid_date) return;
      const monthKey = format(new Date(payment.paid_date), 'yyyy-MM');
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, count: 0 };
      }
      monthlyData[monthKey].revenue += payment.amount;
      monthlyData[monthKey].count += 1;
    });

    const formattedData = Object.entries(monthlyData).map(([month, data]) => ({
      month: format(new Date(month + '-01'), 'MMM yyyy', { locale: ar }),
      revenue: data.revenue,
      payments_count: data.count
    }));

    setRevenueData(formattedData);
  };

  const fetchPaymentSummary = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('payment_type, amount, status')
      .gte('created_at', format(dateRange.from, 'yyyy-MM-dd'))
      .lte('created_at', format(dateRange.to, 'yyyy-MM-dd'));

    if (error) throw error;

    const summary: { [key: string]: { total: number; count: number; paid: number } } = {};
    
    data?.forEach(payment => {
      if (!summary[payment.payment_type]) {
        summary[payment.payment_type] = { total: 0, count: 0, paid: 0 };
      }
      summary[payment.payment_type].total += payment.amount;
      summary[payment.payment_type].count += 1;
      if (payment.status === 'paid') {
        summary[payment.payment_type].paid += payment.amount;
      }
    });

    const formattedSummary = Object.entries(summary).map(([type, data]) => ({
      payment_type: type,
      total_amount: data.total,
      count: data.count,
      avg_amount: data.total / data.count
    }));

    setPaymentSummary(formattedSummary);
  };

  const fetchStudentPaymentStatus = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        student_id,
        amount,
        status,
        due_date,
        students(
          full_name,
          student_code,
          student_groups(name)
        )
      `)
      .gte('created_at', format(dateRange.from, 'yyyy-MM-dd'))
      .lte('created_at', format(dateRange.to, 'yyyy-MM-dd'));

    if (error) throw error;

    const studentData: { [key: string]: {
      student_name: string;
      student_code: string;
      group_name: string;
      total_due: number;
      total_paid: number;
      overdue_count: number;
    } } = {};

    data?.forEach(payment => {
      const studentId = payment.student_id;
      if (!studentData[studentId]) {
        const student = Array.isArray(payment.students) ? payment.students[0] : payment.students;
        studentData[studentId] = {
          student_name: student?.full_name || '',
          student_code: student?.student_code || '',
          group_name: Array.isArray(student?.student_groups) ? student?.student_groups[0]?.name : (student?.student_groups as any)?.name || '',
          total_due: 0,
          total_paid: 0,
          overdue_count: 0
        };
      }
      
      studentData[studentId].total_due += payment.amount;
      if (payment.status === 'paid') {
        studentData[studentId].total_paid += payment.amount;
      }
      if (payment.status === 'overdue') {
        studentData[studentId].overdue_count += 1;
      }
    });

    const formattedStatus = Object.entries(studentData).map(([studentId, data]) => ({
      student_id: studentId,
      student_name: data.student_name,
      student_code: data.student_code,
      group_name: data.group_name,
      total_due: data.total_due,
      total_paid: data.total_paid,
      outstanding: data.total_due - data.total_paid,
      overdue_count: data.overdue_count
    }));

    setStudentStatus(formattedStatus.sort((a, b) => b.outstanding - a.outstanding));
  };

  const fetchFinancialMetrics = async () => {
    // Get all payments data for calculations
    const { data: allPayments } = await supabase
      .from('payments')
      .select('amount, status, paid_date, created_at');

    const { data: students } = await supabase
      .from('students')
      .select('id')
      .eq('status', 'active');

    if (!allPayments) return;

    const paidPayments = allPayments.filter(p => p.status === 'paid');
    const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    
    // Calculate monthly average (last 12 months)
    const last12Months = subMonths(new Date(), 12);
    const recentPayments = paidPayments.filter(p => 
      p.paid_date && new Date(p.paid_date) >= last12Months
    );
    const monthlyAverage = recentPayments.reduce((sum, p) => sum + p.amount, 0) / 12;

    // Calculate growth rate (current month vs previous month)
    const currentMonth = startOfMonth(new Date());
    const previousMonth = startOfMonth(subMonths(new Date(), 1));
    
    const currentMonthRevenue = paidPayments
      .filter(p => p.paid_date && new Date(p.paid_date) >= currentMonth)
      .reduce((sum, p) => sum + p.amount, 0);
    
    const previousMonthRevenue = paidPayments
      .filter(p => p.paid_date && 
        new Date(p.paid_date) >= previousMonth && 
        new Date(p.paid_date) < currentMonth)
      .reduce((sum, p) => sum + p.amount, 0);

    const growthRate = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0;

    // Collection and overdue rates
    const totalDue = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const collectionRate = totalDue > 0 ? (totalRevenue / totalDue) * 100 : 0;
    
    const overduePayments = allPayments.filter(p => p.status === 'overdue');
    const overdueRate = allPayments.length > 0 
      ? (overduePayments.length / allPayments.length) * 100 
      : 0;

    setMetrics({
      totalRevenue,
      monthlyAverage,
      growthRate,
      collectionRate,
      overdueRate,
      activeStudents: students?.length || 0
    });
  };

  const exportReport = () => {
    // Simple export functionality - in a real app, you'd generate PDF/Excel
    const reportData = {
      period: `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`,
      metrics,
      revenueData,
      paymentSummary,
      studentStatus: studentStatus.slice(0, 10) // Top 10 for export
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    
    toast({
      title: "تم التصدير",
      description: "تم تصدير التقرير بنجاح",
    });
  };

  const getPaymentTypeLabel = (type: string) => {
    const types = {
      'monthly_fee': 'رسوم شهرية',
      'registration_fee': 'رسوم التسجيل',
      'equipment': 'معدات',
      'tournament': 'بطولة',
      'other': 'أخرى'
    };
    return types[type as keyof typeof types] || type;
  };

  // Check permissions
  if (!profile || !['director', 'comptabilite_chief'].includes(profile.role)) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tfa-blue">التقارير المالية</h1>
          <p className="text-muted-foreground mt-1">
            تحليلات وتقارير مالية شاملة للأكاديمية
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">شهري</SelectItem>
              <SelectItem value="quarter">ربع سنوي</SelectItem>
              <SelectItem value="year">سنوي</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} className="bg-tfa-blue hover:bg-tfa-blue/90">
            <Download className="ml-2 h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-tfa-green/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">إجمالي الإيرادات</CardTitle>
            <TrendingUp className="h-4 w-4 text-tfa-green" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-tfa-green">
              {metrics.totalRevenue.toLocaleString()} دج
            </div>
          </CardContent>
        </Card>

        <Card className="border-tfa-blue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">المتوسط الشهري</CardTitle>
            <DollarSign className="h-4 w-4 text-tfa-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-tfa-blue">
              {metrics.monthlyAverage.toLocaleString()} دج
            </div>
          </CardContent>
        </Card>

        <Card className="border-tfa-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">نمو الإيرادات</CardTitle>
            <BarChart3 className="h-4 w-4 text-tfa-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-tfa-gold">
              {metrics.growthRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="border-tfa-green/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">معدل التحصيل</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-tfa-green" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-tfa-green">
              {metrics.collectionRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">معدل التأخير</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-500">
              {metrics.overdueRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="border-tfa-blue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">الطلاب النشطين</CardTitle>
            <Users className="h-4 w-4 text-tfa-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-tfa-blue">
              {metrics.activeStudents}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
          <TabsTrigger value="payments">أنواع المدفوعات</TabsTrigger>
          <TabsTrigger value="students">حالة الطلاب</TabsTrigger>
          <TabsTrigger value="analysis">التحليل المالي</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-tfa-blue" />
                تطور الإيرادات الشهرية
              </CardTitle>
              <CardDescription>
                الإيرادات المحصلة لكل شهر خلال الفترة المحددة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{data.month}</h4>
                      <p className="text-sm text-muted-foreground">
                        {data.payments_count} مدفوعة
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-lg text-tfa-green">
                        {data.revenue.toLocaleString()} دج
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          {/* Payment Types Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-tfa-blue" />
                ملخص أنواع المدفوعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نوع المدفوعة</TableHead>
                    <TableHead>العدد</TableHead>
                    <TableHead>إجمالي المبلغ</TableHead>
                    <TableHead>متوسط المبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentSummary.map((summary, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {getPaymentTypeLabel(summary.payment_type)}
                      </TableCell>
                      <TableCell>{summary.count}</TableCell>
                      <TableCell className="font-mono">
                        {summary.total_amount.toLocaleString()} دج
                      </TableCell>
                      <TableCell className="font-mono">
                        {summary.avg_amount.toLocaleString()} دج
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          {/* Student Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-tfa-blue" />
                حالة مدفوعات الطلاب
              </CardTitle>
              <CardDescription>
                ملخص المدفوعات المستحقة والمدفوعة لكل طالب
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الطالب</TableHead>
                    <TableHead>المجموعة</TableHead>
                    <TableHead>إجمالي المستحق</TableHead>
                    <TableHead>المدفوع</TableHead>
                    <TableHead>المتبقي</TableHead>
                    <TableHead>متأخرات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentStatus.slice(0, 20).map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.student_name}</p>
                          <p className="text-sm text-muted-foreground">{student.student_code}</p>
                        </div>
                      </TableCell>
                      <TableCell>{student.group_name}</TableCell>
                      <TableCell className="font-mono">
                        {student.total_due.toLocaleString()} دج
                      </TableCell>
                      <TableCell className="font-mono text-tfa-green">
                        {student.total_paid.toLocaleString()} دج
                      </TableCell>
                      <TableCell className="font-mono">
                        {student.outstanding > 0 ? (
                          <span className="text-red-500">
                            {student.outstanding.toLocaleString()} دج
                          </span>
                        ) : (
                          <span className="text-tfa-green">0 دج</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.overdue_count > 0 ? (
                          <Badge variant="destructive">{student.overdue_count}</Badge>
                        ) : (
                          <Badge className="bg-tfa-green text-white">0</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Financial Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-tfa-blue" />
                  التحليل المالي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>معدل النمو الشهري:</span>
                  <span className={cn(
                    "font-bold",
                    metrics.growthRate >= 0 ? "text-tfa-green" : "text-red-500"
                  )}>
                    {metrics.growthRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>كفاءة التحصيل:</span>
                  <span className={cn(
                    "font-bold",
                    metrics.collectionRate >= 90 ? "text-tfa-green" : 
                    metrics.collectionRate >= 70 ? "text-tfa-gold" : "text-red-500"
                  )}>
                    {metrics.collectionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>متوسط الإيراد لكل طالب:</span>
                  <span className="font-mono font-bold">
                    {metrics.activeStudents > 0 
                      ? (metrics.totalRevenue / metrics.activeStudents).toLocaleString()
                      : '0'
                    } دج
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-tfa-gold" />
                  مؤشرات الأداء
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>معدل التحصيل</span>
                    <span>{metrics.collectionRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-tfa-green h-2 rounded-full" 
                      style={{ width: `${Math.min(metrics.collectionRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>معدل التأخير</span>
                    <span>{metrics.overdueRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(metrics.overdueRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-tfa-blue" />
                توصيات مالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.collectionRate < 80 && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">تحسين معدل التحصيل</p>
                      <p className="text-sm text-red-600">
                        معدل التحصيل منخفض ({metrics.collectionRate.toFixed(1)}%). 
                        يُنصح بتحسين نظام المتابعة مع أولياء الأمور.
                      </p>
                    </div>
                  </div>
                )}
                
                {metrics.overdueRate > 15 && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">تقليل المتأخرات</p>
                      <p className="text-sm text-yellow-600">
                        معدل المتأخرات مرتفع ({metrics.overdueRate.toFixed(1)}%). 
                        يُنصح بإرسال تذكيرات دورية قبل مواعيد الاستحقاق.
                      </p>
                    </div>
                  </div>
                )}

                {metrics.growthRate > 10 && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">أداء ممتاز</p>
                      <p className="text-sm text-green-600">
                        نمو إيرادات ممتاز ({metrics.growthRate.toFixed(1)}%). 
                        استمر في التطوير والحفاظ على هذا المستوى.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReports;