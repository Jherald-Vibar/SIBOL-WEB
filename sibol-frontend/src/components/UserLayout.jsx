import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Logo from '../assets/logo-left.png';
import UserSidebar from '../Views/parts/UserSidebar';
import UserNavbar from '../Views/parts/UserNavbar';
import CoachMark from './CoachMark';


const UserLayout = () => {
  const [allowed, setAllowed] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setAllowed(role === "user");
  }, []);

  // ── Loading screen ──
  if (allowed === null) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.3); }
            50% { box-shadow: 0 0 50px rgba(16, 185, 129, 0.6); }
          }
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
          .progress-bar { animation: progress 2s ease-in-out infinite; }
          .shimmer-effect {
            background: linear-gradient(90deg, #10b981 0%, #34d399 25%, #6ee7b7 50%, #34d399 75%, #10b981 100%);
            background-size: 200% auto;
            animation: shimmer 2s linear infinite;
          }
          .spinner-ring { animation: spin-slow 2s linear infinite; }
        `}</style>

        <div className="flex flex-col items-center justify-center gap-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-4 border-green-200 spinner-ring"
              style={{ width: '180px', height: '180px' }} />
            <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
            <div className="relative bg-white rounded-full p-6 animate-pulse-glow"
              style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={Logo} alt="SIBOL Logo" className="w-28 h-28 object-contain animate-float" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-900 via-green-600 to-green-900 mb-2">
              Loading
            </h2>
            <p className="text-sm text-green-700 font-medium">Verifying your access...</p>
          </div>
          <div className="w-64 md:w-80 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div className="shimmer-effect h-full rounded-full progress-bar" />
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Auth failed ──
  if (!allowed) return <Navigate to="/guest/login" replace />;

  // ── Authenticated layout ──
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar — never remounts on navigation */}
      <UserSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        showLogout={showLogout}
        onLogoutOpen={() => setShowLogout(true)}
        onLogoutClose={() => setShowLogout(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Navbar */}
        <div className="bg-white shadow-sm sticky top-0 z-30">
          <UserNavbar />
        </div>

        {/* Page content */}
        <main className="flex-1 flex flex-col overflow-auto pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* ✅ CoachMark — auto-launches once on first login */}
      <CoachMark autoLaunch={true} />
    </div>
  );
};

export default UserLayout;
