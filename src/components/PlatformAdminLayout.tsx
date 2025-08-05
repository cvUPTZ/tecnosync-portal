// src/components/PlatformAdminLayout.tsx
import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import PlatformAdminSidebar from './PlatformAdminSidebar';
import PlatformAdminHeader from './PlatformAdminHeader';
import { useAuth } from '@/contexts/AuthContext';

const PlatformAdminLayout = () => {
  const { loading, isPlatformAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isPlatformAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            غير مصرح لك بالوصول
          </h2>
          <p className="text-gray-600">
            يرجى تسجيل الدخول كمشرف عام للمنصة
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <PlatformAdminSidebar />
      
      {/* Main Content Area */}
      <div className="pl-64">
        {/* Header */}
        <PlatformAdminHeader />
        
        {/* Page Content */}
        <main className="flex-1">
          <div className="p-6">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlatformAdminLayout;
