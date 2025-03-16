import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

// ✅ Fetch Backend URL from Environment Variables
const API_URL = process.env.REACT_APP_BACKEND_URL;
const WS_URL = process.env.REACT_APP_WEBSOCKET_URL;

// Utility function for exponential backoff with a cap (max 30s)
const getReconnectDelay = (attempt) => Math.min(30000, 1000 * 2 ** attempt);

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    socket: null, // WebSocket instance
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,

    // ✅ Fetch users from Django API
    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            console.log("📡 Fetching users from API...");
            const res = await axiosInstance.get(`${API_URL}/users/`);
            console.log("✅ Users fetched:", res.data);

            if (Array.isArray(res.data)) {
                set({ users: res.data });
            } else {
                throw new Error("Unexpected response format");
            }
        } catch (error) {
            console.error("❌ Error fetching users:", error);
            toast.error("Failed to fetch users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    // ✅ Fetch chat messages between logged-in user & selected user
    getMessages: async (userId) => {
        if (!userId) {
            console.warn("⚠️ No user ID provided for fetching messages.");
            return;
        }
        set({ isMessagesLoading: true });

        try {
            console.log(`📡 Fetching messages for user ${userId}...`);

            const accessToken = localStorage.getItem("access_token");
            if (!accessToken) {
                console.error("❌ No access token found. Cannot fetch messages.");
                toast.error("Unauthorized! Please log in again.");
                return;
            }

            const res = await axiosInstance.get(`${API_URL}/chat-history/${userId}/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            console.log("✅ API Response:", res.data);

            if (!Array.isArray(res.data)) {
                console.error("⚠️ Unexpected response format from API:", res.data);
                set({ messages: [] });
                return;
            }

            set({ messages: res.data });
        } catch (error) {
            console.error("❌ Error fetching messages:", error);
            toast.error("Failed to load chat history");
            set({ messages: [] });
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    // ✅ Setup WebSocket for real-time messaging
    setupWebSocket: () => {
        const { selectedUser, socket, reconnectAttempts, maxReconnectAttempts } = get();
        if (!selectedUser) return;

        // ✅ Prevent multiple WebSocket connections
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log("🔄 WebSocket is already connected. No need to reconnect.");
            return;
        }

        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            console.error("❌ No authentication token found. WebSocket connection failed.");
            return;
        }

        // ✅ Auto-switch WebSocket URL based on environment
        const wsUrl = `${WS_URL}/ws/chat/?token=${accessToken}&receiver_id=${selectedUser.id}`;
        console.log("🔹 Connecting to WebSocket:", wsUrl);

        const newSocket = new WebSocket(wsUrl);

        newSocket.onopen = () => {
            console.log("✅ WebSocket connected");
            set({ reconnectAttempts: 0, socket: newSocket });
        };

        newSocket.onmessage = (event) => {
            try {
                const newMessage = JSON.parse(event.data);
                console.log("📨 New message received:", newMessage);

                set((state) => {
                    // ✅ Prevent duplicate messages from being added to state
                    if (!state.messages.some((msg) => msg.id === newMessage.id)) {
                        return { messages: [...state.messages, newMessage] };
                    }
                    return state;
                });

            } catch (error) {
                console.error("❌ WebSocket JSON error:", error);
            }
        };

        newSocket.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
        };

        newSocket.onclose = (event) => {
            console.warn("❌ WebSocket disconnected. Attempting to reconnect...");
            set({ socket: null });

            const newAttempts = get().reconnectAttempts + 1;
            if (newAttempts > maxReconnectAttempts) {
                console.error("⛔ Max WebSocket reconnect attempts reached!");
                return;
            }
            set({ reconnectAttempts: newAttempts });
            const timeout = getReconnectDelay(newAttempts);
            setTimeout(() => get().setupWebSocket(), timeout);
        };
    },

    // ✅ Send a message via WebSocket (Backend handles storage)
    sendMessage: async (messageData) => {
        const { socket, selectedUser } = get();

        if (!socket || socket.readyState !== WebSocket.OPEN) {
            toast.error("WebSocket not connected");
            return;
        }

        if (!messageData.text.trim() && !messageData.image) {
            toast.error("Cannot send an empty message");
            return;
        }

        try {
            // ✅ Send message via WebSocket (Backend will broadcast)
            socket.send(JSON.stringify(messageData));

            // ❌ Do NOT manually add the message to `messages`
        } catch (error) {
            console.error("❌ Error sending message:", error);
            toast.error("Message failed to send");
        }
    },

    // ✅ Set selected user & establish WebSocket connection
    setSelectedUser: (selectedUser) => {
        if (!selectedUser || typeof selectedUser !== "object" || !selectedUser.id) {
            console.warn("⚠️ Invalid user selected:", selectedUser);
            return;
        }

        set({ selectedUser, messages: [] });

        get().getMessages(selectedUser.id);
        get().setupWebSocket();
    },

    // ✅ Close WebSocket on logout/unmount
    closeWebSocket: () => {
        const { socket } = get();
        if (socket) {
            console.warn("❌ Closing WebSocket connection...");
            socket.close();
            set({ socket: null });
        }
    },
}));
