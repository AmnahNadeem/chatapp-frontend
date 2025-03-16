import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore"; // ✅ Extracts from Zustand

const Sidebar = () => {
    const { selectedUser, setSelectedUser, messages } = useChatStore(); // ✅ Include messages to update unread count dynamically
    const [users, setUsers] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({}); // ✅ Store unread message counts
    const [isUsersLoading, setIsUsersLoading] = useState(true);
    const navigate = useNavigate();

    // ✅ Get Backend URL from Environment Variables
    const API_URL = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/users/`, {  // ✅ Dynamic URL
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await response.json();
                if (response.ok) {
                    setUsers(data);
                    fetchUnreadCounts(data); // ✅ Fetch unread counts after users are loaded
                } else {
                    throw new Error("Failed to fetch users.");
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setIsUsersLoading(false);
            }
        };

        fetchUsers();
    }, [navigate, API_URL]); // ✅ Include API_URL as a dependency

    // ✅ Fetch unread messages for each user
    const fetchUnreadCounts = async (usersList) => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/unread-messages/`, { // ✅ Dynamic URL
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            if (response.ok) {
                const unreadMap = {};
                usersList.forEach((user) => {
                    unreadMap[user.id] = data[user.id] || 0; // ✅ Assign count or 0 if not found
                });
                setUnreadCounts(unreadMap);
            } else {
                throw new Error("Failed to fetch unread messages.");
            }
        } catch (error) {
            console.error("Error fetching unread messages:", error);
        }
    };

    // ✅ Function to mark messages as read
    const markMessagesAsRead = async (userId) => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        try {
            await fetch(`${API_URL}/mark-messages-read/${userId}/`, { // ✅ Dynamic URL
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            // ✅ Immediately update the unread count state
            setUnreadCounts((prevCounts) => ({
                ...prevCounts,
                [userId]: 0, // ✅ Set unread count to 0 immediately after reading messages
            }));
        } catch (error) {
            console.error("Error marking messages as read:", error);
        }
    };

    return (
        <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col">
            <div className="border-b p-5 flex justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-medium hidden lg:block">Contacts</span>
                </div>
            </div>

            {/* ✅ Show loading state */}
            {isUsersLoading ? (
                <div className="text-center py-4 text-gray-500">Loading users...</div>
            ) : users.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No users found</div>
            ) : (
                <div className="overflow-y-auto">
                    {users.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => {
                                setSelectedUser(user); // ✅ Update selected user
                                markMessagesAsRead(user.id); // ✅ Mark messages as read immediately
                            }}
                            className={`w-full p-3 flex items-center gap-3 relative ${selectedUser?.id === user.id ? "bg-primary text-white" : "hover:bg-base-300"
                                }`}
                        >
                            <img
                                src={user.profile_picture || "/avatar.png"}
                                alt={user.full_name}
                                className="size-12 rounded-full border-2"
                            />
                            <div className="hidden lg:block flex-grow">
                                <div className="font-medium">{user.full_name}</div>
                                <div className="text-sm text-gray-500">
                                    {user.is_online ? "Online" : "Offline"}
                                </div>
                            </div>

                            {/* ✅ Show Unread Message Badge */}
                            {unreadCounts[user.id] > 0 && (
                                <span className="absolute right-4 top-4 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {unreadCounts[user.id]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
