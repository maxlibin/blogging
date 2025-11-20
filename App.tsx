import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { PostGenerator } from './pages/PostGenerator';
import { ConnectWordPress } from './components/ConnectWordPress';
import { WordPressSettings } from './types';
import { 
  LayoutDashboard, 
  PenTool, 
  Settings, 
  Menu, 
  X 
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';

const App: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wpSettings, setWpSettings] = useState<WordPressSettings>(() => {
    const saved = localStorage.getItem('wp_settings');
    return saved ? JSON.parse(saved) : {
      siteUrl: '',
      username: '',
      appPassword: '',
      isConnected: false
    };
  });

  useEffect(() => {
    localStorage.setItem('wp_settings', JSON.stringify(wpSettings));
  }, [wpSettings]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const SidebarLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <NavLink 
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      className={({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 text-sm font-medium ${
          isActive 
            ? 'bg-slate-900 text-white shadow-sm' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <Router>
      <div className="min-h-screen bg-slate-50/50 flex overflow-hidden font-sans text-slate-900">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 z-20">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900">
              <div className="bg-slate-900 text-white p-1.5 rounded-md">
                <PenTool className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">AutoBlog Pilot</span>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink to="/generate" icon={PenTool} label="Write New Post" />
            <SidebarLink to="/settings" icon={Settings} label="Connections" />
          </nav>

          <div className="p-4 border-t border-slate-100">
             {wpSettings.isConnected ? (
                <Badge variant="success" className="w-full justify-center py-1.5">
                  WordPress Active
                </Badge>
             ) : (
                <Badge variant="secondary" className="w-full justify-center py-1.5 text-slate-500">
                  WordPress Disconnected
                </Badge>
             )}
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed w-full bg-white z-30 border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="bg-slate-900 text-white p-1.5 rounded-md">
              <PenTool className="w-4 h-4" />
            </div>
            <span className="text-base font-bold">AutoBlog Pilot</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm" onClick={toggleMobileMenu} />
        )}
        
        {/* Mobile Sidebar */}
        <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-40 transform transition-transform duration-300 ease-in-out md:hidden border-r border-slate-200 shadow-xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-slate-100">
             <span className="text-xl font-bold text-slate-900">AutoBlog Pilot</span>
          </div>
          <nav className="p-4 space-y-2">
             <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink to="/generate" icon={PenTool} label="Write New Post" />
            <SidebarLink to="/settings" icon={Settings} label="Connections" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0 bg-slate-50/50">
          <div className="max-w-7xl mx-auto p-6 md:p-10">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/generate" element={<PostGenerator wpSettings={wpSettings} />} />
              <Route path="/settings" element={<ConnectWordPress settings={wpSettings} onSave={setWpSettings} />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;