import { useState } from "react";
import { ChatPreview } from "./chatPreview";
import { ChatSettings, Message } from "~/types/types";

interface ChatTogglerProps {
  settings: ChatSettings;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatToggler = ({ settings, messages, onSendMessage, isLoading }: ChatTogglerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-circle btn-primary shadow-lg text-2xl"
      >
        {isOpen ? "×" : "💬"}
      </button>
      {isOpen && (
        <div className="mt-2">
          <ChatPreview
            settings={settings}
            messages={messages}
            onSendMessage={onSendMessage}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};