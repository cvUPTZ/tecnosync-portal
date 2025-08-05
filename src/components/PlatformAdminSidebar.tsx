// src/components/PlatformAdminSidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  BarChart3,
  Shield,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PlatformAdminSidebar = () => {
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      href: '/platform-admin',
      icon: LayoutDashboard,
    },
    {
      id: 'academies',
      label: 'إدارة الأكاديميات',
      href: '/platform-admin/academies',
      icon: Building2,
    },
    {
      id: 'users',
      label: 'إدارة المستخدمين',
      href: '/platform-admin/users',
      icon: Users,
    },
    {
      id: 'analytics',
      label: 'التحليلات',
      href: '/platform-admin/analytics',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'إعدادات المنصة',
      href: '/platform-admin/settings',
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/platform-admin' && location.pathname === '/platform-admin') {
      return true;
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 w-64 fixed left-0 top-0 z-40 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-red-600" />
          <span className="mr-3 text-xl font-bold text-gray-900">
            إدارة المنصة
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
                    ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon
                  className={cn(
                    'ml-3 h-5 w-5 flex-shrink-0',
                    isActive(item.href)
                      ? 'text-red-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Platform Info */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">
            TecnoFootball Platform
          </p>
          <p className="text-xs text-gray-500">
            مشرف عام للمنصة
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlatformAdminSidebar;
