import React from 'react';
import { NavLink } from 'react-router-dom';
import axiosClient from '../axios';
import Swal from 'sweetalert2';

const UserSidebar = () => {
  const sidebarMenus = [
    { name: "Dashboard", path: "/user/dashboard" },
    { name: "Crop Care", path: "/user/crop-care" },
    { name: "Report", path: "/user/report" },
    { name: "Crop Profile", path: "/user/crop-profile" },
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
    <div className="w-64 min-h-screen bg-green-50 shadow-lg p-6 flex flex-col">
      <h1  className="text-2xl font-bold mb-8 text-green-700">Sibol</h1>
      <ul className="space-y-4 flex-1">
        {sidebarMenus.map((menu, i) => (
          <li key={i}>
            <NavLink
              to={menu.path}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg font-sm transition-colors duration-200 ${
                  isActive
                    ? "bg-green-500 text-white"
                    : "text-green-700 hover:bg-green-200"
                }`
              }
            >
              {menu.name}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <button onClick={handleLogout} className="w-full py-2 px-4 font-sans font-bold bg-white text-black rounded-lg hover:text-red-500 transition-colors">

          Logout
        </button>
      </div>
    </div>
  );
};

export default UserSidebar;
