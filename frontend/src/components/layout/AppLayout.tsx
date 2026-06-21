import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { EcoBackground } from '@/components/ui/EcoBackground';

export const AppLayout: React.FC = () => {
  return (
    // No bg on outer div — body already has bg-carbon-50/dark:bg-carbon-950.
    // EcoBackground (z=1) floats above body bg; main content (z=2) above that.
    // Transparent gaps between cards reveal the floating leaves underneath.
    <div className="min-h-screen flex transition-colors duration-200">
      <EcoBackground />
      <Sidebar />
      <main className="relative flex-1 ml-64 min-h-screen" style={{ zIndex: 2 }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
