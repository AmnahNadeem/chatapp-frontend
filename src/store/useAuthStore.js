import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            authUser: JSON.parse(localStorage.getItem("authUser")) || null, // ✅ Ensure user is loaded
            accessToken: localStorage.getItem("access_token") || null,
            refreshToken: localStorage.getItem("refresh_token") || null,
            isAuthenticated: !!localStorage.getItem("access_token"),
            onlineUsers: [],
            isCheckingAuth: true,
            isLoggingIn: false,
            isUpdatingProfile: false,

            // ✅ Get Backend URL from Environment Variables
            API_URL: process.env.REACT_APP_BACKEND_URL,

            // ✅ Check if User is Authenticated
            checkAuth: async () => {
                try {
                    const accessToken = localStorage.getItem("access_token");
                    if (!accessToken) throw new Error("No token found");

                    const decoded = jwtDecode(accessToken);
                    set({
                        authUser: decoded,
                        isAuthenticated: true,
                        accessToken,
                    });

                    console.log("✅ Authenticated User:", decoded);

                    get().connectSocket();
                } catch (error) {
                    console.error("❌ Auth Check Failed:", error);
                    set({ authUser: null, isAuthenticated: false });
                    get().logout();
                } finally {
                    set({ isCheckingAuth: false });
                }
            },

            // ✅ Signup User
            signup: async (data) => {
                set({ isLoggingIn: true });
                try {
                    const res = await axiosInstance.post(`${get().API_URL}/signup/`, data);
                    const { access, refresh } = res.data.tokens;

                    localStorage.setItem("access_token", access);
                    localStorage.setItem("refresh_token", refresh);

                    set({
                        authUser: jwtDecode(access),
                        accessToken: access,
                        refreshToken: refresh,
                        isAuthenticated: true,
                    });

                    toast.success("✅ Account created successfully");
                    get().connectSocket();
                } catch (error) {
                    toast.error(error.response?.data?.error || "❌ Signup failed");
                } finally {
                    set({ isLoggingIn: false });
                }
            },

            // ✅ Login User
            login: async (data) => {
                set({ isLoggingIn: true });
                try {
                    const res = await axiosInstance.post(`${get().API_URL}/login/`, data);
                    const { access, refresh } = res.data.tokens;

                    localStorage.setItem("access_token", access);
                    localStorage.setItem("refresh_token", refresh);

                    set({
                        authUser: jwtDecode(access),
                        accessToken: access,
                        refreshToken: refresh,
                        isAuthenticated: true,
                    });

                    toast.success("✅ Logged in successfully");
                    get().connectSocket();
                } catch (error) {
                    toast.error(error.response?.data?.error || "❌ Login failed");
                } finally {
                    set({ isLoggingIn: false });
                }
            },

            // ✅ Logout User
            logout: async () => {
                try {
                    await axiosInstance.post(`${get().API_URL}/logout/`);
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");

                    set({
                        authUser: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                    });

                    toast.success("✅ Logged out successfully");
                    get().disconnectSocket();
                } catch (error) {
                    toast.error("❌ Logout failed");
                }
            },

            // ✅ Function to listen for online users from WebSocket
            listenForOnlineUsers: (socket) => {
                if (!socket) {
                    console.error("❌ WebSocket is not initialized.");
                    return;
                }

                // ✅ Listen for "getOnlineUsers" event from WebSocket
                socket.on("getOnlineUsers", (userIds) => {
                    console.log("👥 Online Users Updated:", userIds);
                    set({ onlineUsers: userIds }); // ✅ Store online user IDs in state
                });
            },

            // ✅ Check if a user is online
            isUserOnline: (userId) => {
                const { onlineUsers } = get();
                return onlineUsers.includes(userId);
            },

            // ✅ Refresh Access Token
            refreshAccessToken: async () => {
                const refreshToken = localStorage.getItem("refresh_token");
                if (!refreshToken) return;

                try {
                    const res = await axiosInstance.post(`${get().API_URL}/token/refresh/`, {
                        refresh: refreshToken,
                    });
                    const newAccessToken = res.data.access;

                    localStorage.setItem("access_token", newAccessToken);

                    set({
                        accessToken: newAccessToken,
                        authUser: jwtDecode(newAccessToken),
                        isAuthenticated: true,
                    });
                } catch (error) {
                    console.error("❌ Token Refresh Failed:", error);
                    get().logout();
                }
            },
        }),
        {
            name: "auth-storage",
            getStorage: () => localStorage,
        }
    )
);

export default useAuthStore;
