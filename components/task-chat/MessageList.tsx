"use client"

import { useState } from "react"
import { Copy, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react"
import { cn } from "@/utils/cn"
import type { Message } from "@/lib/database"

interface MessageListProps {
  messages: Message[]
  taskId?: number | null
}

export default function MessageList({ messages, taskId }: MessageListProps) {
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null)
  const [copiedMessage, setCopiedMessage] = useState<number | null>(null)

  const copyToClipboard = async (text: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessage(messageId)
      setTimeout(() => setCopiedMessage(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  // Filter messages to only show those for the current task
  const filteredMessages = messages.filter((message) => {
    if (!taskId) return false
    return message.task_id === taskId
  })

  if (filteredMessages.length === 0) {
    return null
  }

  return (
    <div className="mt-6 space-y-4">
      {filteredMessages.map((message) => (
        <div key={message.message_id} className={message.role === "user" ? "mb-2" : "mb-4"}>
          {message.role === "user" ? (
            <div className="flex justify-end">
              <div className="bg-[#F0EEE6] rounded-2xl py-2 px-4 max-w-[80%]">
                <p className="text-gray-800">{message.content}</p>
              </div>
            </div>
          ) : (
            <div
              className="relative mb-8"
              onMouseEnter={() => setHoveredMessage(message.message_id)}
              onMouseLeave={() => setHoveredMessage(null)}
            >
              {/* Removed the Grok label */}
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-gray-800">{message.content}</p>
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
