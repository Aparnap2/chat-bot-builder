import { useState } from "react";
import { ChatPreview } from "./chatPreview";
import { ChatSettings } from "~/types/types"; // Import ChatSettings type

export const ChatToggler = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Define settings with all required ChatSettings properties
  const defaultSettings: ChatSettings = {
    chatbotId: "default-chatbot-id", // Add a placeholder chatbotId
    chatWidth: 400, // Provide a default instead of undefined
    chatHeight: 600, // Provide a default instead of undefined
    chatBackground: "#ffffff",
    chatOpacity: 1,
    chatBorderRadius: 8,
    brandColor: "#2563eb",
    customLogo: null, // Use null instead of undefined
    showEmailCapture: false,
    emailPlaceholder: "Enter your email",
    quickReplies: [],
    userBubbleColor: "#e0e0e0",
    aiBubbleColor: "#2563eb",
    headingColor: "#000000",
  };

  const handleSendMessage = (message: string) => {
    console.log("Message sent:", message); // Replace throw with a log for now
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-circle btn-primary shadow-lg"
      >
        {isOpen ? "×" : "💬"}
      </button>

      <div className={`${isOpen ? "block" : "hidden"} chat-window`}>
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <ChatPreview
              settings={defaultSettings}
              messages={[]}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};