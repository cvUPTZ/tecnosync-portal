import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, PlusCircle, List, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from './ui/LanguageSwitcher';

const PlatformAdminSidebar = () => {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Academy Creator</h2>
        <p className="text-sm text-gray-400">Platform Control</p>
      </div>
      <nav className="flex-grow p-2">
        <NavLink
          to="/platform-admin"
          end
          className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded-md hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
          }
        >
          <LayoutDashboard className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>
        <NavLink
          to="/platform-admin/create-academy"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 mt-2 rounded-md hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
          }
        >
          <PlusCircle className="mr-3 h-5 w-5" />
          Create Academy
        </NavLink>
        <NavLink
          to="/platform-admin/academies"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 mt-2 rounded-md hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
          }
        >
          <List className="mr-3 h-5 w-5" />
          Manage Academies
        </NavLink>
      </nav>
    </div>
  );
};

const PlatformAdminLayout = () => {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex w-full">
      <PlatformAdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-white flex items-center justify-end px-6">
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{profile?.full_name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PlatformAdminLayout;
