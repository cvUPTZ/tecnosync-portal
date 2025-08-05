// src/App.tsx
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLayout from "./components/AdminLayout";
import PlatformAdminLayout from "./components/PlatformAdminLayout";
import { useAuth } from "@/contexts/AuthContext";

// Public academy website routes
const AcademyWebsite = React.lazy(() => import("./components/academy/AcademyWebsite"));
const AcademyRegistration = React.lazy(() => import("./components/academy/AcademyRegistration"));

// Platform admin routes
const PlatformAdminLogin = React.lazy(() => import("./components/PlatformAdmin/Login"));
const PlatformAdminDashboard = React.lazy(() => import("./components/PlatformAdmin/Dashboard"));

// Academy admin routes
const RegistrationManagement = React.lazy(() => import("./components/academy/RegistrationManagement"));
const StudentManagement = React.lazy(() => import("./components/academy/StudentManagement"));
const ContentManagement = React.lazy(() => import("./components/academy/ContentManagement"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            
            {/* Academy Public Websites */}
            <Route path="/site/:subdomain" element={<AcademyWebsite />} />
            <Route path="/site/:subdomain/register" element={<AcademyRegistration />} />
            
            {/* Public Authentication */}
            <Route path="/login" element={<Login />} />
            
            {/* Platform Admin Routes */}
            <Route path="/platform-admin" element={<PlatformAdminRoute />}>
              <Route index element={<PlatformAdminDashboard />} />
              <Route path="login" element={<PlatformAdminLogin />} />
              <Route path="create-academy" element={<CreateAcademyForm />} />
              <Route path="academies/:id/edit" element={<EditAcademyForm />} />
            </Route>
            
            {/* Academy Admin Routes */}
            <Route path="/admin" element={<AcademyAdminRoute />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="registrations" element={<RegistrationManagement />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="website" element={<ContentManagement />} />
              <Route path="theme" element={<ThemeCustomization />} />
              {/* Other module routes */}
            </Route>
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Protected routes
const PlatformAdminRoute = () => {
  const { isPlatformAdmin, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  return isPlatformAdmin() ? <PlatformAdminLayout /> : <Navigate to="/platform-admin/login" />;
};

const AcademyAdminRoute = () => {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user || !profile) {
    return <Navigate to="/login" />;
  }
  return <AdminLayout />;
};

export default App;
