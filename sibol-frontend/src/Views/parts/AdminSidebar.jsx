import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import axiosClient from '../axios';
import Logo from '../../assets/logo-left.png';
import crophealth from '../../assets/sidebar-icons/crop-health.png';
import accountSettings from '../../assets/sidebar-icons/account-settings.png';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import LogoutModal from './LogoutModal';

const AdminSidebar = () => {
  const userName = localStorage.getItem('username');
  const [collapsed, setCollapsed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const sidebarMenus = [
    { name: 'Crop Profile',       image: crophealth,      path: '/admin/crop-profile'     },
    { name: 'Account Settings',   image: accountSettings, path: '/admin/account-settings' },
    { name: 'User Activity Logs', image: accountSettings, path: '/admin/activity-logs'    },
  ];

  return (
    <>
      <LogoutModal isOpen={showLogout} onClose={() => setShowLogout(false)} />

      {/* ── DESKTOP SIDEBAR ── */}
      <div
        className="hidden md:flex flex-col sticky top-0 h-screen bg-[#0b3d1e] py-7 font-['DM_Sans',sans-serif] relative overflow-hidden shrink-0"
        style={{
          width:        collapsed ? '68px' : '240px',
          paddingLeft:  collapsed ? '0'    : '16px',
          paddingRight: collapsed ? '0'    : '16px',
          transition:   'width 0.28s cubic-bezier(0.4,0,0.2,1), padding 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Background orbs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(46,139,87,0.18)_0%,transparent_70%)]" />
        <div className="absolute bottom-20 -left-10 w-44 h-44 rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(212,132,10,0.10)_0%,transparent_70%)]" />

        {/* ── Logo / username ── */}
        <div className="relative z-10 flex flex-col items-center pb-6 mb-6 border-b border-white/10 shrink-0">
          {collapsed ? (
            <div className="w-[38px] h-[38px] rounded-full bg-[rgba(46,139,87,0.20)] border border-[rgba(212,132,10,0.25)] flex items-center justify-center">
              <img src={Logo} alt="SIBOL" className="w-[26px] object-contain" />
            </div>
          ) : (
            <>
              <img src={Logo} alt="SIBOL" className="w-24 mb-3 drop-shadow-lg" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(212,132,10,0.15)] border border-[rgba(212,132,10,0.30)] mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f0a830]" />
                <span className="text-[9px] font-bold tracking-[2px] uppercase text-[#f0a830]">Admin</span>
              </div>
              {userName && (
                <span className="text-[11px] text-white/40 font-medium whitespace-nowrap overflow-hidden max-w-[160px] text-ellipsis text-center">
                  {userName}
                </span>
              )}
            </>
          )}
        </div>

        {/* Nav label */}
        {!collapsed && (
          <p className="text-[9px] font-medium tracking-[2px] uppercase px-4 mb-2 relative z-10 text-white/20 shrink-0">
            Navigation
          </p>
        )}

        {/* ── Nav links ── */}
        <nav className="relative z-10 shrink-0">
          <ul className="flex flex-col gap-1">
            {sidebarMenus.map((menu, i) => (
              <li key={i}>
                <NavLink
                  to={menu.path}
                  title={collapsed ? menu.name : undefined}
                  className={({ isActive }) =>
                    `relative flex items-center rounded-xl text-[13px] font-medium transition-all duration-200 overflow-hidden border
                     ${isActive
                       ? 'text-white border-[#2e8b57]/30 bg-[rgba(46,139,87,0.22)]'
                       : 'text-white/60 border-transparent hover:text-white/90 hover:bg-white/5'
                     }`
                  }
                  style={() => ({
                    gap:            collapsed ? 0 : '12px',
                    padding:        collapsed ? '10px 0' : '10px 16px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {!collapsed && (
                        <span
                          className="absolute left-0 rounded-r-[4px] bg-[#d4840a] transition-opacity duration-200"
                          style={{ top: '20%', bottom: '20%', width: '3px', opacity: isActive ? 1 : 0 }}
                        />
                      )}
                      <img
                        src={menu.image}
                        alt={menu.name}
                        className="shrink-0 brightness-0 invert transition-opacity duration-200"
                        style={{ width: '18px', height: '18px', objectFit: 'contain', opacity: isActive ? 1 : 0.55 }}
                      />
                      <span
                        className="whitespace-nowrap overflow-hidden transition-all duration-300"
                        style={{ maxWidth: collapsed ? '0px' : '160px', opacity: collapsed ? 0 : 1 }}
                      >
                        {menu.name}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Spacer */}
        <div className="flex-1 min-h-0" />

        {/* Divider */}
        <div className="relative z-10 h-px bg-white/[0.08] mb-3 shrink-0" />

        {/* ── Logout — now uses LogoutModal like UserSidebar ── */}
        <div className="relative z-10 shrink-0">
          <button
            onClick={() => setShowLogout(true)}
            title={collapsed ? 'Logout' : undefined}
            className="w-full flex items-center rounded-xl text-[13px] font-medium transition-all duration-200 border border-transparent text-red-400/65 hover:text-white hover:bg-red-500/[0.18] hover:border-red-500/[0.28]"
            style={{
              gap:            collapsed ? 0 : '12px',
              padding:        collapsed ? '10px 0' : '10px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <LogOut size={16} className="shrink-0" />
            <span
              className="whitespace-nowrap overflow-hidden transition-all duration-300"
              style={{ maxWidth: collapsed ? '0px' : '120px', opacity: collapsed ? 0 : 1 }}
            >
              Logout
            </span>
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="relative z-10 mt-3 flex items-center justify-center rounded-xl transition-all duration-200 border border-white/[0.07] bg-white/[0.03] text-white/30 hover:text-white/70 hover:bg-white/[0.07] shrink-0"
          style={{
            width:     collapsed ? '38px' : '100%',
            padding:   '8px',
            margin:    collapsed ? '12px auto 0' : '12px 0 0',
            alignSelf: collapsed ? 'center' : 'stretch',
          }}
        >
          {collapsed
            ? <ChevronRight size={14} />
            : <><ChevronLeft size={14} /><span className="text-[11px] ml-1.5 font-medium">Collapse</span></>
          }
        </button>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 w-full bg-[#0b3d1e] border-t border-white/10 font-['DM_Sans',sans-serif]">
        <nav className="flex items-center justify-around px-1 py-2">
          {sidebarMenus.map((menu, i) => (
            <NavLink
              key={i}
              to={menu.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl transition-all duration-200
                 ${isActive ? 'text-[#f0a830]' : 'text-white/50 hover:text-white/75'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#d4840a]" />}
                  <img
                    src={menu.image}
                    alt={menu.name}
                    className="w-5 h-5 object-contain brightness-0 invert transition-opacity duration-200"
                    style={{
                      opacity: isActive ? 1 : 0.5,
                      filter: isActive
                        ? 'brightness(0) saturate(100%) invert(62%) sepia(80%) saturate(600%) hue-rotate(5deg)'
                        : undefined,
                    }}
                  />
                  <span className="text-[9px] font-medium leading-tight">
                    {menu.name === 'Account Settings' ? 'Account'
                      : menu.name === 'User Activity Logs' ? 'Logs'
                      : menu.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {/* ── Logout — same modal trigger ── */}
          <button
            onClick={() => setShowLogout(true)}
            className="flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl transition-all duration-200 text-red-400/60 hover:text-red-400"
          >
            <LogOut size={20} />
            <span className="text-[9px] font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;
