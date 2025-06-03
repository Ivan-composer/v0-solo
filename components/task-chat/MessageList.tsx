"use client"

import { useState, useEffect } from "react"
import { Copy, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react"
import { cn } from "@/utils/cn"
import type { Message } from "@/lib/database"

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null)
  const [copiedMessage, setCopiedMessage] = useState<number | null>(null)

  useEffect(() => {
    // Force clear messages on component mount
    if (messages.length > 0) {
      console.log("Rendering messages:", messages.length)
    }
  }, [messages])

  const copyToClipboard = async (text: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessage(messageId)
      setTimeout(() => setCopiedMessage(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  if (messages.length === 0) {
    return null
  }

  return (
    <div className="mt-6 space-y-4">
      {messages.map((message) => (
        <div key={message.message_id} className={message.user_id === "current-user" ? "mb-2" : "mb-4"}>
          {message.user_id === "current-user" ? (
            <div className="flex justify-end">
              <div className="bg-[#F0EEE6] rounded-md py-2 px-4 max-w-[80%]">
                <p className="text-gray-800">{message.content || ""}</p>
              </div>
            </div>
          ) : (
            <div
              className="relative mb-8"
              onMouseEnter={() => setHoveredMessage(message.message_id)}
              onMouseLeave={() => setHoveredMessage(null)}
            >
              {/* Removed the Grok label */}
              <div className="p-3 rounded-md">
                <p className="text-gray-800">{message.content || ""}</p>
              </div>

              {/* Interactive buttons */}
              <div
                className={cn(
                  "absolute right-0 bottom-0 transform translate-y-6 flex space-x-2 transition-opacity duration-200",
                  hoveredMessage === message.message_id ? "opacity-100" : "opacity-0",
                )}
              >
                <button
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={() => copyToClipboard(message.content, message.message_id)}
                  title="Copy to clipboard"
                >
                  <Copy
                    size={14}
                    className={cn(copiedMessage === message.message_id ? "text-green-500" : "text-gray-500")}
                  />
                </button>
                <button
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Thumbs up"
                >
                  <ThumbsUp size={14} className="text-gray-500" />
                </button>
                <button
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Thumbs down"
                >
                  <ThumbsDown size={14} className="text-gray-500" />
                </button>
                <button className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" title="Retry">
                  <RefreshCw size={14} className="text-gray-500" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
