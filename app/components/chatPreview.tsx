import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Message, ChatSettings } from "~/types/types"; // Import centralized types

interface ChatPreviewProps {
  messages: Message[]; // Use the Message type from types.ts
  onSendMessage: (message: string) => void;
  settings: ChatSettings;
  isLoading?: boolean;
}

export const ChatPreview = ({ messages, onSendMessage, settings, isLoading }: ChatPreviewProps) => {
  const [email, setEmail] = useState("");

  const handleSuggestionClick = (text: string) => {
    onSendMessage(text);
  };

  return (
    <div
      className="chat-preview relative"
      style={{
        width: `${settings.chatWidth}px`,
        height: `${settings.chatHeight}px`,
        background: settings.chatBackground,
        opacity: settings.chatOpacity,
        borderRadius: `${settings.chatBorderRadius}px`,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        className="header p-3 flex items-center"
        style={{
          background: settings.brandColor,
          color: settings.headingColor,
          borderRadius: `${settings.chatBorderRadius}px ${settings.chatBorderRadius}px 0 0`,
        }}
      >
        {settings.customLogo && (
          <img src={settings.customLogo} alt="Logo" className="w-8 h-8 mr-2 rounded-full" />
        )}
        <h3 className="text-lg font-semibold">Chatbot</h3>
      </div>

      <div className="messages p-4 overflow-y-auto" style={{ height: `${settings.chatHeight - 150}px` }}>
        {messages.map((msg) => (
          <div
            key={msg.id || msg.content}
            className={`message mb-2 p-3 rounded-lg ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}
            style={{
              background: msg.role === "user" ? settings.userBubbleColor : settings.aiBubbleColor,
              maxWidth: "80%",
              color: "#000000",
            }}
          >
            <p>{msg.content}</p>
            <small className="text-xs opacity-70 block mt-1">
              {(msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt)).toLocaleTimeString()}
            </small>
          </div>
        ))}
        {isLoading && (
          <div className="message mb-2 p-3 rounded-lg mr-auto" style={{ background: settings.aiBubbleColor }}>
            <span className="loading loading-spinner"></span>
          </div>
        )}
      </div>

      {settings.showEmailCapture && !email && (
        <div className="email-capture p-4">
          <input
            type="email"
            placeholder={settings.emailPlaceholder}
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      )}

      <div className="suggestions p-4 border-t">
        {settings.quickReplies.map((reply, index) => (
          <button
            key={index}
            className="btn btn-sm btn-outline mr-2 mb-2"
            onClick={() => handleSuggestionClick(reply.text)}
            style={{ background: settings.brandColor, color: "#ffffff", borderColor: settings.brandColor }}
          >
            {reply.text}
          </button>
        ))}
      </div>
    </div>
  );
};