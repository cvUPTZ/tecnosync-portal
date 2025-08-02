import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicHeader = () => (
  <header className="bg-white shadow-md">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold text-gray-800">Academy Logo</div>
      <div>
        <a href="#about" className="mx-2 text-gray-600 hover:text-gray-800">About</a>
        <a href="#team" className="mx-2 text-gray-600 hover:text-gray-800">Team</a>
        <a href="#contact" className="mx-2 text-gray-600 hover:text-gray-800">Contact</a>
      </div>
    </nav>
  </header>
);

const PublicFooter = () => (
  <footer className="bg-gray-800 text-white">
    <div className="container mx-auto px-6 py-4 text-center">
      <p>&copy; 2024 Football Academy. All rights reserved.</p>
    </div>
  </footer>
);

const PublicLayout = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
