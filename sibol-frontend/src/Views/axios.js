import axios from "axios";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.0:8000/api";

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

export const getCsrfToken = () => {
    return axios.get(`${API_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
    });
};

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Optional: Add response interceptor for better error handling
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("authToken");
            // Optionally redirect to login
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
