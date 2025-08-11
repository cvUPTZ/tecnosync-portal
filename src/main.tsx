import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'; // Import the i18n configuration
import { AuthProvider } from './contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);
