import { RegistrationForm } from "@/components/RegistrationForm";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";
const Registration = () => {
  return <div className="min-h-screen bg-background" dir="rtl">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <img src="/lovable-uploads/110f1368-cc3e-49a8-ba42-0e0f2e7ec6ee.png" alt="Tecno Football Academy Logo" className="w-10 h-10 lg:w-12 lg:h-12 object-contain" />
                <div>
                  <div className="font-bold text-base lg:text-lg text-tfa-blue">أكاديمية تكنو</div>
                  <div className="text-xs text-tfa-red font-medium">لكرة القدم</div>
                </div>
              </div>
              
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-700">استمارة التسجيل</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">الرئيسية</span>
                </Button>
              </Link>
              
              <Link to="/login">
                
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-8">
        <RegistrationForm />
      </div>
    </div>;
};
export default Registration;