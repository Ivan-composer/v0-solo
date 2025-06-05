"use client"

import React from "react"
import type { Task, Message } from "@/lib/database"
import MessageList from "../MessageList"

interface ActiveSubtaskViewProps {
  subtask: Task
  messages: Message[]
  hasMessages: boolean
  onExecute: (withComment: boolean) => void
  isLoading: boolean
}

const ActiveSubtaskView = React.memo(
  ({ subtask, messages, hasMessages, onExecute, isLoading }: ActiveSubtaskViewProps) => {
    return (
      <>
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
