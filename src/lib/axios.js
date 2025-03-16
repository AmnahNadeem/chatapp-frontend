// axios.js
import axios from "axios";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

// ✅ Get Backend URL from Environment Variables
const API_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000/";

// ✅ Create Axios Instance
const axiosInstance = axios.create({
    baseURL: API_URL, // ✅ Dynamic API URL
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
    },
});

console.log("✅ Axios Base URL:", API_URL); // ✅ Debugging Log

// ✅ Request Interceptor: Attach Access Token to Requests
axiosInstance.interceptors.request.use(
    async (config) => {
        const accessToken = localStorage.getItem("access_token");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        } else {
            console.error("❌ No access token found!");
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Response Interceptor: Handle Token Expiry & Auto-Refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { refreshAccessToken, logout } = useAuthStore.getState();
        const originalRequest = error.config;

        // Handle Unauthorized (401) Errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await refreshAccessToken(); // Attempt to refresh token
                const { accessToken } = useAuthStore.getState();

                if (accessToken) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return axiosInstance(originalRequest); // Retry original request
                }
            } catch (refreshError) {
                console.error("❌ Token refresh failed. Logging out user.");
                toast.error("Session expired. Please log in again.");
                logout();
            }
        }

        return Promise.reject(error);
    }
);

export { axiosInstance };
