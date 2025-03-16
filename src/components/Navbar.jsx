import { Link, useNavigate } from "react-router-dom";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast"; // ✅ Add toast notifications

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
    const [authUser, setAuthUser] = useState(null);
    const navigate = useNavigate();

    // ✅ Get Backend URL from Environment Variables
    const API_URL = process.env.REACT_APP_BACKEND_URL;

    // Fetch user data when authentication state changes
    useEffect(() => {
        if (!isAuthenticated || authUser) return; // ✅ Prevent unnecessary API calls

        const fetchUser = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setAuthUser(null);
                setIsAuthenticated(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/user/`, { // ✅ Dynamic URL
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    setAuthUser(data);
                } else {
                    throw new Error("Session expired. Please log in again.");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                toast.error(error.message);
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                setAuthUser(null);
                setIsAuthenticated(false);
            }
        };

        fetchUser();
    }, [isAuthenticated, authUser, API_URL]); // ✅ Include API_URL as a dependency

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setAuthUser(null);
        setIsAuthenticated(false);
        toast.success("Logged out successfully!");
        navigate("/"); // Redirect to home page after logout
    };

    return (
        <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
            <div className="container mx-auto px-4 h-16">
                <div className="flex items-center justify-between h-full">
                    <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
                        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="text-lg font-bold">Chatty</h1>
                    </Link>

                    <div className="flex items-center gap-2">
                        {isAuthenticated && authUser ? (
                            <>
                                <Link to="/settings" className="btn btn-sm gap-2">
                                    <Settings className="w-4 h-4" />
                                    <span className="hidden sm:inline">Settings</span>
                                </Link>
                                <Link to="/profile" className="btn btn-sm gap-2">
                                    <User className="size-5" />
                                    <span className="hidden sm:inline">{authUser.full_name}</span>
                                </Link>

                                <button className="btn btn-sm gap-2" onClick={handleLogout}>
                                    <LogOut className="size-5" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-sm">Login</Link>
                                <Link to="/signup" className="btn btn-sm btn-primary">Signup</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
