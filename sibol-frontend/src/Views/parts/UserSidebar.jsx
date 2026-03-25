import React from 'react';
import { NavLink } from 'react-router-dom';
import axiosClient from '../axios';
import Swal from 'sweetalert2';
import Logo from '../../assets/logo-left.png';
import dashboard from '../../assets/sidebar-icons/dashboard.png';
import reports from '../../assets/sidebar-icons/reports.png';
import cropcare from '../../assets/sidebar-icons/crop-care.png';
import crophealth from '../../assets/sidebar-icons/crop-health.png';
import accountSettings from '../../assets/sidebar-icons/account-settings.png';
import { LogOut } from 'lucide-react';

const UserSidebar = () => {
  const userName = localStorage.getItem('username');

  const sidebarMenus = [
    { name: "Dashboard", image: dashboard, path: "/user/dashboard" },
    { name: "Crop Care", image: cropcare, path: "/user/crop-care" },
    { name: "Report", image: reports, path: "/user/report" },
    { name: "Crop Profile", image: crophealth, path: "/user/crop-profile" },
    { name: "Account Settings", image: accountSettings, path: "/user/account-settings" },
  ];

  const handleLogout = () => {
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: '#d4840a',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-lg px-6 py-2.5',
        cancelButton: 'rounded-lg px-6 py-2.5'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Logging out...',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => { Swal.showLoading(); }
        });

        const token = localStorage.getItem('authToken');
        if (token) {
          axiosClient.post('logout', {}, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(() => {
              localStorage.removeItem('authToken');
              localStorage.removeItem('username');
              localStorage.removeItem('location');
              localStorage.removeItem('role');
              Swal.fire({
                title: "Logged out!",
                text: "You have successfully logged out.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
                customClass: { popup: 'rounded-2xl' }
              }).then(() => { window.location.href = '/guest/login'; });
            })
            .catch(() => {
              Swal.fire({
                title: "Error!",
                text: "There was an issue logging you out.",
                icon: "error",
                confirmButtonColor: '#d4840a',
                customClass: { popup: 'rounded-2xl' }
              });
            });
        }
      }
    });
  };

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <div className="hidden md:flex flex-col w-60 min-h-screen bg-[#0b3d1e] px-4 py-7 font-['DM_Sans',sans-serif] relative overflow-hidden shrink-0">

        {/* Background orbs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(46,139,87,0.18)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-20 -left-10 w-44 h-44 rounded-full bg-[radial-gradient(circle,rgba(212,132,10,0.10)_0%,transparent_70%)] pointer-events-none" />

        {/* Logo + username */}
        <div className="flex flex-col items-center pb-6 mb-6 border-b border-white/10 relative z-10">
          <img src={Logo} alt="SIBOL" className="w-24 mb-3 drop-shadow-lg" />
          {userName && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4840a]/15 border border-[#d4840a]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f0a830] animate-pulse" />
              <span className="text-[10px] font-medium tracking-widest uppercase text-[#f0a830]">
                {userName}
              </span>
            </div>
          )}
        </div>

        {/* Nav label */}
        <p className="text-[9px] font-medium tracking-[2px] uppercase text-white/20 px-4 mb-2 relative z-10">
          Navigation
        </p>

        {/* Nav links */}
        <nav className="flex-1 relative z-10">
          <ul className="flex flex-col gap-1">
            {sidebarMenus.map((menu, i) => (
              <li key={i}>
                <NavLink
                  to={menu.path}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 overflow-hidden
                    ${isActive
                      ? 'text-white bg-[#2e8b57]/25 border border-[#2e8b57]/30'
                      : 'text-white/45 hover:text-white/85 hover:bg-white/5 border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Amber left bar */}
                      <span className={`absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full bg-[#d4840a] transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                      <img
                        src={menu.image}
                        alt={menu.name}
                        className={`w-[18px] h-[18px] object-contain brightness-0 invert transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-40'}`}
                      />
                      <span>{menu.name}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Divider + Logout */}
        <div className="h-px bg-white/8 my-3 relative z-10" />
        <div className="relative z-10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-red-400/70 hover:text-white hover:bg-red-600/20 hover:border-red-500/30 border border-transparent transition-all duration-200"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="md:hidden w-full bg-[#0b3d1e] border-t border-white/10 font-['DM_Sans',sans-serif]">
        <nav className="flex items-center justify-around px-1 py-2">
          {sidebarMenus.slice(0, 5).map((menu, i) => (
            <NavLink
              key={i}
              to={menu.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl transition-all duration-200
                ${isActive
                  ? 'text-[#f0a830] bg-[#d4840a]/12'
                  : 'text-white/35 hover:text-white/65'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#d4840a]" />
                  )}
                  <img
                    src={menu.image}
                    alt={menu.name}
                    className={`w-5 h-5 object-contain brightness-0 invert transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-35'}`}
                    style={isActive ? { filter: 'brightness(0) saturate(100%) invert(62%) sepia(80%) saturate(600%) hue-rotate(5deg)' } : {}}
                  />
                  <span className="text-[9px] font-medium leading-tight">
                    {menu.name === "Account Settings" ? "Account" : menu.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="text-[9px] font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default UserSidebar;
