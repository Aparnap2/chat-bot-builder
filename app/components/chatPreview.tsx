"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatSettings, QuickReply } from "@/types/types"
import { Send, X, MessageSquare } from 'lucide-react'

interface ChatbotPreviewProps {
  settings: ChatSettings
}

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export function ChatbotPreview({ settings }: ChatbotPreviewProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `Hi there! I'm ${settings.chatbotName}. How can I help you today?` 
    }
  ])
  const [input, setInput] = useState('')
  const [email, setEmail] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = useCallback(() => {
    if (!input.trim()) return
    
    setMessages(prev => [...prev, { role: 'user', content: input }])
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Thanks for your message! This is a preview of how your chatbot will respond.` 
      }])
    }, 1000)
    
    setInput('')
  }, [input])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleEmailSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (email) setEmailSubmitted(true)
  }, [email])

  const handleQuickReply = useCallback((reply: QuickReply) => {
    setMessages(prev => [...prev, { role: 'user', content: reply.text }])
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `You selected: ${reply.text}. This is a preview response.` 
      }])
    }, 1000)
  }, [])

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        style={{ backgroundColor: settings.brandColor }}
        className="fixed bottom-4 right-4 rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div 
      style={{
        maxWidth: '100%',
        width: `${settings.chatWidth}px`,
        height: `${settings.chatHeight}px`,
        maxHeight: '90vh',
        backgroundColor: settings.chatBackground,
        borderRadius: `${settings.chatBorderRadius}px`,
        opacity: settings.chatOpacity,
      }}
      className="flex flex-col border border-gray-200 shadow-xl overflow-hidden w-full h-full"
    >
      {/* Header */}
      <header 
        style={{ backgroundColor: settings.brandColor }}
        className="flex items-center justify-between p-4 text-white"
      >
        <div className="flex items-center gap-2">
          {settings.customLogo && (
            <img 
              src={settings.customLogo} 
              alt="Chatbot logo" 
              className="w-8 h-8 rounded object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}
          <h2 style={{ color: settings.headingColor }} className="font-medium truncate">
            {settings.chatbotName}
          </h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/10"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </Button>
      </header>
      
      {/* Messages */}
      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <div 
            key={`message-${index}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              style={{ 
                backgroundColor: message.role === 'user' 
                  ? settings.userBubbleColor 
                  : settings.aiBubbleColor,
                color: message.role === 'user' ? '#000000' : '#ffffff'
              }}
              className={`rounded-lg px-4 py-2 max-w-[80%] break-words ${
                message.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>
      
      {/* Quick Replies */}
      {settings.quickReplies.length > 0 && (
        <section className="px-4 py-2 flex flex-wrap gap-2 border-t border-gray-200">
          {settings.quickReplies.map((reply) => (
            <Button 
              key={reply.action}
              variant="outline"
              size="sm"
              onClick={() => handleQuickReply(reply)}
              className="text-sm truncate"
              aria-label={`Quick reply: ${reply.text}`}
            >
              {reply.text}
            </Button>
          ))}
        </section>
      )}
      
      {/* Email Capture */}
      {settings.showEmailCapture && !emailSubmitted && (
        <form 
          onSubmit={handleEmailSubmit}
          className="px-4 py-2 border-t border-gray-200"
        >
          <div className="flex gap-2">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              type="email"
              required
              aria-label="Enter your email address"
              className="flex-1"
            />
            <Button 
              type="submit"
              style={{ backgroundColor: settings.brandColor }}
              className="text-white hover:opacity-90"
              aria-label="Submit email"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}
      
      {/* Input Area */}
      {!settings.showEmailCapture && (
        <div className="px-4 py-2 border-t border-gray-200">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={handleKeyDown}
              aria-label="Type your message"
              className="flex-1"
            />
            <Button 
              onClick={handleSend}
              style={{ backgroundColor: settings.brandColor }}
              className="text-white hover:opacity-90"
              aria-label="Send message"
              disabled={!input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
