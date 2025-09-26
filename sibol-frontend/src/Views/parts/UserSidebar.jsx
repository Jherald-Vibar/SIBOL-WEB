import React from 'react';
import { NavLink } from 'react-router-dom';
import axiosClient from '../axios';
import Swal from 'sweetalert2';
import Logo from '../../assets/logo-left.png'
import dashboard from '../../assets/sidebar-icons/dashboard.png'
import reports from '../../assets/sidebar-icons/reports.png'
import cropcare from '../../assets/sidebar-icons/crop-care.png'
import crophealth from '../../assets/sidebar-icons/crop-health.png'
import accountSettings from '../../assets/sidebar-icons/account-settings.png'

const UserSidebar = () => {

  const userName = localStorage.getItem('username');

  const sidebarMenus = [
    { name: "Dashboard", image: dashboard,  path: "/user/dashboard" },
    { name: "Crop Care", image: cropcare,  path: "/user/crop-care" },
    { name: "Report", image: reports,  path: "/user/report" },
    { name: "Crop Profile", image: crophealth, path: "/user/crop-profile" },
    { name: "Account Settings", image: accountSettings, path: "/user/account-settings" },
  ];

  const handleLogout = () => {
    Swal.fire({
      title: "Do you want to Logout?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
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
            window.location.href = '/guest/login';
            Swal.fire("Logged out!", "You have successfully logged out.", "success");
          })
          .catch(error => {
            Swal.fire("Error!", "There was an issue logging you out.", "error");
          });
        }
      } else if (result.isDenied) {
        Swal.fire("User Still Logged in!");
      }
    });
  };

  return (
    <div className="w-64 min-h-screen bg-white shadow-xl p-6 flex flex-col">
      {/* Header Section */}
      <div className="mb-10 pb-4 flex flex-col items-center justify-center border-gray-700">
        <img src={Logo} alt="" className='w-32' />
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
                    <img src={menu.image} alt={menu.image} className='mr-3' />
                    <span className="tracking-wide relative z-10">{menu.name}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Section */}
      <div className="mt-auto pt-6 border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 bg-gray-800 text-gray-300 rounded-lg
                     hover:bg-gray-700 hover:text-white transition-all duration-200
                     font-semibold tracking-wide hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserSidebar;
