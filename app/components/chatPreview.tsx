import { useState } from "react";
import { ChatSettings, Message } from "~/types/types";

interface ChatPreviewProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  settings: ChatSettings;
  isLoading?: boolean;
}

export const ChatPreview = ({ messages, onSendMessage, settings, isLoading }: ChatPreviewProps) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div
      className="relative border rounded-lg shadow-lg overflow-hidden"
      style={{
        width: `${settings.chatWidth}px`,
        height: `${settings.chatHeight}px`,
        background: settings.chatBackground,
        opacity: settings.chatOpacity,
        borderRadius: `${settings.chatBorderRadius}px`,
      }}
    >
      <div
        className="p-3 flex items-center"
        style={{ background: settings.brandColor, color: settings.headingColor }}
      >
        {settings.customLogo && (
          <img src={settings.customLogo} alt="Logo" className="w-8 h-8 mr-2 rounded-full" />
        )}
        <h3 className="text-lg font-semibold">Chatbot</h3>
      </div>
      <div
        className="p-4 overflow-y-auto"
        style={{ height: `${settings.chatHeight - 120}px` }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-3 rounded-lg ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}
            style={{
              background: msg.role === "user" ? settings.userBubbleColor : settings.aiBubbleColor,
              maxWidth: "80%",
            }}
          >
            <p>{msg.content}</p>
            <small className="text-xs text-gray-500 block mt-1">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </small>
          </div>
        ))}
        {isLoading && (
          <div className="mb-2 p-3 rounded-lg mr-auto flex items-center" style={{ background: settings.aiBubbleColor }}>
            <span className="loading loading-spinner mr-2"></span> Thinking...
          </div>
        )}
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2 mb-2 flex-wrap">
          {settings.quickReplies.map((reply, index) => (
            <button
              key={index}
              className="btn btn-sm btn-outline"
              onClick={() => onSendMessage(reply.text)}
              style={{ background: settings.brandColor, color: "#fff" }}
            >
              {reply.text}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="input input-bordered flex-1"
            placeholder="Type a message..."
          />
          <button onClick={handleSend} className="btn btn-primary">Send</button>
        </div>
      </div>
    </div>
  );
};