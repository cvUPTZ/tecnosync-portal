// src/App.tsx
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import EditAcademyForm from "./components/PlatformAdmin/EditAcademyForm";

// New Unified Login
const UnifiedLogin = React.lazy(() => import("./pages/UnifiedLogin"));

// Public Routes
const Index = React.lazy(() => import("./pages/Index"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = React.lazy(() => import("./pages/VerifyEmail"));

// Public Academy Website Routes
const AcademyWebsite = React.lazy(() => import("./components/public/AcademyWebsite"));
const AcademyRegistration = React.lazy(() => import("./components/academy/AcademyRegistration"));

// Platform Admin Routes
const PlatformAdminLayout = React.lazy(() => import("./components/PlatformAdminLayout"));
const PlatformAdminDashboard = React.lazy(() => import("./pages/PlatformAdmin/Dashboard"));
const AcademyManagement = React.lazy(() => import("./pages/PlatformAdmin/AcademyManagement"));
const PlatformUserManagement = React.lazy(() => import("./pages/UserManagement"));
const PlatformSettings = React.lazy(() => import("./pages/PlatformAdmin/Settings"));
const PlatformAnalytics = React.lazy(() => import("./pages/PlatformAdmin/Analytics"));
const CreateAcademyForm = React.lazy(() => import("./pages/PlatformAdmin/CreateAcademy"));

// Academy Admin Routes
const AdminLayout = React.lazy(() => import("./components/AdminLayout"));
const Dashboard = React.lazy(() => import("./pages/AdminDashboard"));
const RegistrationManagement = React.lazy(() => import("./pages/RegistrationManagement"));
const RegistrationDetails = React.lazy(() => import("./pages/academy/RegistrationDetails"));
const StudentManagement = React.lazy(() => import("./pages/StudentManagement"));
const StudentProfile = React.lazy(() => import("./pages/academy/StudentProfile"));
const EditStudent = React.lazy(() => import("./pages/academy/EditStudent"));
const UserManagement = React.lazy(() => import("./pages/UserManagement"));
const UserProfile = React.lazy(() => import("./pages/academy/UserProfile"));
const Attendance = React.lazy(() => import("./pages/Attendance"));
const CoachManagement = React.lazy(() => import("./pages/CoachManagement"));
const CoachProfile = React.lazy(() => import("./pages/academy/CoachProfile"));
const FinanceManagement = React.lazy(() => import("./pages/FinanceManagement"));
const InvoiceDetails = React.lazy(() => import("./pages/academy/InvoiceDetails"));
const PaymentDetails = React.lazy(() => import("./pages/academy/PaymentDetails"));
const FinancialReports = React.lazy(() => import("./pages/FinancialReports"));
const DocumentManagement = React.lazy(() => import("./pages/DocumentManagement"));
const DocumentViewer = React.lazy(() => import("./pages/academy/DocumentViewer"));
const ScheduleManagement = React.lazy(() => import("./pages/academy/ScheduleManagement"));
const MessageCenter = React.lazy(() => import("./pages/academy/MessageCenter"));
const GalleryManagement = React.lazy(() => import("./pages/academy/GalleryManagement"));
const AcademySettings = React.lazy(() => import("./pages/academy/AcademySettings"));
const AcademySetupWizard = React.lazy(() => import("./pages/academy/AcademySetupWizard"));

// Website Management Routes
const WebsiteContentManagement = React.lazy(() => import("./pages/WebsiteContentManagement"));
const ThemeCustomization = React.lazy(() => import("./components/academy/ThemeCustomization"));
const WebsitePreview = React.lazy(() => import("./components/academy/WebsitePreview"));

// Public Content Routes
const PrivacyPolicy = React.lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("./pages/legal/TermsOfService"));
const HelpCenter = React.lazy(() => import("./pages/legal/HelpCenter"));
const SystemStatus = React.lazy(() => import("./pages/legal/SystemStatus"));

const queryClient = new QueryClient();

// Wrapper component for EditAcademyForm to handle data fetching
const EditAcademyFormWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [academy, setAcademy] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchAcademy = async () => {
      if (!id) {
        setError('Academy ID is required');
        setLoading(false);
        return;
      }

      try {
        // Replace with your actual API call
        // const academyData = await getAcademyById(id);
        // For now, using mock data
        const academyData = {
          id,
          name: 'Sample Academy',
          subdomain: 'sample',
          contact_email: 'contact@sample.com',
          contact_phone: '+1234567890'
        };
        
        setAcademy(academyData);
      } catch (err) {
        setError('Failed to fetch academy data');
        console.error('Error fetching academy:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademy();
  }, [id]);

  const handleSuccess = () => {
    navigate('/platform-admin/academies');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading academy data...</div>;
  }

  if (error || !academy) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error || 'Academy not found'}</p>
        <button 
          onClick={() => navigate('/platform-admin/academies')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Academies
        </button>
      </div>
    );
  }

  return <EditAcademyForm academy={academy} onSuccess={handleSuccess} />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HandleLoginRedirect />} />
              <Route path="/login" element={<UnifiedLogin />} />
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
                <Route index element={<Navigate to="/platform-admin/dashboard" replace />} />
                <Route path="dashboard" element={<PlatformAdminDashboard />} />
                <Route path="academies" element={<AcademyManagement />} />
                <Route path="academies/create" element={<CreateAcademyForm />} />
                <Route path="academies/:id/edit" element={<EditAcademyFormWrapper />} />
                <Route path="users" element={<PlatformUserManagement />} />
                <Route path="settings" element={<PlatformSettings />} />
                <Route path="analytics" element={<PlatformAnalytics />} />
              </Route>

              {/* Academy Admin Routes */}
              <Route path="/admin" element={<AcademyAdminRoute />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="setup-wizard" element={<AcademySetupWizard />} />
                
                {/* Registration Management */}
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
                
                {/* Coach Management */}
                <Route path="coaches" element={<CoachManagement />} />
                <Route path="coaches/:id" element={<CoachProfile />} />
                
                {/* Finance Management */}
                <Route path="finance" element={<FinanceManagement />} />
                <Route path="finance/invoices/:id" element={<InvoiceDetails />} />
                <Route path="finance/payments/:id" element={<PaymentDetails />} />
                <Route path="finance/reports" element={<FinancialReports />} />
                
                {/* Document Management */}
                <Route path="documents" element={<DocumentManagement />} />
                <Route path="documents/:id" element={<DocumentViewer />} />
                
                {/* Schedule Management */}
                <Route path="schedule" element={<ScheduleManagement />} />
                
                {/* Message Center */}
                <Route path="messages" element={<MessageCenter />} />
                
                {/* Gallery Management */}
                <Route path="gallery" element={<GalleryManagement />} />
                
                {/* Academy Settings */}
                <Route path="settings" element={<AcademySettings />} />
                
                {/* Website Management */}
                <Route path="website" element={<WebsiteContentManagement />} />
                <Route path="website/themes" element={<ThemeCustomization academyId="" currentSettings={{}} onSettingsUpdate={() => {}} />} />
                <Route path="website/preview" element={<WebsitePreview subdomain="" academyName="" template="" primaryColor="" />} />
              </Route>

              {/* Legal and Utility Routes */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/status" element={<SystemStatus />} />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </React.Suspense>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Component to handle redirection after login
const HandleLoginRedirect: React.FC = () => {
  const { user, isPlatformAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Index />;
  }

  if (isPlatformAdmin()) {
    return <Navigate to="/platform-admin/dashboard" state={{ from: location }} replace />;
  } else {
    return <Navigate to="/admin/dashboard" state={{ from: location }} replace />;
  }
};

// Protected routes
const PlatformAdminRoute: React.FC = () => {
  const { isPlatformAdmin, loading, user } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return isPlatformAdmin() ? <PlatformAdminLayout /> : <Navigate to="/" />;
};

const AcademyAdminRoute: React.FC = () => {
  const { user, profile, loading, isPlatformAdmin } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || !profile) {
    return <Navigate to="/login" />;
  }

  if (isPlatformAdmin()) {
    return <Navigate to="/platform-admin/dashboard" />;
  }

  return <AdminLayout />;
};

export default App;
