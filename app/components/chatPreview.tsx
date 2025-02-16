import React, { useState, useRef, useEffect } from "react";

interface ChatPreviewProps {
  settings: {
    chatWidth?: number;
    chatHeight?: number;
    chatBackground: string;
    chatOpacity: number;
    chatBorderRadius: number;
    brandColor: string;
    customLogo?: string;
    showEmailCapture: boolean;
    emailPlaceholder: string;
    quickReplies: Array<{ text: string; action: string }>;
    onEmailCapture: (value: string) => void;
  };
  messages: Array<{ content: string; isUser: boolean; timestamp?: number }>;
  onSendMessage: (message: string) => void;
}

export const ChatPreview: React.FC<ChatPreviewProps> = ({
  settings,
  messages,
  onSendMessage,
}) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div 
      className="relative rounded-lg overflow-hidden shadow-lg"
      style={{
        width: settings.chatWidth || 360,
        height: settings.chatHeight || 600,
        backgroundColor: settings.chatBackground,
        opacity: settings.chatOpacity,
        borderRadius: settings.chatBorderRadius,
      }}
    >
      {/* Header */}
      <div className="p-4 flex items-center space-x-2" style={{ backgroundColor: settings.brandColor }}>
        {settings.customLogo && (
          <img src={settings.customLogo} alt="Logo" className="h-8 w-8 object-contain" />
        )}
        <span className="text-white font-medium">Chat Preview</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`chat ${message.isUser ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-bubble">
              {message.content}
              {message.timestamp && (
                <div className="chat-time">{formatTimestamp(message.timestamp)}</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        {settings.showEmailCapture && (
          <div className="mb-4">
            <input
              type="email"
              placeholder={settings.emailPlaceholder}
              onChange={(e) => settings.onEmailCapture(e.target.value)}
              className="w-full px-4 py-2 rounded border"
            />
          </div>
        )}
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-4 py-2 rounded border"
            placeholder="Type your message..."
          />
          <button
            onClick={() => {
              onSendMessage(inputValue);
              setInputValue("");
            }}
            className="px-4 py-2 rounded text-white"
            style={{ backgroundColor: settings.brandColor }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Quick Replies */}
      {settings.quickReplies.length > 0 && (
        <div className="p-4 flex flex-wrap gap-2">
          {settings.quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => onSendMessage(reply.text)}
              className="px-4 py-2 rounded-full text-white text-sm"
              style={{ backgroundColor: settings.brandColor }}
            >
              {reply.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
