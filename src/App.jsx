import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import ChatPage from "./pages/Chat"; // New chat page
import "./index.css";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";

// ✅ Fetch Backend URL from Environment Variables
const API_URL = process.env.REACT_APP_BACKEND_URL;

const App = () => {
  const { onlineUsers } = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme] = useState(localStorage.getItem("theme") || "light");

  console.log({ onlineUsers });

  // Apply the theme globally when the app loads
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Function to refresh JWT token before expiry
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_URL}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("access_token", data.access);
        return data.access;
      } else {
        logoutUser();
        return false;
      }
    } catch (error) {
      console.error("❌ Error refreshing token:", error);
      logoutUser();
      return false;
    }
  };

  // Function to check authentication status
  const checkAuthStatus = async () => {
    let token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/user/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        token = await refreshToken();
        if (token) {
          return checkAuthStatus(); // ✅ Retry once after refreshing token
        } else {
          setLoading(false);
          return;
        }
      }

      const data = await response.json();
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        logoutUser();
      }
    } catch (error) {
      console.error("❌ Error checking auth status:", error);
      logoutUser();
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logoutUser = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  if (loading) {
    return <div className="h-screen flex justify-center items-center">Loading...</div>;
  }

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={!isAuthenticated ? <Signup setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/chat" />} />
        <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/chat" />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/chat" element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
