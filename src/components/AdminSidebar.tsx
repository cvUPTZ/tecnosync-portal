// src/components/AdminSidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  DollarSign,
  FileText,
  Calendar,
  MessageSquare,
  Image,
  Settings,
  UserCog,
  ClipboardList,
  Globe,
  Palette,
  BarChart3,
  GraduationCap,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  moduleId?: string;
}

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

const AdminSidebar = () => {
  const location = useLocation();
  const { profile, getAcademyId } = useAuth();
  const [academy, setAcademy] = useState<Tables<'academies'> | null>(null);

  useEffect(() => {
    const fetchAcademy = async () => {
      const academyId = getAcademyId();
      if (academyId) {
        const { data, error } = await supabase
          .from('academies')
          .select('*')
          .eq('id', academyId)
          .single();
        if (error) {
          console.error('Error fetching academy:', error);
        } else {
          setAcademy(data);
        }
      }
    };
    fetchAcademy();
  }, [getAcademyId]);

  // Function to check if a module is enabled
  const isModuleEnabled = (moduleId: string): boolean => {
    if (!academy?.modules) return true; // If no modules config, show all
    return academy.modules[moduleId] === true;
  };

  // Define all menu items with their module requirements
  const allMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'registrations',
      label: 'طلبات التسجيل',
      href: '/admin/registrations',
      icon: ClipboardList,
      moduleId: 'student-management',
    },
    {
      id: 'students',
      label: 'إدارة الطلاب',
      href: '/admin/students',
      icon: GraduationCap,
      moduleId: 'student-management',
    },
    {
      id: 'users',
      label: 'المستخدمين',
      href: '/admin/users',
      icon: Users,
    },
    {
      id: 'attendance',
      label: 'الحضور والغياب',
      href: '/admin/attendance',
      icon: UserCheck,
      moduleId: 'attendance',
    },
    {
      id: 'coaches',
      label: 'المدربين',
      href: '/admin/coaches',
      icon: UserCog,
      moduleId: 'student-management',
    },
    {
      id: 'finance',
      label: 'الإدارة المالية',
      href: '/admin/finance',
      icon: DollarSign,
      moduleId: 'finance',
    },
    {
      id: 'reports',
      label: 'التقارير المالية',
      href: '/admin/reports',
      icon: BarChart3,
      moduleId: 'finance',
    },
    {
      id: 'documents',
      label: 'إدارة المستندات',
      href: '/admin/documents',
      icon: FileText,
      moduleId: 'documents',
    },
    {
      id: 'schedule',
      label: 'الجداول والمواعيد',
      href: '/admin/schedule',
      icon: Calendar,
      moduleId: 'schedule',
    },
    {
      id: 'messages',
      label: 'مركز الرسائل',
      href: '/admin/messages',
      icon: MessageSquare,
      moduleId: 'messages',
    },
    {
      id: 'gallery',
      label: 'إدارة المعرض',
      href: '/admin/gallery',
      icon: Image,
      moduleId: 'gallery',
    },
    {
      id: 'website',
      label: 'محتوى الموقع',
      href: '/admin/website',
      icon: Globe,
      moduleId: 'website',
    },
    {
      id: 'settings',
      label: 'إعدادات الأكاديمية',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  // Filter menu items based on enabled modules
  const getMenuItems = (): MenuItem[] => {
    return allMenuItems.filter(item => {
      // If item has no moduleId, always show it
      if (!item.moduleId) return true;
      
      // Check if the module is enabled
      return isModuleEnabled(item.moduleId);
    });
  };

  const menuItems = getMenuItems();

  const isActive = (href: string) => {
    if (href === '/admin/dashboard' && location.pathname === '/admin') {
      return true;
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 w-64 fixed left-0 top-0 z-40 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="mr-3 text-xl font-bold text-gray-900">
            {academy?.name || 'أكاديمية'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon
                  className={cn(
                    'ml-3 h-5 w-5 flex-shrink-0',
                    isActive(item.href)
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">
                {profile?.full_name?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
          <div className="mr-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile?.full_name || 'المستخدم'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile?.role === 'director' ? 'مدير الأكاديمية' : 
               profile?.role === 'admin' ? 'مشرف' : 
               profile?.role || 'مستخدم'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
