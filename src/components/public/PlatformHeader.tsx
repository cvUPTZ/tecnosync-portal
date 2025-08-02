import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

const PlatformHeader = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <img
            src="/lovable-uploads/110f1368-cc3e-49a8-ba42-0e0f2e7ec6ee.png"
            alt="Platform Logo"
            className="w-8 h-8 mr-3"
          />
          <Link to="/" className="text-2xl font-bold text-gray-800">
            Academy Creator
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <a href="#features" className="text-gray-600 hover:text-gray-800">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-800">Pricing</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-800">Contact</a>
          </div>
          <LanguageSwitcher />
          <Link to="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link to="/registration">
            <Button className="bg-tfa-blue hover:bg-tfa-blue/90">Sign Up</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default PlatformHeader;
