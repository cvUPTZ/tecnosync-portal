import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout = () => {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tfa-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  console.log('AdminLayout - user:', user, 'profile:', profile);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user exists but profile is still loading, show loading state
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tfa-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div dir="rtl" className="min-h-screen bg-background flex w-full">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-3 md:px-6 shrink-0">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger />
              <h1 className="text-sm md:text-lg font-semibold text-tfa-blue truncate">
                أكاديمية تكنو - نظام الإدارة
              </h1>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <LanguageSwitcher />

              <div className="hidden sm:flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium truncate max-w-32">{profile.full_name}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1 md:gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-3 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;