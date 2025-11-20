import React from 'react';
import { WordPressProvider } from '../contexts/WordPressContext';
import { Sidebar } from '../components/Sidebar';
import { MobileHeader } from '../components/MobileHeader';

// In a real Next.js app, you would include <html> and <body> tags here.
// For this preview environment, we rely on index.html for the document structure.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WordPressProvider>
      <div className="flex w-full min-h-screen overflow-hidden bg-slate-50/50">
         <Sidebar className="hidden md:flex z-20" />
         <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
            <MobileHeader />
            <main className="flex-1 overflow-y-auto p-6 md:p-10">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
         </div>
      </div>
    </WordPressProvider>
  );
}