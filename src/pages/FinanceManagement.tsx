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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar as CalendarIcon,
  Receipt,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit,
  Banknote,
  Coins,
  Wallet,
  Calculator
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Payment {
  id: string;
  student_id: string;
  amount: number;
  payment_type: 'monthly_fee' | 'registration_fee' | 'equipment' | 'tournament' | 'other';
  payment_method: 'cash' | 'bank_transfer' | 'online' | 'check';
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_date?: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  student?: {
    id: string;
    full_name: string;
    student_code: string;
    group_name?: string;
  };
}

interface FeeStructure {
  id: string;
  group_id: string;
  fee_type: string;
  amount: number;
  description: string;
  is_active: boolean;
  group_name?: string;
}

interface PaymentFormData {
  student_id: string;
  amount: string;
  payment_type: 'monthly_fee' | 'registration_fee' | 'equipment' | 'tournament' | 'other';
  payment_method: 'cash' | 'bank_transfer' | 'online' | 'check';
  due_date: Date | undefined;
  payment_reference: string;
  notes: string;
}

interface Student {
  id: string;
  full_name: string;
  student_code: string;
  group_name?: string;
}

const FinanceManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    student_id: '',
    amount: '',
    payment_type: 'monthly_fee',
    payment_method: 'cash',
    due_date: undefined,
    payment_reference: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPayments(),
        fetchFeeStructures(),
        fetchStudents()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    const { data: paymentsData, error } = await supabase
      .from('payments')
      .select(`
        *,
        students(
          id,
          full_name,
          student_code,
          student_groups(name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedPayments = paymentsData?.map(payment => ({
      id: payment.id,
      student_id: payment.student_id,
      amount: payment.amount,
      payment_type: payment.payment_type as 'monthly_fee' | 'registration_fee' | 'equipment' | 'tournament' | 'other',
      payment_method: payment.payment_method as 'cash' | 'bank_transfer' | 'online' | 'check',
      status: payment.status as 'pending' | 'paid' | 'overdue' | 'cancelled',
      due_date: payment.due_date,
      paid_date: payment.paid_date,
      payment_reference: payment.payment_reference,
      notes: payment.notes,
      created_at: payment.created_at,
      student: payment.students ? {
        id: payment.students.id,
        full_name: payment.students.full_name,
        student_code: payment.students.student_code,
        group_name: payment.students.student_groups?.name
      } : undefined
    })) || [];

    setPayments(formattedPayments);
  };

  const fetchFeeStructures = async () => {
    const { data: feeData, error } = await supabase
      .from('fee_structure')
      .select(`
        *,
        student_groups(name)
      `)
      .eq('is_active', true)
      .order('fee_type');

    if (error) throw error;

    const formattedFees = feeData?.map(fee => ({
      ...fee,
      group_name: fee.student_groups?.name
    })) || [];

    setFeeStructures(formattedFees);
  };

  const fetchStudents = async () => {
    const { data: studentsData, error } = await supabase
      .from('students')
      .select(`
        id,
        full_name,
        student_code,
        student_groups(name)
      `)
      .eq('status', 'active')
      .order('full_name');

    if (error) throw error;

    const formattedStudents = studentsData?.map(student => ({
      ...student,
      group_name: student.student_groups?.name
    })) || [];

    setStudents(formattedStudents);
  };

  const createPayment = async () => {
    if (!formData.student_id || !formData.amount || !formData.due_date) {
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
        .from('payments')
        .insert({
          student_id: formData.student_id,
          amount: parseFloat(formData.amount),
          payment_type: formData.payment_type,
          payment_method: formData.payment_method,
          due_date: format(formData.due_date, 'yyyy-MM-dd'),
          payment_reference: formData.payment_reference || null,
          notes: formData.notes || null,
          recorded_by: profile?.user_id
        });

      if (error) throw error;

      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء المدفوعة بنجاح",
      });

      setFormData({
        student_id: '',
        amount: '',
        payment_type: 'monthly_fee',
        payment_method: 'cash',
        due_date: undefined,
        payment_reference: '',
        notes: ''
      });
      setShowAddDialog(false);
      fetchPayments();

    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في إنشاء المدفوعة",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const markPaymentAsPaid = async (paymentId: string, paidDate?: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          paid_date: paidDate || format(new Date(), 'yyyy-MM-dd')
        })
        .eq('id', paymentId);

      if (error) throw error;

      // Generate receipt
      const { data: receiptData, error: receiptError } = await supabase
        .rpc('generate_receipt_number');

      if (receiptError) {
        console.error('Error generating receipt:', receiptError);
      } else {
        await supabase
          .from('payment_receipts')
          .insert({
            payment_id: paymentId,
            receipt_number: receiptData,
            issued_by: profile?.user_id,
            receipt_data: {
              payment_id: paymentId,
              issued_date: new Date().toISOString(),
              issued_by: profile?.full_name
            }
          });
      }

      setPayments(prev => prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: 'paid' as const, paid_date: paidDate || format(new Date(), 'yyyy-MM-dd') }
          : payment
      ));

      toast({
        title: "تم التحديث",
        description: "تم تسجيل الدفع بنجاح",
      });

    } catch (error) {
      console.error('Error marking payment as paid:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تسجيل الدفع",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-tfa-green text-white">مدفوع</Badge>;
      case 'pending':
        return <Badge className="bg-tfa-gold text-white">معلق</Badge>;
      case 'overdue':
        return <Badge variant="destructive">متأخر</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      'cash': 'نقداً',
      'bank_transfer': 'تحويل بنكي',
      'online': 'دفع إلكتروني',
      'check': 'شيك'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.student?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.student?.student_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.payment_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getFinancialStats = () => {
    const totalRevenue = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const pendingAmount = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const overdueAmount = payments
      .filter(p => p.status === 'overdue')
      .reduce((sum, payment) => sum + payment.amount, 0);

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const monthlyRevenue = payments
      .filter(p => p.status === 'paid' && p.paid_date)
      .filter(p => {
        const paidDate = new Date(p.paid_date!);
        return paidDate.getMonth() === thisMonth && paidDate.getFullYear() === thisYear;
      })
      .reduce((sum, payment) => sum + payment.amount, 0);

    return { totalRevenue, pendingAmount, overdueAmount, monthlyRevenue };
  };

  const stats = getFinancialStats();

  // Check if user has finance permissions
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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-tfa-blue">المالية والمدفوعات</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            إدارة المدفوعات والرسوم المالية للأكاديمية
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-tfa-blue hover:bg-tfa-blue/90">
              <Plus className="ml-2 h-4 w-4" />
              إضافة مدفوعة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>إضافة مدفوعة جديدة</DialogTitle>
              <DialogDescription>
                أدخل تفاصيل المدفوعة الجديدة
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="student">الطالب *</Label>
                <Select value={formData.student_id} onValueChange={(value) => setFormData({...formData, student_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الطالب" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} ({student.student_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="payment_type">نوع المدفوعة *</Label>
                  <Select value={formData.payment_type} onValueChange={(value: any) => setFormData({...formData, payment_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly_fee">رسوم شهرية</SelectItem>
                      <SelectItem value="registration_fee">رسوم التسجيل</SelectItem>
                      <SelectItem value="equipment">معدات</SelectItem>
                      <SelectItem value="tournament">بطولة</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">المبلغ (دج) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="payment_method">طريقة الدفع</Label>
                  <Select value={formData.payment_method} onValueChange={(value: any) => setFormData({...formData, payment_method: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقداً</SelectItem>
                      <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="online">دفع إلكتروني</SelectItem>
                      <SelectItem value="check">شيك</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>تاريخ الاستحقاق *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.due_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.due_date ? format(formData.due_date, "dd/MM/yyyy") : "اختر التاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.due_date}
                        onSelect={(date) => setFormData({...formData, due_date: date})}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment_reference">مرجع الدفع</Label>
                <Input
                  id="payment_reference"
                  value={formData.payment_reference}
                  onChange={(e) => setFormData({...formData, payment_reference: e.target.value})}
                  placeholder="رقم الإيصال أو المرجع"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="ملاحظات إضافية..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={createPayment}
                disabled={submitting}
                className="bg-tfa-blue hover:bg-tfa-blue/90"
              >
                {submitting ? 'جاري الإنشاء...' : 'إنشاء المدفوعة'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Financial Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-tfa-green/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <TrendingUp className="h-4 w-4 text-tfa-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tfa-green">
              {stats.totalRevenue.toLocaleString()} دج
            </div>
            <p className="text-xs text-muted-foreground">
              جميع المدفوعات المحصلة
            </p>
          </CardContent>
        </Card>

        <Card className="border-tfa-blue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إيرادات هذا الشهر</CardTitle>
            <DollarSign className="h-4 w-4 text-tfa-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tfa-blue">
              {stats.monthlyRevenue.toLocaleString()} دج
            </div>
            <p className="text-xs text-muted-foreground">
              المدفوعات في {format(new Date(), 'MMMM yyyy', { locale: ar })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-tfa-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مدفوعات معلقة</CardTitle>
            <AlertCircle className="h-4 w-4 text-tfa-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tfa-gold">
              {stats.pendingAmount.toLocaleString()} دج
            </div>
            <p className="text-xs text-muted-foreground">
              في انتظار الدفع
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مدفوعات متأخرة</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {stats.overdueAmount.toLocaleString()} دج
            </div>
            <p className="text-xs text-muted-foreground">
              تجاوزت تاريخ الاستحقاق
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payments" className="text-sm">المدفوعات</TabsTrigger>
          <TabsTrigger value="fee-structure" className="text-sm">هيكل الرسوم</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-tfa-blue" />
                البحث والتصفية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">البحث</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="اسم الطالب أو الرقم أو المرجع"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">حالة الدفع</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="paid">مدفوع</SelectItem>
                      <SelectItem value="pending">معلق</SelectItem>
                      <SelectItem value="overdue">متأخر</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">نوع المدفوعة</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      <SelectItem value="monthly_fee">رسوم شهرية</SelectItem>
                      <SelectItem value="registration_fee">رسوم التسجيل</SelectItem>
                      <SelectItem value="equipment">معدات</SelectItem>
                      <SelectItem value="tournament">بطولة</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-tfa-blue" />
                قائمة المدفوعات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">لا توجد مدفوعات</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الطالب</TableHead>
                          <TableHead>النوع</TableHead>
                          <TableHead>المبلغ</TableHead>
                          <TableHead>تاريخ الاستحقاق</TableHead>
                          <TableHead>الحالة</TableHead>
                          <TableHead>الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{payment.student?.full_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {payment.student?.student_code} • {payment.student?.group_name}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{getPaymentTypeLabel(payment.payment_type)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {getPaymentMethodLabel(payment.payment_method)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono font-medium">
                              {payment.amount.toLocaleString()} دج
                            </TableCell>
                            <TableCell>
                              <div>
                                <p>{format(new Date(payment.due_date), 'dd/MM/yyyy')}</p>
                                {payment.paid_date && (
                                  <p className="text-sm text-tfa-green">
                                    دُفع في {format(new Date(payment.paid_date), 'dd/MM/yyyy')}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {payment.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    onClick={() => markPaymentAsPaid(payment.id)}
                                    className="bg-tfa-green hover:bg-tfa-green/90"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setShowReceiptDialog(true);
                                  }}
                                >
                                  <Receipt className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4 p-4">
                    {filteredPayments.map((payment) => (
                      <Card key={payment.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{payment.student?.full_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {payment.student?.student_code} • {payment.student?.group_name}
                              </p>
                            </div>
                            {getStatusBadge(payment.status)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">النوع:</span>
                              <p className="font-medium">{getPaymentTypeLabel(payment.payment_type)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">المبلغ:</span>
                              <p className="font-mono font-medium">{payment.amount.toLocaleString()} دج</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">الاستحقاق:</span>
                              <p>{format(new Date(payment.due_date), 'dd/MM/yyyy')}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">الطريقة:</span>
                              <p>{getPaymentMethodLabel(payment.payment_method)}</p>
                            </div>
                          </div>
                          
                          {payment.paid_date && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">تاريخ الدفع:</span>
                              <p className="text-tfa-green">
                                {format(new Date(payment.paid_date), 'dd/MM/yyyy')}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex gap-2 pt-2">
                            {payment.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => markPaymentAsPaid(payment.id)}
                                className="bg-tfa-green hover:bg-tfa-green/90 flex-1"
                              >
                                <CheckCircle2 className="h-4 w-4 ml-1" />
                                تسجيل الدفع
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowReceiptDialog(true);
                              }}
                              className="flex-1"
                            >
                              <Receipt className="h-4 w-4 ml-1" />
                              الإيصال
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fee-structure" className="space-y-6">
          {/* Fee Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-tfa-blue" />
                هيكل الرسوم
              </CardTitle>
              <CardDescription>
                الرسوم المحددة لكل مجموعة ونوع الخدمة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {feeStructures.map((fee) => (
                  <Card key={fee.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{fee.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {fee.group_name} • {getPaymentTypeLabel(fee.fee_type)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-lg">
                            {fee.amount.toLocaleString()} دج
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              إيصال الدفع
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4 py-4">
              <div className="text-center border-b pb-4">
                <h3 className="font-bold text-lg">أكاديمية تكنو لكرة القدم</h3>
                <p className="text-sm text-muted-foreground">إيصال دفع</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الطالب:</span>
                  <span className="font-medium">{selectedPayment.student?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">رقم الطالب:</span>
                  <span>{selectedPayment.student?.student_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نوع الدفع:</span>
                  <span>{getPaymentTypeLabel(selectedPayment.payment_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المبلغ:</span>
                  <span className="font-mono font-bold">{selectedPayment.amount.toLocaleString()} دج</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">طريقة الدفع:</span>
                  <span>{getPaymentMethodLabel(selectedPayment.payment_method)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاريخ الدفع:</span>
                  <span>
                    {selectedPayment.paid_date 
                      ? format(new Date(selectedPayment.paid_date), 'dd/MM/yyyy')
                      : 'لم يدفع بعد'
                    }
                  </span>
                </div>
                {selectedPayment.payment_reference && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المرجع:</span>
                    <span>{selectedPayment.payment_reference}</span>
                  </div>
                )}
              </div>
              <div className="text-center pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  تاريخ الإصدار: {format(new Date(), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={() => window.print()}
              className="bg-tfa-blue hover:bg-tfa-blue/90"
            >
              <Download className="ml-2 h-4 w-4" />
              طباعة الإيصال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceManagement;