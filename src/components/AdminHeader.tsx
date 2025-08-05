// src/components/AdminHeader.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  ExternalLink,
  Menu 
} from 'lucide-react';

const AdminHeader = () => {
  const { profile, academy, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left side - could add mobile menu toggle here */}
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-gray-900">
          لوحة تحكم الأكاديمية
        </h1>
      </div>

      {/* Right side - User menu and actions */}
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        {/* View Website Link */}
        {academy?.subdomain && (
          <Button variant="outline" size="sm" asChild>
            <Link 
              to={`/site/${academy.subdomain}`} 
              target="_blank"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              عرض الموقع
            </Link>
          </Button>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-700">
                  {profile?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="text-right rtl:text-left">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name || 'المستخدم'}
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.role === 'director' ? 'مدير الأكاديمية' : 
                   profile?.role === 'admin' ? 'مشرف' : 
                   profile?.role || 'مستخدم'}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/admin/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                الملف الشخصي
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/admin/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                إعدادات الأكاديمية
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;
