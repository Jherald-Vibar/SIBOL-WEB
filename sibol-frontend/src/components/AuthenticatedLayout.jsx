import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axiosClient, { getCsrfToken } from '../Views/axios';

const AuthenticatedLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setIsLoading] = useState(true);

  useEffect(() => {
    getCsrfToken()
      .then(() => {
        axiosClient.get("auth/check")
          .then((res) => {
            console.log("Auth Check Response:", res.data);
            if (res.data.authenticated) {
              setIsAuthenticated(true);
              localStorage.setItem("role", res.data.role);
            } else {
              setIsAuthenticated(false);
            }
          })
          .catch(() => setIsAuthenticated(false))
          .finally(() => setIsLoading(false));
      })
      .catch(() => {
        setIsAuthenticated(false);
        setIsLoading(false);
      });
  }, []);

  if (loading) {
  return (
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
    </div>
  );
}


  if (!isAuthenticated) return <Navigate to="/guest/login" replace />;

  return <Outlet />;
};

export default AuthenticatedLayout;
