import { createBrowserRouter } from "react-router-dom"
import App from "./App";
import Login from "./Views/Login";
import GuestLayout from "./components/GuestLayout.jsx"
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import AdminLayout from "./components/AdminLayout.jsx";
import UserLayout from "./components/UserLayout.jsx";
import Register from "./Views/Register.jsx";
import UserDashboard from "./Views/UserDashboard.jsx";
import Cropcare from "./Views/Cropcare.jsx";
import Reports from "./Views/Reports.jsx";
import DailyReport from "./Views/DailyReport.jsx";
import CropProfile from "./Views/CropProfile.jsx";
import AccountSettings from "./Views/AccountSettings.jsx";
import AdminCropProfile from "./Views/AdminCropProfile.jsx";
import AdminAccountSettings from "./Views/AdminAccountSettings.jsx";
import CropCareConfig from "./Views/CropCareConfig.jsx";
import CropCarePlant from "./Views/CropCarePlant.jsx";
import AboutUs from "./Views/AboutUs.jsx";
import AuthCallback from "./Views/parts/AuthCallback.jsx";
import AdminActivityLog from "./Views/AdminActivityLog.jsx";

const router = createBrowserRouter ([

    {
        path: '/',
        element: <App/>
    },
    {
      path: '/auth/callback',
      element: <AuthCallback/>
    },
    {
     path: '/guest',
     element: <GuestLayout/>,
     children: [
        {
            path: "/guest/login",
            element: <Login/>
        },
        {
            path: "/guest/sign_up",
            element: <Register/>
        }
     ]
    },
    {
        element: <AuthenticatedLayout/>,
        children: [
            {
                path: "/admin",
                element: <AdminLayout/>,
                children: [
                    {
                        path: "/admin/crop-profile",
                        element: <AdminCropProfile/>
                    },
                    {
                        path: "/admin/account-settings",
                        element: <AdminAccountSettings/>
                    },
                    {
                        path: "/admin/activity-logs",
                        element: <AdminActivityLog/>
                    },
                ],
            },
            {
                path: "/user",
                element: <UserLayout/>,
                children: [
                    {
                        path: "/user/dashboard",
                        element: <UserDashboard/>
                    },
                    {
                        path: "/user/crop-care",
                        element: <Cropcare/>
                    },
                    {
                        path: "/user/crop-care/:garden_id",
                        element: <CropCareConfig/>
                    },
                    {
                        path: "/user/crop-care/:garden_id/:crop_name/:esp_id",
                        element: <CropCarePlant/>
                    },
                    {
                        path: "/user/report",
                        element: <Reports/>
                    },
                    {
                        path: "/user/report/daily-report/:year/:month/:day",
                        element: <DailyReport/>
                    },
                    {
                        path: "/user/crop-profile",
                        element: <CropProfile/>
                    },
                    {
                        path: "/user/account-settings",
                        element: <AccountSettings/>
                    },
                    {
                      path: "/user/about-us",
                      element: <AboutUs/>
                    },
                ],
            }
        ]
    }


])

export default router;
