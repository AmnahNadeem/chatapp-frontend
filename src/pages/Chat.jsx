import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore"; // ✅ Import the auth store
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const Chat = () => {
    const { selectedUser, setupWebSocket, closeWebSocket } = useChatStore();
    const { isAuthenticated, isCheckingAuth } = useAuthStore(); // ✅ Extract auth state
    const navigate = useNavigate();

    // ✅ Redirect to login if not authenticated (after auth check completes)
    useEffect(() => {
        if (!isCheckingAuth && !isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, isCheckingAuth, navigate]);

    // ✅ Setup WebSocket when a user is selected
    useEffect(() => {
        if (selectedUser) {
            setupWebSocket();
        }
        return () => closeWebSocket(); // ✅ Cleanup WebSocket on unmount
    }, [selectedUser]);

    return (
        <div className="h-screen bg-base-200">
            <div className="flex items-center justify-center pt-20 px-4">
                <div className="bg-base-100 rounded-lg shadow-lg w-full max-w-6xl h-[calc(100vh-8rem)]">
                    <div className="flex h-full rounded-lg overflow-hidden">
                        <Sidebar />
                        {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
