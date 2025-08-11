import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

interface Academy {
  id: string;
  name: string;
  subdomain: string;
  logo_url?: string;
}

interface PlatformHeaderProps {
  academy: Academy;
}

const PlatformHeader: React.FC<PlatformHeaderProps> = ({ academy }) => {
  const navLinks = [
    { href: `/site/${academy.subdomain}/about`, label: 'About' },
    { href: `/site/${academy.subdomain}/programs`, label: 'Programs' },
    { href: `/site/${academy.subdomain}/team`, label: 'Team' },
    { href: `/site/${academy.subdomain}/contact`, label: 'Contact' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          {academy.logo_url && (
            <img src={academy.logo_url} alt={`${academy.name} Logo`} className="w-8 h-8 mr-3" />
          )}
          <Link to={`/site/${academy.subdomain}`} className="text-2xl font-bold text-gray-800">
            {academy.name}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map(link => (
              <Link key={link.href} to={link.href} className="text-gray-600 hover:text-gray-800">
                {link.label}
              </Link>
            ))}
          </div>
          <LanguageSwitcher />
          <Link to="/login">
            <Button variant="outline">Admin Login</Button>
          </Link>
          <Link to={`/site/${academy.subdomain}/register`}>
            <Button className="bg-tfa-blue hover:bg-tfa-blue/90">Register</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default PlatformHeader;
