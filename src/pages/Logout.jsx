import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // ✅ Add toast for feedback

const Logout = () => {
    const navigate = useNavigate();

    // ✅ Get Backend URL from Environment Variables
    const API_URL = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const logoutUser = async () => {
            try {
                const refreshToken = localStorage.getItem("refresh_token");

                if (!refreshToken) {
                    navigate("/login");
                    return;
                }

                const response = await fetch(`${API_URL}/logout/`, { // ✅ Dynamic URL
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                    },
                    body: JSON.stringify({ refresh: refreshToken }),
                });

                if (!response.ok) {
                    throw new Error("Logout failed. Please try again.");
                }

                toast.success("Logged out successfully!");
            } catch (error) {
                toast.error(error.message);
            } finally {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                navigate("/login");
            }
        };

        logoutUser();
    }, [navigate, API_URL]); // ✅ Include API_URL as a dependency

    return <h2>Logging out...</h2>;
};

export default Logout;
