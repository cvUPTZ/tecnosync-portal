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
import { 
  FileText,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  FolderOpen,
  Tag,
  Share,
  Lock,
  Globe,
  Shield,
  Plus,
  File,
  FileImage,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Document {
  id: string;
  title: string;
  description?: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
  category: string;
  visibility: string;
  tags?: string[];
  uploaded_by?: string;
  student_id?: string;
  group_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  uploader_name?: string;
  student_name?: string;
  group_name?: string;
}

interface Student {
  id: string;
  full_name: string;
  student_code: string;
}

interface Group {
  id: string;
  name: string;
}

interface DocumentFormData {
  title: string;
  description: string;
  category: string;
  visibility: string;
  tags: string;
  student_id: string;
  group_id: string;
  file: File | null;
}

const DocumentManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    description: '',
    category: 'general',
    visibility: 'internal',
    tags: '',
    student_id: '',
    group_id: '',
    file: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchDocuments(),
        fetchStudents(),
        fetchGroups()
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

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        students(full_name),
        student_groups(name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get uploader names separately
    const documentsWithUploaders = await Promise.all((data || []).map(async (doc) => {
      let uploaderName = '';
      if (doc.uploaded_by) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', doc.uploaded_by)
          .single();
        uploaderName = profileData?.full_name || '';
      }

      return {
        ...doc,
        uploader_name: uploaderName,
        student_name: doc.students?.full_name,
        group_name: doc.student_groups?.name
      };
    }));

    setDocuments(documentsWithUploaders);
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('id, full_name, student_code')
      .eq('status', 'active')
      .order('full_name');

    if (error) throw error;
    setStudents(data || []);
  };

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from('student_groups')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    setGroups(data || []);
  };

  const handleFileUpload = async () => {
    if (!formData.file || !formData.title) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة واختيار ملف",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // Determine bucket based on category
      const bucket = formData.category === 'student_docs' ? 'student-documents' : 'documents';
      
      // Create unique file path
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${formData.category}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;

      // Save document metadata
      const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          title: formData.title,
          description: formData.description || null,
          file_path: filePath,
          file_name: formData.file.name,
          file_size: formData.file.size,
          file_type: formData.file.type,
          category: formData.category,
          visibility: formData.visibility,
          tags: tagsArray.length > 0 ? tagsArray : null,
          student_id: formData.student_id || null,
          group_id: formData.group_id || null,
          uploaded_by: profile?.user_id
        });

      if (dbError) throw dbError;

      // Log the upload action
      await supabase.rpc('log_document_access', {
        p_document_id: null, // Will be filled when we have the actual document ID
        p_action: 'upload'
      });

      toast({
        title: "تم الرفع",
        description: "تم رفع الوثيقة بنجاح",
      });

      setFormData({
        title: '',
        description: '',
        category: 'general',
        visibility: 'internal',
        tags: '',
        student_id: '',
        group_id: '',
        file: null
      });
      setShowUploadDialog(false);
      fetchDocuments();

    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في رفع الوثيقة",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadDocument = async (document: Document) => {
    try {
      const bucket = document.category === 'student_docs' ? 'student-documents' : 'documents';
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(document.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const linkElement = globalThis.document.createElement('a');
      linkElement.href = url;
      linkElement.download = document.file_name;
      linkElement.click();
      URL.revokeObjectURL(url);

      // Log the download action
      await supabase.rpc('log_document_access', {
        p_document_id: document.id,
        p_action: 'download'
      });

      toast({
        title: "تم التحميل",
        description: "تم تحميل الوثيقة بنجاح",
      });

    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل الوثيقة",
        variant: "destructive",
      });
    }
  };

  const deleteDocument = async (document: Document) => {
    if (!confirm('هل أنت متأكد من حذف هذه الوثيقة؟')) return;

    try {
      const bucket = document.category === 'student_docs' ? 'student-documents' : 'documents';
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Soft delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .update({ is_active: false })
        .eq('id', document.id);

      if (dbError) throw dbError;

      // Log the delete action
      await supabase.rpc('log_document_access', {
        p_document_id: document.id,
        p_action: 'delete'
      });

      toast({
        title: "تم الحذف",
        description: "تم حذف الوثيقة بنجاح",
      });

      fetchDocuments();

    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف الوثيقة",
        variant: "destructive",
      });
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      'general': 'عام',
      'policies': 'السياسات',
      'forms': 'النماذج',
      'reports': 'التقارير',
      'certificates': 'الشهادات',
      'student_docs': 'وثائق الطلاب',
      'financial': 'مالية',
      'legal': 'قانونية',
      'training': 'تدريب'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getVisibilityLabel = (visibility: string) => {
    const visibilities = {
      'public': 'عام',
      'internal': 'داخلي',
      'restricted': 'مقيد',
      'private': 'خاص'
    };
    return visibilities[visibility as keyof typeof visibilities] || visibility;
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4 text-tfa-green" />;
      case 'internal': return <Shield className="h-4 w-4 text-tfa-blue" />;
      case 'restricted': return <Lock className="h-4 w-4 text-tfa-gold" />;
      case 'private': return <Lock className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="h-4 w-4 text-tfa-blue" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="h-4 w-4 text-tfa-green" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesVisibility = visibilityFilter === 'all' || doc.visibility === visibilityFilter;

    return matchesSearch && matchesCategory && matchesVisibility;
  });

  const getDocumentStats = () => {
    const total = documents.length;
    const byCategory = documents.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const totalSize = documents.reduce((sum, doc) => sum + doc.file_size, 0);
    
    return { total, byCategory, totalSize };
  };

  const stats = getDocumentStats();

  // Check permissions
  const canUpload = profile && ['director', 'comptabilite_chief', 'coach'].includes(profile.role);
  const canManage = profile && ['director', 'comptabilite_chief'].includes(profile.role);

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
          <h1 className="text-3xl font-bold text-tfa-blue">إدارة الوثائق</h1>
          <p className="text-muted-foreground mt-1">
            إدارة وتنظيم وثائق الأكاديمية
          </p>
        </div>
        {canUpload && (
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="bg-tfa-blue hover:bg-tfa-blue/90">
                <Upload className="ml-2 h-4 w-4" />
                رفع وثيقة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>رفع وثيقة جديدة</DialogTitle>
                <DialogDescription>
                  اختر الملف وأدخل المعلومات المطلوبة
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">عنوان الوثيقة *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="أدخل عنوان الوثيقة"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="وصف مختصر للوثيقة..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="category">التصنيف</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">عام</SelectItem>
                        <SelectItem value="policies">السياسات</SelectItem>
                        <SelectItem value="forms">النماذج</SelectItem>
                        <SelectItem value="reports">التقارير</SelectItem>
                        <SelectItem value="certificates">الشهادات</SelectItem>
                        <SelectItem value="student_docs">وثائق الطلاب</SelectItem>
                        <SelectItem value="financial">مالية</SelectItem>
                        <SelectItem value="legal">قانونية</SelectItem>
                        <SelectItem value="training">تدريب</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="visibility">مستوى الوصول</Label>
                    <Select value={formData.visibility} onValueChange={(value) => setFormData({...formData, visibility: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">عام</SelectItem>
                        <SelectItem value="internal">داخلي</SelectItem>
                        <SelectItem value="restricted">مقيد</SelectItem>
                        <SelectItem value="private">خاص</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.category === 'student_docs' && (
                  <div className="grid gap-2">
                    <Label htmlFor="student">الطالب</Label>
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
                )}
                <div className="grid gap-2">
                  <Label htmlFor="group">المجموعة (اختياري)</Label>
                  <Select value={formData.group_id} onValueChange={(value) => setFormData({...formData, group_id: value})}>
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
                <div className="grid gap-2">
                  <Label htmlFor="tags">العلامات</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="علامة1, علامة2, علامة3"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="file">الملف *</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFormData({...formData, file: e.target.files?.[0] || null})}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className="bg-tfa-blue hover:bg-tfa-blue/90"
                >
                  {uploading ? 'جاري الرفع...' : 'رفع الوثيقة'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-tfa-blue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الوثائق</CardTitle>
            <FileText className="h-4 w-4 text-tfa-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tfa-blue">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-tfa-green/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحجم الإجمالي</CardTitle>
            <FolderOpen className="h-4 w-4 text-tfa-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tfa-green">
              {formatFileSize(stats.totalSize)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-tfa-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">وثائق الطلاب</CardTitle>
            <Tag className="h-4 w-4 text-tfa-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tfa-gold">
              {stats.byCategory.student_docs || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-tfa-red/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التقارير</CardTitle>
            <FileText className="h-4 w-4 text-tfa-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tfa-red">
              {stats.byCategory.reports || 0}
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="العنوان، الوصف، اسم الملف أو العلامات"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category-filter">التصنيف</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التصنيفات</SelectItem>
                  <SelectItem value="general">عام</SelectItem>
                  <SelectItem value="policies">السياسات</SelectItem>
                  <SelectItem value="forms">النماذج</SelectItem>
                  <SelectItem value="reports">التقارير</SelectItem>
                  <SelectItem value="certificates">الشهادات</SelectItem>
                  <SelectItem value="student_docs">وثائق الطلاب</SelectItem>
                  <SelectItem value="financial">مالية</SelectItem>
                  <SelectItem value="legal">قانونية</SelectItem>
                  <SelectItem value="training">تدريب</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="visibility-filter">مستوى الوصول</Label>
              <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="public">عام</SelectItem>
                  <SelectItem value="internal">داخلي</SelectItem>
                  <SelectItem value="restricted">مقيد</SelectItem>
                  <SelectItem value="private">خاص</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-tfa-blue" />
            قائمة الوثائق
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground">لا توجد وثائق</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الوثيقة</TableHead>
                  <TableHead>التصنيف</TableHead>
                  <TableHead>مستوى الوصول</TableHead>
                  <TableHead>الحجم</TableHead>
                  <TableHead>تاريخ الرفع</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        {getFileIcon(document.file_type)}
                        <div className="flex-1">
                          <p className="font-medium">{document.title}</p>
                          <p className="text-sm text-muted-foreground">{document.file_name}</p>
                          {document.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {document.description}
                            </p>
                          )}
                          {document.tags && document.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {document.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {(document.student_name || document.group_name) && (
                            <div className="flex gap-2 mt-1">
                              {document.student_name && (
                                <Badge variant="secondary" className="text-xs">
                                  {document.student_name}
                                </Badge>
                              )}
                              {document.group_name && (
                                <Badge variant="outline" className="text-xs">
                                  {document.group_name}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getCategoryLabel(document.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getVisibilityIcon(document.visibility)}
                        <span className="text-sm">
                          {getVisibilityLabel(document.visibility)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatFileSize(document.file_size)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {format(new Date(document.created_at), 'dd/MM/yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          بواسطة {document.uploader_name || 'غير معروف'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadDocument(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {canManage && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteDocument(document)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentManagement;