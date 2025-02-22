// components/ChatInterface.tsx
import { useState } from 'react'

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Array<{content: string, isBot: boolean}>>([])
  const [input, setInput] = useState('')

  const staticResponses = {
    greeting: 'Hello! How can I help you?',
    farewell: 'Goodbye! Have a great day!',
    help: 'Here are some things I can help with: [options]'
  }

  const handleSend = () => {
    if (!input.trim()) return
    
    // Add user message
    setMessages(prev => [...prev, {content: input, isBot: false}])
    
    // Add bot response
    const response = getBotResponse(input)
    setMessages(prev => [...prev, {content: response, isBot: true}])
    
    setInput('')
  }

  const getBotResponse = (message: string) => {
    const lowerMsg = message.toLowerCase()
    return staticResponses[
      lowerMsg.includes('hello') ? 'greeting' :
      lowerMsg.includes('bye') ? 'farewell' : 'help'
    ]
  }

  return (
    <div className="space-y-4">
      <div className="h-64 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`chat ${msg.isBot ? 'chat-start' : 'chat-end'}`}>
            <div className={`chat-bubble ${msg.isBot ? 'bg-neutral' : 'bg-primary'}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className="join w-full">
        <input
          type="text"
          className="input input-bordered join-item flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="btn btn-primary join-item">
          Send
        </button>
      </div>
    </div>
  )
}