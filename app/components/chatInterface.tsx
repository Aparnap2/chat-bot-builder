import { useState } from 'react';

export const ChatInterface = ({ onSendMessage }: { onSendMessage: (message: string) => void }) => {
  const [messages, setMessages] = useState<Array<{ content: string; isBot: boolean }>>([]);
  const [input, setInput] = useState('');

  const staticResponses = {
    greeting: 'Hello! How can I help you?',
    farewell: 'Goodbye! Have a great day!',
    help: 'Here are some things I can help with: [options]',
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { content: input, isBot: false }]);
    const response = getBotResponse(input);
    setMessages(prev => [...prev, { content: response, isBot: true }]);
    onSendMessage(input); // Notify parent component
    setInput('');
  };

  const getBotResponse = (message: string) => {
    const lowerMsg = message.toLowerCase();
    return staticResponses[
      lowerMsg.includes('hello') ? 'greeting' :
      lowerMsg.includes('bye') ? 'farewell' : 'help'
    ] || 'I’m not sure how to respond to that.';
  };

  return (
    <div className="space-y-4 p-4">
      <div className="h-64 overflow-y-auto bg-gray-800 rounded-lg">
        {messages.map((msg, i) => (
          <div key={i} className={`chat ${msg.isBot ? 'chat-start' : 'chat-end'} p-2`}>
            <div className={`chat-bubble ${msg.isBot ? 'bg-neutral' : 'bg-primary'} text-white`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="join w-full">
        <input
          type="text"
          className="input input-bordered join-item flex-1 bg-gray-700 text-white"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend} className="btn btn-primary join-item">
          Send
        </button>
      </div>
    </div>
  );
};