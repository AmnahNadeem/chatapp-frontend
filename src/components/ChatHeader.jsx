import { ArrowLeft } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChatStore();

    return (
        <div className="p-4 border-b flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSelectedUser(null)}>
                <ArrowLeft className="w-5 h-5 text-primary" />
            </button>
            <img
                src={selectedUser?.profile_picture || "/avatar.png"}
                alt="Profile"
                className="w-10 h-10 rounded-full border"
            />
            <div>
                <div className="font-medium">{selectedUser?.full_name}</div>
                <div className="text-xs text-gray-500">
                    {selectedUser?.is_online ? "Online" : "Offline"}
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;
