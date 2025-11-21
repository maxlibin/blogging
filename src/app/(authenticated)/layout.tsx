import React from 'react';
import { Sidebar } from '../../components/Sidebar';
import { MobileHeader } from '../../components/MobileHeader';

export default function DashboardLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-slate-50/80 relative font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900">
        
        {/* Global Background Gradients for Dashboard */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-100/60 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/60 rounded-full blur-[100px]" />
          <div className="absolute top-[40%] right-[20%] w-[20%] h-[20%] bg-pink-100/40 rounded-full blur-[80px]" />
        </div>

        <Sidebar className="hidden md:flex z-20" />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
          <MobileHeader />
          <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
              {children}
          </main>
        </div>
    </div>
  );
}
