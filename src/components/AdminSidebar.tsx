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
  Settings,
  GraduationCap
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
import { useTranslation } from 'react-i18next';

const AdminSidebar = () => {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { profile, isModuleEnabled } = useAuth();

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-tfa-blue/10 text-tfa-blue font-medium border-r-2 border-tfa-blue' : 'hover:bg-muted/50';

  // Define menu items based on roles and enabled modules
  const getMenuItems = () => {
    const allItems = [
      // Always visible
      { titleKey: 'sidebar.dashboard', url: '/admin', icon: LayoutDashboard, roles: ['director', 'comptabilite_chief', 'coach'], module: 'dashboard' },

      // Module-based items
      { titleKey: 'sidebar.registrations', url: '/admin/registrations', icon: Users, roles: ['director', 'comptabilite_chief', 'coach'], module: 'registrations' },
      { titleKey: 'sidebar.students', url: '/admin/students', icon: GraduationCap, roles: ['director', 'comptabilite_chief', 'coach'], module: 'students' },
      { titleKey: 'sidebar.users', url: '/admin/users', icon: UserCheck, roles: ['director'], module: 'users' },
      { titleKey: 'sidebar.attendance', url: '/admin/attendance', icon: UserCheck, roles: ['director', 'comptabilite_chief', 'coach'], module: 'attendance' },
      { titleKey: 'sidebar.schedule', url: '/admin/schedule', icon: Calendar, roles: ['director', 'comptabilite_chief', 'coach'], module: 'schedule' },
      { titleKey: 'sidebar.finance', url: '/admin/finance', icon: Calculator, roles: ['director', 'comptabilite_chief'], module: 'finance' },
      { titleKey: 'sidebar.reports', url: '/admin/reports', icon: BarChart3, roles: ['director', 'comptabilite_chief'], module: 'reports' },
      { titleKey: 'sidebar.coaches', url: '/admin/coaches', icon: Users, roles: ['director'], module: 'coaches' },
      { titleKey: 'sidebar.messages', url: '/admin/messages', icon: MessageSquare, roles: ['director', 'comptabilite_chief', 'coach'], module: 'messages' },
      { titleKey: 'sidebar.documents', url: '/admin/documents', icon: FileText, roles: ['director', 'comptabilite_chief'], module: 'documents' },
      { titleKey: 'sidebar.gallery', url: '/admin/gallery', icon: Camera, roles: ['director', 'comptabilite_chief', 'coach'], module: 'gallery' },

      // Always visible
      { titleKey: 'sidebar.website', url: '/admin/website', icon: FileText, roles: ['director'], module: 'website' },
      { titleKey: 'sidebar.settings', url: '/admin/settings', icon: Settings, roles: ['director'], module: 'settings' },
    ];

    return allItems.filter(item => {
      const roleMatch = item.roles.includes(profile?.role || '');
      // Dashboard and settings are always enabled for logged-in users.
      // For other modules, check if they are enabled in the academy's config.
      const moduleMatch = item.module === 'dashboard' || item.module === 'settings' || isModuleEnabled(item.module);
      return roleMatch && moduleMatch;
    });
  };

  const menuItems = getMenuItems();

  if (!profile) return null;

  return (
    <Sidebar
      side="right"
      className={collapsed ? 'w-14' : 'w-64'}
      collapsible="icon"
      variant="sidebar"
    >
      
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
                <p className="text-xs text-muted-foreground">{t('academyInfo.managementSystem')}</p>
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
                {t(`userRoles.${profile.role}`)}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebar.mainMenu')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{t(item.titleKey)}</span>}
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