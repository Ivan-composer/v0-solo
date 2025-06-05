"use client"

import { useMemo } from "react"
import { memo } from "react"
import MessageItem from "./MessageItem"
import type { Message } from "@/lib/database"

interface MessageListProps {
  messages: Message[]
  taskId?: number | null
}

const MessageList = memo(function MessageList({ messages, taskId }: MessageListProps) {
  const filteredMessages = useMemo(() => {
    if (!taskId) return []
    return messages.filter((message) => message.task_id === taskId)
  }, [messages, taskId])

  if (filteredMessages.length === 0) {
    return null
  }

  return (
    <div className="mt-6 space-y-4">
      {filteredMessages.map((message) => (
        <MessageItem key={message.message_id} message={message} />
      ))}
    </div>
  )
})

export default MessageList
