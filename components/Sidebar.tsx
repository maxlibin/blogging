"use client";

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PenTool, Settings } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import { useWordPress } from '../contexts/WordPressContext';

interface SidebarProps {
  className?: string;
  onLinkClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onLinkClick }) => {
  const { settings, isLoaded } = useWordPress();

  const links = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/generate', icon: PenTool, label: 'Write New Post' },
    { href: '/settings', icon: Settings, label: 'Connections' },
  ];

  return (
    <aside className={cn("flex flex-col w-64 bg-white border-r border-slate-200", className)}>
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900">
          <div className="bg-slate-900 text-white p-1.5 rounded-md">
            <PenTool className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">AutoBlog Pilot</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.href}
              to={link.href}
              onClick={onLinkClick}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 text-sm font-medium",
                isActive 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
         {isLoaded && (
           settings.isConnected ? (
              <Badge variant="success" className="w-full justify-center py-1.5">
                WordPress Active
              </Badge>
           ) : (
              <Badge variant="secondary" className="w-full justify-center py-1.5 text-slate-500">
                WordPress Disconnected
              </Badge>
           )
         )}
      </div>
    </aside>
  );
};