import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
    const {
        messages = [],
        getMessages,
        isMessagesLoading,
        selectedUser,
        setupWebSocket,
        closeWebSocket,
    } = useChatStore();

    const [authUser, setAuthUser] = useState(null);
    const messageEndRef = useRef(null);

    // ✅ Get Backend URL from Environment Variables
    const API_URL = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchAuthUser = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) return;

                const response = await fetch(`${API_URL}/user/`, {  // ✅ Dynamic URL
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.status === 401) {
                    console.error("❌ Unauthorized - Please log in again.");
                    return;
                }

                const userData = await response.json();
                if (response.ok) {
                    setAuthUser(userData);
                    console.log("✅ Authenticated User:", userData);
                }
            } catch (error) {
                console.error("❌ Error fetching authenticated user:", error);
            }
        };

        fetchAuthUser();
    }, [API_URL]); // ✅ Include API_URL as a dependency

    useEffect(() => {
        if (!selectedUser) return;
        getMessages(selectedUser.id);
        setupWebSocket(selectedUser.id);

        return () => closeWebSocket();
    }, [selectedUser, getMessages, setupWebSocket, closeWebSocket]);

    useEffect(() => {
        if (messageEndRef.current && messages.length > 0) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (!selectedUser) {
        return <div className="p-4 text-center text-gray-500">Select a user to start chatting</div>;
    }

    if (isMessagesLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-auto">
                <ChatHeader />
                <MessageSkeleton />
                <MessageInput />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader />
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                    if (!message || typeof message !== "object") {
                        console.error("❌ Invalid message format:", message);
                        return null;
                    }

                    if (!authUser) return null;

                    const isSentByAuthUser = message.sender_id === authUser?.id;
                    const senderProfilePic = isSentByAuthUser
                        ? authUser?.profile_picture
                        : message.sender_profile_picture || selectedUser?.profile_picture;

                    return (
                        <div
                            key={message.id}
                            className={`chat ${isSentByAuthUser ? "chat-end" : "chat-start"}`}
                            ref={messageEndRef}
                        >
                            <div className="chat-image avatar">
                                <div className="size-10 rounded-full border">
                                    <img src={senderProfilePic} alt="profile pic" className="w-full h-full rounded-full" />
                                </div>
                            </div>

                            <div className="chat-header mb-1">
                                <time className="text-xs opacity-50 ml-1">
                                    {formatMessageTime(message.timestamp)}
                                </time>
                            </div>

                            {/* ✅ DaisyUI Theme-Based Chat Bubble Colors */}
                            <div
                                className={`chat-bubble flex flex-col 
                                    ${isSentByAuthUser ? "bg-primary text-primary-content text-right" : "bg-secondary text-secondary-content text-left"}`}
                            >
                                {message.image && (
                                    <img src={message.image} alt="Attachment" className="sm:max-w-[200px] rounded-md mb-2" />
                                )}
                                {message.text && <p>{message.text}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
            <MessageInput />
        </div>
    );
};

export default ChatContainer;
