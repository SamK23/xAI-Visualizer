"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send, Bot, User, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  datasetData: any
  currentVisualization: string
}

// Global chat history that persists across visualization switches
// We need a way to clear it externally.
let globalChatHistory: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hello! I'm your AI assistant for XAI visualizations. I can help you understand your data and the different visualization types. Feel free to ask me anything about feature importance, model interpretability, or how to read these charts!",
    timestamp: new Date(),
  },
]

// Callback function to update the internal messages state from outside
let setMessagesCallback: ((messages: Message[]) => void) | null = null

export function clearChatHistory() {
  globalChatHistory = [
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI assistant for XAI visualizations. I can help you understand your data and the different visualization types. Feel free to ask me anything about feature importance, model interpretability, or how to read these charts!",
      timestamp: new Date(),
    },
  ]
  if (setMessagesCallback) {
    setMessagesCallback(globalChatHistory)
  }
}

export function AIAssistant({ isOpen, onClose, datasetData, currentVisualization }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>(globalChatHistory)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Register the callback when component mounts
    setMessagesCallback = setMessages
    // Clean up callback when component unmounts
    return () => {
      setMessagesCallback = null
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Update global chat history when messages change internally
  useEffect(() => {
    globalChatHistory = messages
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    globalChatHistory = newMessages // Keep global history updated immediately
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputValue,
          datasetData,
          currentVisualization,
          conversationHistory: messages.slice(-10), // Send last 10 messages for context
        }),
      });

      console.log("[AI Assistant] Sent data to /api/chat:", {
        message: inputValue,
        datasetData: {
          metadata: datasetData?.metadata, // Log only metadata to avoid large console output
          featuresCount: datasetData?.features?.length,
        },
        currentVisualization,
        conversationHistoryLength: messages.slice(-10).length,
      });

      if (!response.ok) {
        const errorBody = await response.json();
        console.error("[AI Assistant] API response not OK:", response.status, errorBody);
        throw new Error(errorBody.error || "Failed to get response from AI assistant");
      }

      const data = await response.json();
      console.log("[AI Assistant] Received response from /api/chat (first 100 chars):", data.response.substring(0, 100) + "...");

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      globalChatHistory = updatedMessages; // Keep global history updated immediately
    } catch (error: any) {
      console.error("[AI Assistant] Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response from AI assistant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const MarkdownMessage = ({ content }: { content: string }) => (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="text-sm">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
        pre: ({ children }) => (
          <pre className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto mb-2">{children}</pre>
        ),
        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-gray-300 pl-3 italic mb-2">{children}</blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-full w-96 backdrop-blur-md bg-white/90 border-l border-white/20 z-50 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-xs text-gray-600">
                Dataset: {datasetData?.metadata?.name || "Current Data"} • {currentVisualization.replace("-", " ")}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  : "bg-gray-50 text-gray-900 border border-gray-200"
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.role === "assistant" && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />}
                {message.role === "user" && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  {message.role === "assistant" ? (
                    <div className="text-sm">
                      <MarkdownMessage content={message.content} />
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                  <p className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center space-x-2">
              <Bot className="w-4 h-4 text-blue-600" />
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-white/20 p-4">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the data or visualizations..."
            className="flex-1 bg-white/50 border-white/30 focus:bg-white/70"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Ask about feature importance, visualization types, or data interpretation
        </p>
      </div>
    </div>
  )
}
