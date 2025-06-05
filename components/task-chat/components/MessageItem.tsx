"use client"

import React, { useState } from "react"
import { Copy, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react"
import { cn } from "@/utils/cn"
import type { Message } from "@/lib/database"

interface MessageItemProps {
  message: Message
  onCopy: (text: string, messageId: number) => void
  onRate?: (messageId: number, rating: "up" | "down") => void
  onRetry?: (messageId: number) => void
}

const MessageItem = React.memo(({ message, onCopy, onRate, onRetry }: MessageItemProps) => {
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null)
  const [copiedMessage, setCopiedMessage] = useState<number | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopiedMessage(message.message_id)
      setTimeout(() => setCopiedMessage(null), 2000)
      onCopy(message.content, message.message_id)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end mb-2">
        <div className="bg-[#F0EEE6] rounded-2xl py-2 px-4 max-w-[80%]">
          <p className="text-gray-800">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative mb-8"
      onMouseEnter={() => setHoveredMessage(message.message_id)}
      onMouseLeave={() => setHoveredMessage(null)}
    >
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
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          <Copy size={14} className={cn(copiedMessage === message.message_id ? "text-green-500" : "text-gray-500")} />
        </button>
        <button
          className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={() => onRate?.(message.message_id, "up")}
          title="Thumbs up"
        >
          <ThumbsUp size={14} className="text-gray-500" />
        </button>
        <button
          className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={() => onRate?.(message.message_id, "down")}
          title="Thumbs down"
        >
          <ThumbsDown size={14} className="text-gray-500" />
        </button>
        <button
          className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={() => onRetry?.(message.message_id)}
          title="Retry"
        >
          <RefreshCw size={14} className="text-gray-500" />
        </button>
      </div>
    </div>
  )
})

MessageItem.displayName = "MessageItem"

export default MessageItem
