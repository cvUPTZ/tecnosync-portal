import React from 'react';

const PlatformFooter = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto py-8 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">Academy Creator</h2>
            <p className="text-sm text-gray-400">Your success is our mission.</p>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300">Facebook</a>
            <a href="#" className="hover:text-gray-300">Twitter</a>
            <a href="#" className="hover:text-gray-300">LinkedIn</a>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Academy Creator. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default PlatformFooter;
