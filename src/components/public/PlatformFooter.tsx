import React from 'react';

interface Academy {
  name: string;
  contact_email?: string | null;
  contact_phone?: string | null;
}

interface PlatformFooterProps {
  academy: Academy;
}

const PlatformFooter: React.FC<PlatformFooterProps> = ({ academy }) => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto py-8 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h2 className="text-xl font-bold">{academy.name}</h2>
            {academy.contact_email && <p className="text-sm text-gray-400">{academy.contact_email}</p>}
            {academy.contact_phone && <p className="text-sm text-gray-400">{academy.contact_phone}</p>}
          </div>
          <div className="flex gap-4">
            {/* These could be dynamic from academy settings in the future */}
            <a href="#" className="hover:text-gray-300">Facebook</a>
            <a href="#" className="hover:text-gray-300">Twitter</a>
            <a href="#" className="hover:text-gray-300">LinkedIn</a>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} {academy.name}. All Rights Reserved.</p>
          <p>Powered by TecnoFootball</p>
        </div>
      </div>
    </footer>
  );
};

export default PlatformFooter;
