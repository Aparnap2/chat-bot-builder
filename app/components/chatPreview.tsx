// ChatPreview.tsx
import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface ChatPreviewProps {
  brandColor: string;
  chatBackground: string;
  chatOpacity: number;
  chatBorderRadius: number;
  customLogo: string | null;
}

const ChatPreview = ({
  brandColor,
  chatBackground,
  chatOpacity,
  chatBorderRadius,
  customLogo,
}: ChatPreviewProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");
  const [previewChat, setPreviewChat] = useState<
    Array<{ role: "user" | "bot"; content: string }>
  >([]);

  const handlePreviewSend = () => {
    if (!previewMessage.trim()) return;
    setPreviewChat([
      ...previewChat,
      { role: "user", content: previewMessage },
      {
        role: "bot",
        content: "This is a preview response. Your actual bot will use your configured responses and AI model.",
      },
    ]);
    setPreviewMessage("");
  };

  return (
    <div className="relative">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-4 right-4 rounded-full shadow-lg transform transition-transform hover:scale-105"
        style={{
          backgroundColor: brandColor,
          width: "56px",
          height: "56px",
        }}
      >
        <MessageCircle className="text-white w-6 h-6 m-auto" />
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div
          className="fixed top-0 right-0 w-[calc(100%-32px)] sm:w-[360px] h-[calc(100vh-32px)] bg-gray-900 rounded-t-lg shadow-lg overflow-hidden"
          style={{
            backgroundColor: chatBackground,
            opacity: chatOpacity / 100,
            borderRadius: `${chatBorderRadius}px`,
          }}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            {customLogo ? (
              <img src={customLogo} alt="Custom Logo" className="w-8 h-8 rounded-full" />
            ) : (
              <span className="text-white">AI Assistant</span>
            )}
            <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white">
              <X />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex flex-col space-y-4 p-4 overflow-y-auto h-[calc(100%-128px)]">
            {previewChat.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {message.role === "bot" && customLogo && (
                  <img src={customLogo} alt="Custom Logo" className="w-8 h-8 rounded-full" />
                )}
                <p
                  className={`px-4 py-2 rounded-lg ${
                    message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-700 text-white"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="flex items-center space-x-2 px-4 py-2 border-t border-gray-700">
            <input
              type="text"
              value={previewMessage}
              onChange={(e) => setPreviewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handlePreviewSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 text-white placeholder-gray-400 bg-black/30 border border-white/10 rounded-lg"
            />
            <button onClick={handlePreviewSend} className="px-4 py-2 rounded-lg bg-primary text-white">
              <Send />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPreview;