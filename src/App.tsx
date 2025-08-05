// src/App.tsx
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Public Routes
const Index = React.lazy(() => import("./pages/Index"));
const Login = React.lazy(() => import("./pages/Login"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = React.lazy(() => import("./pages/VerifyEmail"));

// Public Academy Website Routes
const AcademyWebsite = React.lazy(() => import("./components/public/AcademyWebsite"));
const AcademyRegistration = React.lazy(() => import("./components/academy/AcademyRegistration"));

// Platform Admin Routes
const PlatformAdminLogin = React.lazy(() => import("./components/PlatformAdmin/Login"));
const PlatformAdminDashboard = React.lazy(() => import("./components/PlatformAdmin/Dashboard"));
const AcademyManagement = React.lazy(() => import("./components/PlatformAdmin/AcademyManagement"));
const PlatformUserManagement = React.lazy(() => import("./components/PlatformAdmin/UserManagement"));
const PlatformSettings = React.lazy(() => import("./components/PlatformAdmin/Settings"));
const PlatformAnalytics = React.lazy(() => import("./components/PlatformAdmin/Analytics"));

// Academy Admin Routes
const AdminLayout = React.lazy(() => import("./components/AdminLayout"));
const Dashboard = React.lazy(() => import("./components/academy/Dashboard"));
const RegistrationManagement = React.lazy(() => import("./components/academy/RegistrationManagement"));
const RegistrationDetails = React.lazy(() => import("./components/academy/RegistrationDetails"));
const StudentManagement = React.lazy(() => import("./components/academy/StudentManagement"));
const StudentProfile = React.lazy(() => import("./components/academy/StudentProfile"));
const EditStudent = React.lazy(() => import("./components/academy/EditStudent"));
const UserManagement = React.lazy(() => import("./components/academy/UserManagement"));
const UserProfile = React.lazy(() => import("./components/academy/UserProfile"));
const Attendance = React.lazy(() => import("./components/academy/Attendance"));
const CoachManagement = React.lazy(() => import("./components/academy/CoachManagement"));
const CoachProfile = React.lazy(() => import("./components/academy/CoachProfile"));
const FinanceManagement = React.lazy(() => import("./components/academy/FinanceManagement"));
const InvoiceDetails = React.lazy(() => import("./components/academy/InvoiceDetails"));
const PaymentDetails = React.lazy(() => import("./components/academy/PaymentDetails"));
const FinancialReports = React.lazy(() => import("./components/academy/FinancialReports"));
const DocumentManagement = React.lazy(() => import("./components/academy/DocumentManagement"));
const DocumentViewer = React.lazy(() => import("./components/academy/DocumentViewer"));
const ScheduleManagement = React.lazy(() => import("./components/academy/ScheduleManagement"));
const MessageCenter = React.lazy(() => import("./components/academy/MessageCenter"));
const GalleryManagement = React.lazy(() => import("./components/academy/GalleryManagement"));
const AcademySettings = React.lazy(() => import("./components/academy/AcademySettings"));
const AcademySetupWizard = React.lazy(() => import("./components/academy/AcademySetupWizard"));

// Website Management Routes
const WebsiteContentManagement = React.lazy(() => import("./components/academy/WebsiteContentManagement"));
const ThemeCustomization = React.lazy(() => import("./components/academy/ThemeCustomization"));
const WebsitePreview = React.lazy(() => import("./components/academy/WebsitePreview"));

// Public Content Routes
const PrivacyPolicy = React.lazy(() => import("./components/public/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("./components/public/TermsOfService"));
const HelpCenter = React.lazy(() => import("./components/public/HelpCenter"));
const SystemStatus = React.lazy(() => import("./components/public/SystemStatus"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            
            {/* Public Academy Websites */}
            <Route path="/site/:subdomain" element={<AcademyWebsite />} />
            <Route path="/site/:subdomain/register" element={<AcademyRegistration />} />
            <Route path="/site/:subdomain/about" element={<AcademyWebsite section="about" />} />
            <Route path="/site/:subdomain/team" element={<AcademyWebsite section="team" />} />
            <Route path="/site/:subdomain/programs" element={<AcademyWebsite section="programs" />} />
            <Route path="/site/:subdomain/contact" element={<AcademyWebsite section="contact" />} />
            <Route path="/site/:subdomain/gallery" element={<AcademyWebsite section="gallery" />} />
            
            {/* Platform Admin Routes */}
            <Route path="/platform-admin" element={<PlatformAdminRoute />}>
              <Route index element={<PlatformAdminDashboard />} />
              <Route path="login" element={<PlatformAdminLogin />} />
              <Route path="academies" element={<AcademyManagement />} />
              <Route path="academies/create" element={<CreateAcademyForm />} />
              <Route path="academies/:id/edit" element={<EditAcademyForm />} />
              <Route path="users" element={<PlatformUserManagement />} />
              <Route path="settings" element={<PlatformSettings />} />
              <Route path="analytics" element={<PlatformAnalytics />} />
            </Route>
            
            {/* Academy Admin Routes */}
            <Route path="/admin" element={<AcademyAdminRoute />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Registration Module */}
              <Route path="registrations" element={<RegistrationManagement />} />
              <Route path="registrations/:id" element={<RegistrationDetails />} />
              
              {/* Student Management */}
              <Route path="students" element={<StudentManagement />} />
              <Route path="students/:id" element={<StudentProfile />} />
              <Route path="students/:id/edit" element={<EditStudent />} />
              
              {/* User Management */}
              <Route path="users" element={<UserManagement />} />
              <Route path="users/:id" element={<UserProfile />} />
              
              {/* Attendance */}
              <Route path="attendance" element={<Attendance />} />
              
              {/* Coaches */}
              <Route path="coaches" element={<CoachManagement />} />
              <Route path="coaches/:id" element={<CoachProfile />} />
              
              {/* Finance */}
              <Route path="finance" element={<FinanceManagement />} />
              <Route path="finance/invoices/:id" element={<InvoiceDetails />} />
              <Route path="finance/payments/:id" element={<PaymentDetails />} />
              <Route path="reports" element={<FinancialReports />} />
              
              {/* Documents */}
              <Route path="documents" element={<DocumentManagement />} />
              <Route path="documents/:id" element={<DocumentViewer />} />
              
              {/* Schedule */}
              <Route path="schedule" element={<ScheduleManagement />} />
              
              {/* Messages */}
              <Route path="messages" element={<MessageCenter />} />
              
              {/* Gallery */}
              <Route path="gallery" element={<GalleryManagement />} />
              
              {/* Website Management */}
              <Route path="website" element={<WebsiteContentManagement />} />
              <Route path="theme" element={<ThemeCustomization />} />
              <Route path="website/preview" element={<WebsitePreview />} />
              
              {/* Settings */}
              <Route path="settings" element={<AcademySettings />} />
              <Route path="setup-wizard" element={<AcademySetupWizard />} />
            </Route>
            
            {/* Legal and Utility Routes */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/status" element={<SystemStatus />} />
            
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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  return isPlatformAdmin() ? <PlatformAdminLayout /> : <Navigate to="/platform-admin/login" />;
};

const AcademyAdminRoute = () => {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (!user || !profile) {
    return <Navigate to="/login" />;
  }
  return <AdminLayout />;
};

export default App;
