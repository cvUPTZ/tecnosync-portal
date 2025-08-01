import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Calendar,
  Calculator,
  MessageSquare,
  FileText,
  BarChart3,
  Camera,
  Settings
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { profile, isAdmin, hasRole } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-tfa-blue/10 text-tfa-blue font-medium border-l-2 border-tfa-blue' : 'hover:bg-muted/50';

  // Define menu items based on roles
  const getMenuItems = () => {
    const baseItems = [
      { title: 'لوحة التحكم', url: '/admin', icon: LayoutDashboard, roles: ['director', 'comptabilite_chief', 'coach'] },
    ];

    const adminItems = [
      { title: 'طلبات التسجيل', url: '/admin/registrations', icon: Users, roles: ['director', 'comptabilite_chief', 'coach'] },
      { title: 'الحضور والغياب', url: '/admin/attendance', icon: UserCheck, roles: ['director', 'comptabilite_chief', 'coach'] },
      { title: 'الجداول والفعاليات', url: '/admin/schedule', icon: Calendar, roles: ['director', 'comptabilite_chief', 'coach'] },
    ];

    const financialItems = [
      { title: 'المالية والمدفوعات', url: '/admin/finance', icon: Calculator, roles: ['director', 'comptabilite_chief'] },
      { title: 'التقارير المالية', url: '/admin/reports', icon: BarChart3, roles: ['director', 'comptabilite_chief'] },
    ];

    const managementItems = [
      { title: 'إدارة المدربين', url: '/admin/coaches', icon: Users, roles: ['director'] },
      { title: 'الرسائل', url: '/admin/messages', icon: MessageSquare, roles: ['director', 'comptabilite_chief', 'coach'] },
      { title: 'إدارة الوثائق', url: '/admin/documents', icon: FileText, roles: ['director', 'comptabilite_chief'] },
      { title: 'معرض الصور', url: '/admin/gallery', icon: Camera, roles: ['director', 'comptabilite_chief', 'coach'] },
      { title: 'الإعدادات', url: '/admin/settings', icon: Settings, roles: ['director'] },
    ];

    return [...baseItems, ...adminItems, ...financialItems, ...managementItems].filter(item => 
      item.roles.includes(profile?.role || 'coach')
    );
  };

  const menuItems = getMenuItems();

  if (!profile) return null;

  return (
    <Sidebar
      className={collapsed ? 'w-14' : 'w-64'}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/110f1368-cc3e-49a8-ba42-0e0f2e7ec6ee.png" 
              alt="TFA Logo" 
              className="w-8 h-8 flex-shrink-0"
            />
            {!collapsed && (
              <div>
                <h2 className="font-bold text-tfa-blue text-sm">أكاديمية تكنو</h2>
                <p className="text-xs text-muted-foreground">نظام الإدارة</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="p-4 border-b bg-muted/50">
            <div className="text-sm">
              <p className="font-medium text-tfa-blue">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {profile.role === 'director' && 'مدير الأكاديمية'}
                {profile.role === 'comptabilite_chief' && 'رئيس المحاسبة'}
                {profile.role === 'coach' && 'مدرب'}
                {profile.role === 'parent' && 'ولي أمر'}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="ml-2 h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;