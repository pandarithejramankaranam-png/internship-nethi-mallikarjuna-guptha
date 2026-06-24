import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  PlusCircle, 
  CreditCard, 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  User,
  Dumbbell
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'New Contract', href: '/contract-form', icon: PlusCircle },
    { name: 'Contracts List', href: '/contracts', icon: FileSpreadsheet },
    { name: 'Payment Tracker', href: '/payments', icon: CreditCard },
    { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
  ];

  // Helper to check if current route matches
  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const pageTitles = {
    '/dashboard': 'Dashboard Overview',
    '/contract-form': 'Gym Setup Contract Entry',
    '/contracts': 'Gym Setup Contracts Database',
    '/payments': 'B2B Payment Tracking',
    '/reports': 'Financial & Analytics Reports'
  };

  const getPageTitle = () => {
    const matchedPath = Object.keys(pageTitles).find(path => location.pathname.startsWith(path));
    return matchedPath ? pageTitles[matchedPath] : 'Management Console';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-shrink-0 lg:flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 bg-slate-950 border-b border-slate-800">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">IronForge B2B</h1>
            <span className="text-xs text-indigo-400 font-medium">Gym Setup Contracts</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User section */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-400 rounded-lg hover:bg-red-950/40 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay and Menu) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-xs bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col z-50">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="h-16 flex items-center gap-3 px-6 bg-slate-950 border-b border-slate-800">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">IronForge B2B</h1>
                <span className="text-[10px] text-indigo-400 font-medium">Gym Setup Contracts</span>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-400 rounded-lg hover:bg-red-950/40 hover:text-red-400 transition-all"
              >
                <LogOut className="h-5 w-5" />
                Logout Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 shadow-sm shadow-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Dropdown Trigger */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 relative transition-all"
              >
                <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
                <Bell className="h-5 w-5" />
              </button>
              
              {/* Notification Overlay Menu */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-30 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                      <span className="font-semibold text-slate-900 text-sm">System Notifications</span>
                      <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold">2 New</span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-slate-50 transition-colors">
                        <p className="text-xs text-slate-700 font-semibold">Payment Received</p>
                        <p className="text-xs text-slate-500 mt-0.5">Advance deposit for Innovate Tech HQ has been verified (₹63,000).</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">10 mins ago</span>
                      </div>
                      <div className="px-4 py-3 hover:bg-slate-50 transition-colors">
                        <p className="text-xs text-slate-700 font-semibold">Contract Nearing Delivery Date</p>
                        <p className="text-xs text-slate-500 mt-0.5">Vertex Heights HOA delivery scheduled for July 10, 2026.</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                      </div>
                    </div>
                    <div className="px-4 py-2 border-t border-slate-100 text-center">
                      <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Clear All Notifications</button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-all focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-slate-900 text-indigo-400 font-bold flex items-center justify-center border-2 border-slate-100">
                  <User className="h-4.5 w-4.5 text-white" />
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-950">{user?.name || 'Dev Admin'}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{user?.role || 'System Manager'}</span>
                </div>
              </button>

              {showProfile && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowProfile(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-30 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user?.name || 'Dev Admin'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@ironforge.com'}</p>
                    </div>
                    <button 
                      onClick={() => { setShowProfile(false); navigate('/dashboard'); }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Dashboard Overview
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border-t border-slate-100 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
