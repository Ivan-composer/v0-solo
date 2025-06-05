"use client"

import type React from "react"

import { forwardRef, memo } from "react"
import { Send } from "lucide-react"

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (message: string) => void
}

const MessageInput = memo(
  forwardRef<HTMLInputElement, MessageInputProps>(function MessageInput({ value, onChange, onSend }, ref) {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (value.trim()) {
        onSend(value.trim())
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(e)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg bg-white">
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 outline-none text-gray-700"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    )
  }),
)

export default MessageInput
