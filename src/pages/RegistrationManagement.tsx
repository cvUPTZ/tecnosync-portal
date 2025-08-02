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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Eye,
  Check,
  X,
  Download,
  RefreshCw,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Registration {
  id: string;
  full_name: string;
  date_of_birth: string;
  nationality: string;
  phone: string;
  email: string;
  address: string;
  parent_name?: string | null;
  parent_phone?: string | null;
  parent_email?: string | null;
  parent_id_number?: string | null;
  parent_profession?: string | null;
  position?: string | null;
  previous_experience?: string | null;
  medical_conditions?: string | null;
  preferred_foot?: string | null;
  program_preference?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;
  how_did_you_hear?: string | null;
  additional_notes?: string | null;
  status: string;
  application_date: string;
  created_at: string;
  updated_at: string;
}

const RegistrationManagement = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const { profile, isAdmin } = useAuth();

  // Fetch registrations
  const fetchRegistrations = async () => {
    if (!profile?.academy_id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('academy_id', profile.academy_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRegistrations(data as Registration[] || []);
      setFilteredRegistrations(data as Registration[] || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
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
    fetchRegistrations();
  }, []);

  // Filter registrations
  useEffect(() => {
    let filtered = registrations;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(reg =>
        reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone.includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.status === statusFilter);
    }

    setFilteredRegistrations(filtered);
  }, [registrations, searchTerm, statusFilter]);

  // Update registration status
  const updateRegistrationStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    if (!profile?.academy_id) return;
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('academy_id', profile.academy_id);

      if (error) throw error;

      // Update local state
      setRegistrations(prev =>
        prev.map(reg =>
          reg.id === id
            ? { ...reg, status: newStatus, updated_at: new Date().toISOString() }
            : reg
        )
      );

      toast({
        title: 'تم التحديث',
        description: `تم ${newStatus === 'approved' ? 'قبول' : 'رفض'} الطلب بنجاح`,
      });
    } catch (error) {
      console.error('Error updating registration:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث الطلب',
        variant: 'destructive',
      });
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">مقبول</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">مرفوض</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">معلق</Badge>;
    }
  };

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

  // Statistics
  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };

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
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tfa-blue">إدارة طلبات التسجيل</h1>
          <p className="text-muted-foreground mt-1">
            مراجعة والموافقة على طلبات الانضمام للأكاديمية
          </p>
        </div>
        <Button onClick={fetchRegistrations} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 ml-2" />
          تحديث
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-2 bg-tfa-blue/10 rounded-lg">
                <FileText className="h-6 w-6 text-tfa-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">معلقة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">مقبولة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-sm text-muted-foreground">مرفوضة</p>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">معلقة</SelectItem>
                <SelectItem value="approved">مقبولة</SelectItem>
                <SelectItem value="rejected">مرفوضة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة طلبات التسجيل</CardTitle>
          <CardDescription>
            {filteredRegistrations.length} من أصل {registrations.length} طلب
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم الكامل</TableHead>
                  <TableHead>العمر</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>تاريخ التقديم</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      {registration.full_name}
                    </TableCell>
                    <TableCell>
                      {calculateAge(registration.date_of_birth)} سنة
                    </TableCell>
                    <TableCell>{registration.phone}</TableCell>
                    <TableCell>{registration.email}</TableCell>
                    <TableCell>
                      {new Date(registration.application_date).toLocaleDateString('ar-DZ')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(registration.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setShowDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {registration.status === 'pending' && (isAdmin() || profile?.role === 'coach') && (
                          <>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-green-600">
                                  <Check className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>قبول الطلب</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من قبول طلب تسجيل {registration.full_name}؟
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => updateRegistrationStatus(registration.id, 'approved')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    قبول
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <X className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>رفض الطلب</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من رفض طلب تسجيل {registration.full_name}؟
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => updateRegistrationStatus(registration.id, 'rejected')}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    رفض
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
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

      {/* Registration Details Dialog */}
      {selectedRegistration && showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">تفاصيل طلب التسجيل</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">البيانات الشخصية</TabsTrigger>
                  <TabsTrigger value="contact">معلومات الاتصال</TabsTrigger>
                  <TabsTrigger value="football">المعلومات الرياضية</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الاسم الكامل</label>
                      <div className="p-3 bg-gray-50 rounded border">
                        {selectedRegistration.full_name}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">تاريخ الميلاد</label>
                      <div className="p-3 bg-gray-50 rounded border">
                        {new Date(selectedRegistration.date_of_birth).toLocaleDateString('ar-DZ')} 
                        ({calculateAge(selectedRegistration.date_of_birth)} سنة)
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الجنسية</label>
                      <div className="p-3 bg-gray-50 rounded border">
                        {selectedRegistration.nationality}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">العنوان</label>
                      <div className="p-3 bg-gray-50 rounded border">
                        {selectedRegistration.address}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">رقم الهاتف</label>
                      <div className="p-3 bg-gray-50 rounded border">
                        {selectedRegistration.phone}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">البريد الإلكتروني</label>
                      <div className="p-3 bg-gray-50 rounded border">
                        {selectedRegistration.email}
                      </div>
                    </div>
                    {selectedRegistration.parent_name && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">اسم ولي الأمر</label>
                          <div className="p-3 bg-gray-50 rounded border">
                            {selectedRegistration.parent_name}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">هاتف ولي الأمر</label>
                          <div className="p-3 bg-gray-50 rounded border">
                            {selectedRegistration.parent_phone}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="football" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRegistration.position && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">المركز المفضل</label>
                        <div className="p-3 bg-gray-50 rounded border">
                          {selectedRegistration.position}
                        </div>
                      </div>
                    )}
                    {selectedRegistration.preferred_foot && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">القدم المفضلة</label>
                        <div className="p-3 bg-gray-50 rounded border">
                          {selectedRegistration.preferred_foot}
                        </div>
                      </div>
                    )}
                    {selectedRegistration.previous_experience && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">الخبرة السابقة</label>
                        <div className="p-3 bg-gray-50 rounded border">
                          {selectedRegistration.previous_experience}
                        </div>
                      </div>
                    )}
                    {selectedRegistration.medical_conditions && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">الحالات الطبية</label>
                        <div className="p-3 bg-gray-50 rounded border">
                          {selectedRegistration.medical_conditions}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">الحالة:</span>
                  {getStatusBadge(selectedRegistration.status)}
                </div>
                
                {selectedRegistration.status === 'pending' && (isAdmin() || profile?.role === 'coach') && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateRegistrationStatus(selectedRegistration.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 ml-2" />
                      قبول
                    </Button>
                    <Button
                      onClick={() => updateRegistrationStatus(selectedRegistration.id, 'rejected')}
                      variant="destructive"
                    >
                      <X className="w-4 h-4 ml-2" />
                      رفض
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationManagement;