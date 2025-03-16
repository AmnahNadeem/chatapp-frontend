import { useState, useEffect } from "react";
import { Camera, Mail, User } from "lucide-react";
import toast from "react-hot-toast"; // ✅ Add toast for feedback
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [authUser, setAuthUser] = useState(null);
    const [selectedImg, setSelectedImg] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const navigate = useNavigate();

    // ✅ Get Backend URL from Environment Variables
    const API_URL = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                toast.error("You are not authenticated.");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/user/`, { // ✅ Dynamic URL
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await response.json();
                if (response.ok) {
                    setAuthUser(data);
                    setSelectedImg(data.profile_picture || "/avatar.png");
                } else {
                    toast.error("Failed to load profile.");
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Something went wrong while fetching your profile.");
            }
        };

        fetchProfile();
    }, [API_URL]); // ✅ Include API_URL as a dependency

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return; // ✅ Prevent breaking the UI when no file is selected

        const formData = new FormData();
        formData.append("profile_picture", file);

        const token = localStorage.getItem("access_token");

        setIsUpdating(true);
        try {
            const response = await fetch(`${API_URL}/update-profile-picture/`, { // ✅ Dynamic URL
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }, // ✅ No Content-Type needed for FormData
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setSelectedImg(data.profile_picture_url);
                toast.success("Profile picture updated successfully!");
            } else {
                toast.error(data.error || "Failed to update profile picture.");
            }
        } catch (error) {
            console.error("Error updating profile picture:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="h-screen flex justify-center items-center bg-base-200 p-4">
            <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
                {/* Title */}
                <h1 className="text-2xl font-semibold text-center mb-4">Your Profile</h1>

                {/* Profile Picture Section */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-32 h-32">
                        <img
                            src={selectedImg || "/avatar.png"}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-md"
                        />
                        <label
                            htmlFor="avatar-upload"
                            className="absolute bottom-2 right-2 bg-primary p-2 rounded-full cursor-pointer shadow-md hover:scale-105 transition-all"
                        >
                            <Camera className="w-5 h-5 text-white" />
                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={isUpdating}
                            />
                        </label>
                    </div>
                    <p className="text-sm text-gray-500">
                        {isUpdating ? "Updating profile picture..." : "Click the camera icon to update"}
                    </p>
                </div>

                {/* User Information */}
                <div className="mt-6 space-y-4">
                    <div className="p-4 bg-gray-100 rounded-lg flex items-center gap-3 border">
                        <User className="w-5 h-5 text-primary" />
                        <span className="text-lg font-medium">{authUser?.full_name || "User"}</span>
                    </div>

                    <div className="p-4 bg-gray-100 rounded-lg flex items-center gap-3 border">
                        <Mail className="w-5 h-5 text-primary" />
                        <span className="text-lg font-medium">{authUser?.email || "Not Available"}</span>
                    </div>
                    {/* Back to Chat Button */}
                    <div className="text-center mt-6">
                        <button className="btn btn-primary" onClick={() => navigate("/chat")}>
                            Back to Chat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
