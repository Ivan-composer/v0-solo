"use client"

import React, { useState, useRef, useCallback } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/utils/cn"
import { updateTaskStatus } from "@/lib/database"

// Import our custom hooks
import { useTaskData } from "./hooks/useTaskData"
import { useTaskMessages } from "./hooks/useTaskMessages"
import { useScrollManager } from "./hooks/useScrollManager"

// Import components
import TaskHeader from "./TaskHeader"
import TaskQueue from "./TaskQueue"
import SubtaskList from "./SubtaskList"
import MessageList from "./MessageList"
import QuickActions from "./QuickActions"
import MessageInput from "./MessageInput"
import NextTaskButton from "./NextTaskButton"
import ActiveSubtaskView from "./ActiveSubtaskView"

// Define a type for the onTaskActivity callback
type TaskActivityCallback = (taskId: string, taskName: string, activityText: string) => void

interface TaskChatProps {
  taskId?: string | null
  onSwitchTask?: (taskId: string) => void
  onTaskActivity?: TaskActivityCallback
}

const TaskChat = React.memo<TaskChatProps>(({ taskId, onSwitchTask, onTaskActivity }) => {
  // UI State
  const [expanded, setExpanded] = useState(false)
  const [activeSubtask, setActiveSubtask] = useState<string | null>(null)
  const [comment, setComment] = useState("")

  // Refs
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const taskHeaderRef = useRef<HTMLDivElement>(null)

  // Custom hooks
  const { currentTask, subtasks, taskQueue, taskProgress, currentTaskPosition, loading } = useTaskData(taskId)

  const effectiveTaskId = activeSubtask || taskId
  const { messages, isLoading, sendMessage } = useTaskMessages(effectiveTaskId, currentTask)

  const { isScrolledUp, scrollToBottom } = useScrollManager(contentRef, messagesEndRef, [messages])

  // Derived state
  const activeSubtaskData = React.useMemo(() => {
    return activeSubtask ? subtasks.find((s) => s.id === activeSubtask) || null : null
  }, [activeSubtask, subtasks])

  const taskHeaderHeight = React.useMemo(() => {
    return taskHeaderRef.current ? taskHeaderRef.current.offsetHeight + (expanded ? 200 : 0) : 0
  }, [expanded, loading])

  const hasSubtaskMessages = messages.length > 0 && activeSubtask !== null

  // Callbacks
  const handleToggleExpand = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  const handleCloseQueue = useCallback(() => {
    setExpanded(false)
  }, [])

  const handleSubtaskClick = useCallback(
    async (subtaskId: string) => {
      if (activeSubtask === subtaskId) {
        setActiveSubtask(null)
        if (contentRef.current) {
          contentRef.current.scrollTop = 0
        }
      } else {
        setActiveSubtask(subtaskId)
        if (contentRef.current) {
          contentRef.current.scrollTop = 0
        }
      }
    },
    [activeSubtask],
  )

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !currentTask) return

      setComment("")

      // Create activity text based on context
      let activityText = text
      if (activeSubtask && activeSubtaskData) {
        activityText = `Message in subtask "${activeSubtaskData.title}": ${text.substring(0, 50)}${text.length > 50 ? "..." : ""}`
      }

      // Send the message using our custom hook
      await sendMessage(text)

      // Notify parent about activity
      if (onTaskActivity && taskId) {
        onTaskActivity(taskId, currentTask.title, activityText)
      }
    },
    [currentTask, activeSubtask, activeSubtaskData, taskId, onTaskActivity, sendMessage],
  )

  const handleExecute = useCallback(
    async (withComment = false) => {
      if (!taskId) return

      if (withComment) {
        setComment("Execute, but don't forget this: ")
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus()
            const length = inputRef.current.value.length
            inputRef.current.setSelectionRange(length, length)
          }
        }, 0)
      } else {
        await handleSendMessage("Execute")
      }
    },
    [taskId, handleSendMessage],
  )

  const handleMarkAsDone = useCallback(
    async (subtaskId?: string) => {
      if (!taskId || !currentTask) return

      try {
        if (subtaskId) {
          const subtask = subtasks.find((s) => s.id === subtaskId)
          if (!subtask) return

          await updateTaskStatus(subtaskId, "completed")

          const activityText = `Subtask "${subtask.title}" marked as done`
          if (onTaskActivity) {
            onTaskActivity(taskId, currentTask.title, activityText)
          }
        } else {
          await updateTaskStatus(currentTask.id, "completed")

          const activityText = `Task "${currentTask.title}" marked as done`
          if (onTaskActivity) {
            onTaskActivity(taskId, currentTask.title, activityText)
          }

          // Move to next task
          const currentIndex = taskQueue.findIndex((t) => t.id === currentTask.id)
          if (currentIndex < taskQueue.length - 1 && onSwitchTask) {
            onSwitchTask(taskQueue[currentIndex + 1].id)
          }
        }
      } catch (error) {
        console.error("Error marking task as done:", error)
      }
    },
    [taskId, currentTask, subtasks, taskQueue, onTaskActivity, onSwitchTask],
  )

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom()
  }, [scrollToBottom])

  const handleSelectTask = useCallback(
    (id: number) => {
      if (onSwitchTask) {
        onSwitchTask(String(id))
      }
    },
    [onSwitchTask],
  )

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-background border-b border-gray-200 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-5 w-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-gray-300 animate-pulse" style={{ width: "30%" }}></div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto pb-48 pt-4">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse mb-6"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-2 border-t border-b border-gray-200 p-3">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse mr-3"></div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (!taskId || !currentTask) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <h2 className="text-xl font-semibold mb-4">Task Not Found</h2>
        <p className="text-gray-600 mb-6">
          The task you're looking for doesn't exist. Please check the task ID and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#FF6B6B] text-white rounded-md hover:bg-[#FF6B6B]/90 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Task Header */}
      <div ref={taskHeaderRef}>
        <TaskHeader
          task={currentTask}
          position={currentTaskPosition}
          progress={taskProgress}
          expanded={expanded}
          onToggleExpand={handleToggleExpand}
        />

        {/* Task Queue */}
        {expanded && (
          <TaskQueue
            tasks={taskQueue}
            activeTaskId={taskId}
            onSelectTask={handleSelectTask}
            onClose={handleCloseQueue}
          />
        )}
      </div>

      {/* Fixed Subtask Header */}
      {activeSubtaskData && (
        <div
          className="sticky top-0 left-0 right-0 z-30 p-3 flex justify-between items-center cursor-pointer border-b border-gray-200 bg-background shadow-md"
          onClick={() => handleSubtaskClick(activeSubtaskData.id)}
          style={{ top: `${taskHeaderHeight}px` }}
        >
          <div className="flex items-center">
            <div
              className={cn(
                "w-6 h-6 rounded-full mr-3 flex items-center justify-center",
                activeSubtaskData.status === "completed"
                  ? "bg-[#A7D8F0] text-blue-700 hover:bg-blue-100"
                  : "bg-[#A7D8F0] text-blue-700 border border-blue-300 hover:bg-blue-100",
              )}
            >
              {activeSubtaskData.status === "completed" && "✓"}
            </div>
            <span className={cn(activeSubtaskData.status === "completed" && "text-gray-500")}>
              {activeSubtaskData.title}
            </span>
          </div>
          <ChevronUp size={18} />
        </div>
      )}

      {/* Main Content Area */}
      <div ref={contentRef} className="flex-1 overflow-auto pb-48 pt-4 no-scrollbar">
        {activeSubtask === null ? (
          <>
            {/* Task Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">{currentTask.title}</h2>
              {currentTask.description && <p className="text-gray-700">{currentTask.description}</p>}
            </div>

            {/* Subtasks List */}
            <SubtaskList subtasks={subtasks} activeSubtask={activeSubtask} onSubtaskClick={handleSubtaskClick} />

            {/* Messages for the task */}
            <MessageList messages={messages} taskId={taskId} />

            {isLoading && (
              <div className="flex justify-center my-4">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Active Subtask View */}
            <ActiveSubtaskView
              subtask={activeSubtaskData}
              messages={messages}
              hasMessages={hasSubtaskMessages}
              onExecute={handleExecute}
              isLoading={isLoading}
            />
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {isScrolledUp && (
        <button
          onClick={handleScrollToBottom}
          className="absolute left-1/2 transform -translate-x-1/2 bottom-[180px] z-20 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors border border-gray-200"
          aria-label="Scroll to bottom"
        >
          <ChevronDown size={20} className="text-gray-600" />
        </button>
      )}

      {/* Bottom Actions Area */}
      <div className="absolute bottom-0 left-0 right-0 py-4 bg-background" style={{ zIndex: 10 }}>
        <QuickActions onMarkAsDone={() => handleMarkAsDone(activeSubtask || undefined)} />
        <MessageInput ref={inputRef} value={comment} onChange={setComment} onSend={handleSendMessage} />
        {currentTask && currentTask.status === "completed" && (
          <NextTaskButton currentTaskId={taskId} tasks={taskQueue} onSwitchTask={onSwitchTask} />
        )}
      </div>
    </div>
  )
})

TaskChat.displayName = "TaskChat"

export default TaskChat
