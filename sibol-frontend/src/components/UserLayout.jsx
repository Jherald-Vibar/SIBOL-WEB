import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const UserLayout = () => {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setAllowed(role === "user");
  }, []);

  if (allowed === null) return (
       <div className="flex justify-center items-center min-h-screen">
            <div role="status" className="max-w-sm w-full animate-pulse">
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
            <span className="sr-only">Loading.....</span>
            </div>
        </div> );
;

  if (!allowed) return <Navigate to="/guest/login" replace />;

  return <Outlet />;
};

export default UserLayout;
