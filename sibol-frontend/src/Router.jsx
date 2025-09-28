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

const router = createBrowserRouter ([

    {
        path: '/',
        element: <App/>
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
                    }
                ],
            }
        ]
    }


])

export default router;
