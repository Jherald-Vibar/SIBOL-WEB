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
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      backdrop: true,
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-xl font-semibold',
        confirmButton: 'rounded-lg px-6 py-2.5',
        cancelButton: 'rounded-lg px-6 py-2.5'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loading state
        Swal.fire({
          title: 'Logging out...',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const token = localStorage.getItem('authToken');
        if (token) {
          axiosClient.post('logout', {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then(response => {
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
                customClass: {
                  popup: 'rounded-2xl'
                }
              }).then(() => {
                window.location.href = '/guest/login';
              });
            })
            .catch(error => {
              Swal.fire({
                title: "Error!",
                text: "There was an issue logging you out.",
                icon: "error",
                confirmButtonColor: '#dc2626',
                customClass: {
                  popup: 'rounded-2xl'
                }
              });
            });
        }
      }
    });
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 min-h-screen bg-white shadow-xl p-6 flex-col font-['Roboto',sans-serif]">
        {/* Header Section */}
        <div className="mb-10 pb-4 flex flex-col items-center justify-center border-gray-700">
          <img src={Logo} alt="Logo" className='w-32' />
          <p className="text-xs text-gray-500 uppercase text-center tracking-widest font-medium">{userName}</p>
        </div>

        <nav className="flex-1">
          <ul className="space-y-1">
            {sidebarMenus.map((menu, i) => (
              <li key={i}>
                <NavLink
                  to={menu.path}
                  className={({ isActive }) =>
                    `relative flex items-center px-6 py-4 text-[15px] font-semibold rounded-lg transition-all duration-300 group ${
                      isActive
                        ? "text-green-600 bg-[#00640066] rounded-md shadow-inner"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`absolute left-0 top-0 bottom-0 w-2 rounded-md transition-all duration-300 ${
                        isActive ? "bg-green-900" : "bg-transparent group-hover:bg-gray-600"
                      }`}></div>
                      <img src={menu.image} alt={menu.name} className='mr-3' />
                      <span className="tracking-wide relative z-10">{menu.name}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Section - Matching Design */}
        <div className="mt-auto pt-6">
          <button
            onClick={handleLogout}
            className="relative flex items-center px-6 py-4 text-[15px] font-semibold rounded-lg transition-all duration-300 group w-full text-red-500 hover:text-white hover:bg-red-600"
          >
            <div className="absolute left-0 top-0 bottom-0 w-2 rounded-md bg-transparent group-hover:bg-red-800 transition-all duration-300"></div>
            <LogOut className="mr-3 w-5 h-5" />
            <span className="tracking-wide relative z-10">Logout</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {/* Mobile Footer Navigation */}
      <div className="md:hidden w-full bg-white shadow-2xl border-t-2 border-gray-200 font-['Roboto',sans-serif]">
        <nav className="flex items-center justify-around px-2 py-3">
          {sidebarMenus.slice(0, 5).map((menu, i) => (
            <NavLink
              key={i}
              to={menu.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-300 relative ${
                  isActive
                    ? "text-green-600 bg-[#00640066]"
                    : "text-gray-400 hover:text-gray-800 hover:bg-gray-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <img src={menu.image} alt={menu.name} className='w-6 h-6 mb-1' />
                  <span className="text-[10px] font-semibold text-center leading-tight">
                    {menu.name === "Account Settings" ? "Account" : menu.name}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-900 rounded-t-md"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Mobile Logout Button */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-300 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className='w-6 h-6 mb-1' />
            <span className="text-[10px] font-semibold text-center leading-tight">
              Logout
            </span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default UserSidebar;
