import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Paperclip, Send } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
    const { sendMessage, selectedUser } = useChatStore();
    const [message, setMessage] = useState("");
    const [image, setImage] = useState(null);

    const handleSendMessage = async () => {
        if (!message.trim() && !image) {
            toast.error("Message cannot be empty");
            return;
        }

        const messageData = {
            text: message.trim(),
            image: image, // ✅ Send the actual file, not the preview URL
        };

        sendMessage(messageData);

        setMessage("");
        setImage(null);
    };
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
    };

    return (
        <div className="p-4 border-t flex gap-3 items-center">
            <label className="cursor-pointer">
                <Paperclip className="w-6 h-6 text-primary" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>

            {image && (
                <div className="w-12 h-12 border rounded-md overflow-hidden">
                    <img src={URL.createObjectURL(image)} alt="Preview" className="object-cover w-full h-full" />
                </div>
            )}

            <input
                type="text"
                className="flex-1 input input-bordered"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />

            <button className="btn btn-primary" onClick={handleSendMessage}>
                <Send className="w-5 h-5" />
            </button>
        </div>
    );
};

export default MessageInput;
