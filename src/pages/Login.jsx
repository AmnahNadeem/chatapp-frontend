import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

const Login = ({ setIsAuthenticated }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const navigate = useNavigate();

    // ✅ Get Backend URL from Environment Variables
    const API_URL = process.env.REACT_APP_BACKEND_URL;

    // ✅ Function to Logout User & Clear Storage
    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/logout/`, { // ✅ Dynamic URL
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json"
                }
            });
        } catch (error) {
            console.warn("❌ Failed to log out:", error);
        }

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setIsAuthenticated(false);
        navigate("/login");
    };

    // ✅ Function to Refresh JWT Token
    const refreshToken = async () => {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) return;

        try {
            const response = await fetch(`${API_URL}/token/refresh/`, { // ✅ Dynamic URL
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("access_token", data.access);
                return data.access;
            } else {
                console.warn("❌ Refresh token expired. Logging out.");
                handleLogout();
            }
        } catch (error) {
            console.error("Error refreshing token:", error);
            handleLogout();
        }
    };

    // ✅ Function to Check Authentication Status
    const checkAuthStatus = async () => {
        let token = localStorage.getItem("access_token");
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/user/`, { // ✅ Dynamic URL
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                setIsAuthenticated(true);
                navigate("/chat");
            } else if (response.status === 401) {
                token = await refreshToken();
                if (token) checkAuthStatus(); // Retry with new token
            } else {
                handleLogout();
            }
        } catch (error) {
            console.error("Error checking auth status:", error);
            handleLogout();
        }
    };

    // ✅ Auto-login on mount
    useEffect(() => {
        checkAuthStatus();
    }, [API_URL]); // ✅ Include API_URL as a dependency

    // ✅ Handle Login Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);

        try {
            const response = await fetch(`${API_URL}/login/`, { // ✅ Dynamic URL
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("access_token", data.tokens.access);
                localStorage.setItem("refresh_token", data.tokens.refresh);
                setIsAuthenticated(true);

                toast.success("Login successful! Redirecting...");
                setTimeout(() => navigate("/chat"), 1000);
            } else {
                toast.error(data.error || "Invalid credentials");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="h-screen grid lg:grid-cols-2">
            <div className="flex flex-col justify-center items-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center mb-8">
                        <div className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <MessageSquare className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
                            <p className="text-base-content/60">Sign in to your account</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-control">
                            <label className="label">Email</label>
                            <input
                                type="email"
                                className="input input-bordered w-full"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input input-bordered w-full"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-full" disabled={isLoggingIn}>
                            {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
                        </button>
                    </form>
                </div>
            </div>
            <AuthImagePattern title="Welcome back!" subtitle="Sign in to continue your conversations." />
        </div>
    );
};

export default Login;
