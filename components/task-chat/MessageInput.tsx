"use client"

import type React from "react"

import { forwardRef } from "react"
import { Send } from "lucide-react"

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (message: string) => void
}

const MessageInput = forwardRef<HTMLInputElement, MessageInputProps>(({ value, onChange, onSend }, ref) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSend(value)
      onChange("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) {
        onSend(value)
        onChange("")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex mt-3">
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 border border-border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-background text-foreground"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-r-md hover:bg-primary/90 transition-colors"
      >
        <Send size={18} />
      </button>
    </form>
  )
})

MessageInput.displayName = "MessageInput"

export default MessageInput
