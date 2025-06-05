"use client"

import React from "react"
import { ChevronUp } from "lucide-react"
import { cn } from "@/utils/cn"
import type { Task, Message } from "@/lib/database"
import MessageList from "../MessageList"

interface ActiveSubtaskViewProps {
  subtask: Task
  messages: Message[]
  hasMessages: boolean
  onSubtaskClick: (subtaskId: string) => void
  onExecute: (withComment: boolean) => void
  isLoading: boolean
}

const ActiveSubtaskView = React.memo(
  ({ subtask, messages, hasMessages, onSubtaskClick, onExecute, isLoading }: ActiveSubtaskViewProps) => {
    return (
      <>
        {/* Fixed Subtask Header */}
        <div
          className="sticky top-0 left-0 right-0 z-30 p-3 flex justify-between items-center cursor-pointer border-b border-gray-200 bg-background shadow-md"
          onClick={() => onSubtaskClick(subtask.id)}
        >
          <div className="flex items-center">
            <div
              className={cn(
                "w-6 h-6 rounded-full mr-3 flex items-center justify-center",
                subtask.status === "completed"
                  ? "bg-[#A7D8F0] text-blue-700 hover:bg-blue-100"
                  : "bg-[#A7D8F0] text-blue-700 border border-blue-300 hover:bg-blue-100",
              )}
            >
              {subtask.status === "completed" && "✓"}
            </div>
            <span className={cn(subtask.status === "completed" && "text-gray-500")}>{subtask.title}</span>
          </div>
          <ChevronUp size={18} />
        </div>

        {/* Subtask Content */}
        <div className="overflow-hidden rounded-lg">
          <div className="p-4">
            <div className="mb-4 text-gray-700">
              <h3 className="font-semibold mb-2">{subtask.title}</h3>
              {subtask.description && <p>{subtask.description}</p>}
            </div>

            {/* Show execute buttons only if no messages */}
            {!hasMessages && (
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  onClick={() => onExecute(false)}
                >
                  Execute
                </button>
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  onClick={() => onExecute(true)}
                >
                  Execute with comment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Show messages if they exist */}
        {hasMessages && <MessageList messages={messages} taskId={subtask.id} />}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center my-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}
      </>
    )
  },
)

ActiveSubtaskView.displayName = "ActiveSubtaskView"

export default ActiveSubtaskView
