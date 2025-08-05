// src/components/PlatformAdminHeader.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Shield 
} from 'lucide-react';

const PlatformAdminHeader = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/platform-admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left side */}
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-gray-900">
          لوحة تحكم المنصة العامة
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            2
          </span>
        </Button>

        {/* Platform Admin Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <Shield className="h-4 w-4 text-red-700" />
              </div>
              <div className="text-right rtl:text-left">
                <p className="text-sm font-medium text-gray-900">
                  مشرف المنصة
                </p>
                <p className="text-xs text-gray-500">
                  Platform Administrator
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              الملف الشخصي
            </DropdownMenuItem>
            
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              إعدادات المنصة
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

export default PlatformAdminHeader;
