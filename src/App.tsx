import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import RegistrationManagement from "./pages/RegistrationManagement";
import StudentManagement from "./pages/StudentManagement";
import UserManagement from "./pages/UserManagement";
import Attendance from "./pages/Attendance";
import CoachManagement from "./pages/CoachManagement";
import FinanceManagement from "./pages/FinanceManagement";
import FinancialReports from "./pages/FinancialReports";
import DocumentManagement from "./pages/DocumentManagement";
import WebsiteContentManagement from "./pages/WebsiteContentManagement";
import AcademyHomepage from "./pages/public/AcademyHomepage";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import CreateAcademyPage from "./pages/PlatformAdmin/CreateAcademy";
import { Navigate, Outlet } from "react-router-dom";

const queryClient = new QueryClient();

// Protected route for platform admin
const PlatformAdminRoute = () => {
  const { isPlatformAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  return isPlatformAdmin() ? <Outlet /> : <Navigate to="/login" />;
};

// Protected route for enabled modules
const ModuleProtectedRoute = ({ moduleName }: { moduleName: string }) => {
  const { isModuleEnabled, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  return isModuleEnabled(moduleName) ? <Outlet /> : <Navigate to="/admin" />;
};


const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/site/:subdomain" element={<AcademyHomepage />} />
              <Route path="/registration" element={<Registration />} />
              <Route path="/login" element={<Login />} />

              {/* Platform Admin Routes */}
              <Route element={<PlatformAdminRoute />}>
                <Route path="/platform-admin/create-academy" element={<CreateAcademyPage />} />
              </Route>

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />

                {/* Wrap each module route with the protection component */}
                <Route element={<ModuleProtectedRoute moduleName="registrations" />}>
                  <Route path="registrations" element={<RegistrationManagement />} />
                </Route>
                <Route element={<ModuleProtectedRoute moduleName="students" />}>
                  <Route path="students" element={<StudentManagement />} />
                </Route>
                <Route element={<ModuleProtectedRoute moduleName="users" />}>
                  <Route path="users" element={<UserManagement />} />
                </Route>
                <Route element={<ModuleProtectedRoute moduleName="attendance" />}>
                  <Route path="attendance" element={<Attendance />} />
                </Route>
                <Route element={<ModuleProtectedRoute moduleName="coaches" />}>
                  <Route path="coaches" element={<CoachManagement />} />
                </Route>
                <Route element={<ModuleProtectedRoute moduleName="finance" />}>
                  <Route path="finance" element={<FinanceManagement />} />
                </Route>
                <Route element={<ModuleProtectedRoute moduleName="reports" />}>
                  <Route path="reports" element={<FinancialReports />} />
                </Route>
                <Route element={<ModuleProtectedRoute moduleName="documents" />}>
                  <Route path="documents" element={<DocumentManagement />} />
                </Route>
                <Route element={<ModuleProtectedRoute moduleName="website" />}>
                  <Route path="website" element={<WebsiteContentManagement />} />
                </Route>

                {/* Future admin routes will be added here */}
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;