"use client"

import type React from "react"

import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from "react"
import {
  Send,
  FileText,
  CheckSquare,
  AlertCircle,
  Info,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  CheckCircle,
  MessageSquare,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/utils/cn"
import {
  getMasterChatMessages,
  createMessage,
  getTaskById,
  getSubtasks,
  type Message,
  type Task,
  getMessagesForTask,
} from "@/lib/database"
import { generateGrokResponse } from "@/lib/grok"

// Add these keyframes for animations
const fadeSlideInKeyframes = `
  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

// First, let's modify the task activity session type to include subtask information
type TaskActivitySession = {
  taskId: number
  taskName: string
  lastUpdated: Date
  commitCount: number
  lastCommitText: string
  commits: Array<{
    text: string
    timestamp: Date
  }>
  expanded: boolean
  commitsExpanded: boolean
  // Add these fields for tracking subtask completion
  subtaskCount: number
  completedSubtasks: number
  status: "done" | "in_progress" | "planned"
}

// Define the ref type for MasterChat
export type MasterChatRef = {
  addTaskActivity: (taskId: number, taskName: string, commitText: string) => void
}

// Make sure to add this prop to the component definition:
const MasterChat = forwardRef<
  MasterChatRef,
  {
    // When provided, this callback will be called when the user clicks "Open in Task Chat"
    // It should switch to the task chat view and load the specified task
    onSwitchTask?: (taskId: number) => void
  }
>((props, ref) => {
  // ... existing code
  const { onSwitchTask } = props
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null)
  const [copiedMessage, setCopiedMessage] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Add a ref for the message container to enable auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // State for task activity sessions
  const [taskSessions, setTaskSessions] = useState<TaskActivitySession[]>([])
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [currentSubtasks, setCurrentSubtasks] = useState<Task[]>([])

  const [taskMessage, setTaskMessage] = useState("")
  const [taskMessages, setTaskMessages] = useState<Message[]>([])
  const [activeSubtaskId, setActiveSubtaskId] = useState<number | null>(null)
  // Add a ref for the task messages container
  const taskMessagesEndRef = useRef<HTMLDivElement>(null)

  // Add a loading state
  const [isLoading, setIsLoading] = useState(false)

  // Function to scroll to the bottom of the main chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Function to scroll to the bottom of the task chat
  const scrollToBottomTaskChat = () => {
    taskMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Scroll to bottom when task messages change
  useEffect(() => {
    scrollToBottomTaskChat()
  }, [taskMessages])

  // Now, let's update the addTaskActivity function to include subtask information
  // Find the addTaskActivity function (around line 100-150) and replace it with:

  const addTaskActivity = useCallback(
    (taskId: number, taskName: string, commitText: string) => {
      console.log("Adding task activity:", taskId, taskName, commitText) // Debug log
      const now = new Date()

      // Get subtask information for this task
      const getTaskInfo = async () => {
        try {
          // Get the task
          const task = await getTaskById(taskId)
          if (!task) return null

          // Get subtasks
          const subtasksData = await getSubtasks(taskId)
          const completedSubtasks = subtasksData.filter((s) => s.status === "done").length
          const subtaskCount = subtasksData.length

          return {
            task,
            completedSubtasks,
            subtaskCount,
          }
        } catch (error) {
          console.error("Error getting task info:", error)
          return null
        }
      }

      getTaskInfo().then((taskInfo) => {
        if (!taskInfo) return

        // Check if we have an existing session for this task
        const existingSessionIndex = taskSessions.findIndex((s) => s.taskId === taskId)

        if (existingSessionIndex !== -1) {
          // Update existing session
          const updatedSessions = [...taskSessions]
          const session = updatedSessions[existingSessionIndex]

          // Update the session
          session.lastUpdated = now
          session.commitCount += 1
          session.lastCommitText = commitText
          session.commits.push({
            text: commitText,
            timestamp: now,
          })

          // Update subtask information
          session.completedSubtasks = taskInfo.completedSubtasks
          session.subtaskCount = taskInfo.subtaskCount
          session.status = taskInfo.task.status

          // If the task is not done, move it to the top (most recent)
          // If it's done, leave it in its current position
          if (taskInfo.task.status !== "done") {
            updatedSessions.splice(existingSessionIndex, 1)
            updatedSessions.unshift(session)
          }

          setTaskSessions(updatedSessions)
        } else {
          // Create new session
          const newSession: TaskActivitySession = {
            taskId,
            taskName,
            lastUpdated: now,
            commitCount: 1,
            lastCommitText: commitText,
            commits: [
              {
                text: commitText,
                timestamp: now,
              },
            ],
            expanded: false,
            commitsExpanded: false,
            completedSubtasks: taskInfo.completedSubtasks,
            subtaskCount: taskInfo.subtaskCount,
            status: taskInfo.task.status,
          }

          // Add to the beginning of the array (most recent)
          setTaskSessions([newSession, ...taskSessions])
        }
      })
    },
    [taskSessions, setTaskSessions],
  )

  useImperativeHandle(ref, () => ({
    addTaskActivity,
  }))

  // Now, let's update the useEffect hook that loads messages to properly extract task sessions
  // Find the useEffect that calls loadMessages() (around line 150-200) and update the part that processes messages:
  useEffect(() => {
    async function loadMessages() {
      setLoading(true)
      try {
        const data = await getMasterChatMessages()
        setMessages(data)

        // Extract task sessions from messages
        const sessions: TaskActivitySession[] = []

        // Process messages to extract task activities
        for (const msg of data) {
          if (msg.type === "event" && msg.metadata?.taskId) {
            const taskId = msg.metadata.taskId
            const existingSession = sessions.find((s) => s.taskId === taskId)

            // Get task status and subtask info
            let status = "in_progress"
            let completedSubtasks = 0
            let subtaskCount = 0

            // Try to extract status from message content
            if (msg.content.includes("marked as done")) {
              status = "done"
            }

            // Try to extract subtask info from metadata if available
            if (msg.metadata.completedSubtasks !== undefined && msg.metadata.subtaskCount !== undefined) {
              completedSubtasks = msg.metadata.completedSubtasks
              subtaskCount = msg.metadata.subtaskCount
            }

            if (existingSession) {
              // Update existing session
              existingSession.lastUpdated = new Date(msg.created_at)
              existingSession.commitCount += 1
              existingSession.lastCommitText = msg.content
              existingSession.commits.push({
                text: msg.content,
                timestamp: new Date(msg.created_at),
              })

              // Update status and subtask info if available
              if (status === "done") {
                existingSession.status = status
              }
              if (completedSubtasks > 0 || subtaskCount > 0) {
                existingSession.completedSubtasks = completedSubtasks
                existingSession.subtaskCount = subtaskCount
              }
            } else {
              // Create new session
              const taskName = msg.metadata.taskName || `Task #${taskId}`
              const lastCommitText = msg.content
              sessions.push({
                taskId,
                taskName,
                lastUpdated: new Date(msg.created_at),
                commitCount: 1,
                lastCommitText: lastCommitText,
                commits: [
                  {
                    text: msg.content,
                    timestamp: new Date(msg.created_at),
                  },
                ],
                expanded: false,
                commitsExpanded: false,
                completedSubtasks: completedSubtasks,
                subtaskCount: subtaskCount || 1, // Default to 1 if not specified
                status: status,
              })
            }
          }
        }

        // Sort sessions by last updated time (newest first)
        sessions.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
        setTaskSessions(sessions)
      } catch (error) {
        console.error("Error loading master chat messages:", error)
      } finally {
        setLoading(false)
        // Scroll to bottom after loading messages
        setTimeout(() => {
          scrollToBottom()
        }, 100)
      }
    }

    loadMessages()
  }, [])

  // Update the handleSendMessage function to use Grok
  const handleSendMessage = async () => {
    if (!message.trim()) return

    try {
      // Create and add the user message
      const userMessage = await createMessage(
        message,
        "message",
        0, // Master chat has task_id 0
        0, // Master chat has subtask_id 0
        "current-user", // Replace with actual user ID when auth is implemented
      )

      if (userMessage) {
        setMessages([...messages, userMessage])
        setMessage("")

        // Show a loading indicator
        setIsLoading(true)

        // Prepare conversation history for Grok
        const conversationHistory = messages
          .filter((msg) => msg.type === "message")
          .slice(-10) // Only use the last 10 messages for context
          .map((msg) => ({
            role: msg.user_id === "current-user" ? "user" : "assistant",
            content: msg.content,
          }))

        // Add the new user message
        conversationHistory.push({
          role: "user",
          content: userMessage.content,
        })

        // Add a system message to provide context
        conversationHistory.unshift({
          role: "system",
          content:
            "You are an AI assistant helping with project development. Be concise, helpful, and focus on providing actionable advice.",
        })

        try {
          // Get response from Grok
          const grokResponse = await generateGrokResponse(conversationHistory)

          // Create and add the assistant message
          const assistantMessage = await createMessage(
            grokResponse,
            "message",
            0, // Master chat has task_id 0
            0, // Master chat has subtask_id 0
            null, // AI message
          )

          if (assistantMessage) {
            setMessages((prevMessages) => [...prevMessages, assistantMessage])
          }
        } catch (error) {
          console.error("Error getting Grok response:", error)
          // Add an error message with a more user-friendly message
          const errorMessage = await createMessage(
            "I'm sorry, I'm having trouble connecting to my knowledge base right now. Let's continue our conversation when the connection is restored.",
            "message",
            0,
            0,
            null,
          )
          if (errorMessage) {
            setMessages((prevMessages) => [...prevMessages, errorMessage])
          }
        } finally {
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)
    }
  }

  // Add a function to handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyToClipboard = async (text: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessage(messageId)
      setTimeout(() => setCopiedMessage(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const getIconForEventType = (type: string) => {
    switch (type) {
      case "system":
        return FileText
      case "task":
        return CheckSquare
      case "info":
        return Info
      case "alert":
        return AlertCircle
      default:
        return Info
    }
  }

  const handleQuickAction = (actionText: string) => {
    setMessage(actionText)
    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleMarkAsDone = async () => {
    try {
      await createMessage("Project milestone completed", "event", 0, 0, null, {
        eventType: "task",
        title: "Milestone Completed",
      })

      // Reload messages to show the new event
      const data = await getMasterChatMessages()
      setMessages(data)
    } catch (error) {
      console.error("Error marking as done:", error)
    }
  }

  // Function to handle clicking on a subtask
  const handleSubtaskClick = async (subtaskId: number) => {
    if (!expandedTaskId) return

    try {
      // Toggle the active subtask
      if (activeSubtaskId === subtaskId) {
        setActiveSubtaskId(null)
        // Load messages for the main task
        const messagesData = await getMessagesForTask(expandedTaskId)
        setTaskMessages(messagesData)
      } else {
        setActiveSubtaskId(subtaskId)
        // Load messages for this subtask
        const messagesData = await getMessagesForTask(expandedTaskId, subtaskId)
        setTaskMessages(messagesData)
      }
    } catch (error) {
      console.error("Error loading subtask messages:", error)
    }
  }

  // Function to send a message to the current task or subtask
  const handleSendTaskMessage = async () => {
    if (!expandedTaskId || !taskMessage.trim()) return

    try {
      const newMessage = await createMessage(
        taskMessage,
        "message",
        expandedTaskId,
        activeSubtaskId || 0,
        "current-user", // Replace with actual user ID when auth is implemented
      )

      if (newMessage) {
        setTaskMessages([...taskMessages, newMessage])
        setTaskMessage("")

        // Create activity text
        const activityText = activeSubtaskId
          ? `Message in subtask: ${taskMessage.substring(0, 50)}${taskMessage.length > 50 ? "..." : ""}`
          : `Message: ${taskMessage.substring(0, 50)}${taskMessage.length > 50 ? "..." : ""}`

        // Add to task activity
        if (expandedTaskId && currentTask?.description && activityText) {
          addTaskActivity(expandedTaskId, currentTask.description, activityText)
        }

        // Now add Grok response to the task chat
        setIsLoading(true)

        // Prepare conversation history for Grok
        const conversationHistory = taskMessages
          .filter((msg) => msg.type === "message")
          .slice(-10) // Only use the last 10 messages for context
          .map((msg) => ({
            role: msg.user_id === "current-user" ? "user" : "assistant",
            content: msg.content,
          }))

        // Add the new user message
        conversationHistory.push({
          role: "user",
          content: taskMessage,
        })

        // Add a system message to provide context
        let systemPrompt = `You are an AI assistant helping with the task: "${currentTask?.description}".`
        if (activeSubtaskId) {
          const subtask = currentSubtasks.find((s) => s.task_id === activeSubtaskId)
          if (subtask) {
            systemPrompt += ` Currently working on subtask: "${subtask.description}".`
          }
        }
        systemPrompt += " Be concise, helpful, and focus on providing actionable advice."

        conversationHistory.unshift({
          role: "system",
          content: systemPrompt,
        })

        try {
          // Get response from Grok
          const grokResponse = await generateGrokResponse(conversationHistory)

          // Create and add the assistant message
          const assistantMessage = await createMessage(
            grokResponse,
            "message",
            expandedTaskId,
            activeSubtaskId || 0,
            null, // AI message
          )

          if (assistantMessage) {
            setTaskMessages((prevMessages) => [...prevMessages, assistantMessage])
          }
        } catch (error) {
          console.error("Error getting Grok response for task:", error)
          // Add an error message
          const errorMessage = await createMessage(
            "I'm sorry, I'm having trouble connecting to my knowledge base right now. Let's continue our conversation when the connection is restored.",
            "message",
            expandedTaskId,
            activeSubtaskId || 0,
            null,
          )
          if (errorMessage) {
            setTaskMessages((prevMessages) => [...prevMessages, errorMessage])
          }
        } finally {
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error("Error sending task message:", error)
      setIsLoading(false)
    }
  }

  // Add a function to handle Enter key press for task messages
  const handleTaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendTaskMessage()
    }
  }

  // Function to toggle task expansion
  const toggleTaskExpansion = async (taskId: number) => {
    // If we're already showing this task, collapse it
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null)
      setCurrentTask(null)
      setCurrentSubtasks([])
      setTaskMessages([])
      setActiveSubtaskId(null)
      return
    }

    // Otherwise, load and expand the task
    try {
      const task = await getTaskById(taskId)
      if (task) {
        setCurrentTask(task)
        const subtasks = await getSubtasks(taskId)
        setCurrentSubtasks(subtasks)

        // Load messages for this task
        const messages = await getMessagesForTask(taskId)
        setTaskMessages(messages)

        setExpandedTaskId(taskId)
        setActiveSubtaskId(null)

        // Update the session to mark it as expanded
        setTaskSessions((prev) =>
          prev.map((session) =>
            session.taskId === taskId ? { ...session, expanded: true } : { ...session, expanded: false },
          ),
        )
      }
    } catch (error) {
      console.error(`Error loading task ${taskId}:`, error)
    }
  }

  // Function to toggle commits expansion
  const toggleCommitsExpansion = (taskId: number) => {
    setTaskSessions((prev) =>
      prev.map((session) =>
        session.taskId === taskId ? { ...session, commitsExpanded: !session.commitsExpanded } : session,
      ),
    )
  }

  // Add style tag for keyframes
  useEffect(() => {
    // Create style element if it doesn't exist
    if (!document.getElementById("master-chat-animations")) {
      const style = document.createElement("style")
      style.id = "master-chat-animations"
      style.innerHTML = fadeSlideInKeyframes
      document.head.appendChild(style)
    }

    return () => {
      // Clean up on unmount
      const style = document.getElementById("master-chat-animations")
      if (style) {
        style.remove()
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        {/* Skeleton for chat messages */}
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-6">
            {/* User message skeleton */}
            <div className="flex justify-end">
              <div className="bg-gray-200 rounded-2xl py-2 px-4 w-64 h-10 animate-pulse"></div>
            </div>

            {/* AI response skeleton */}
            <div className="space-y-2">
              <div className="bg-gray-200 rounded-2xl py-2 px-4 w-72 h-16 animate-pulse"></div>
              <div className="bg-gray-200 rounded-2xl py-2 px-4 w-80 h-12 animate-pulse"></div>
            </div>

            {/* Event message skeleton */}
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* User message skeleton */}
            <div className="flex justify-end">
              <div className="bg-gray-200 rounded-2xl py-2 px-4 w-48 h-10 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Skeleton for input area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex">
            <div className="flex-1 h-10 bg-gray-200 rounded-l-md animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-300 rounded-r-md animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 no-scrollbar">
        <div className="space-y-4">
          {messages.length === 0 && taskSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Info size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">No messages yet</p>
              <p className="text-gray-400 text-sm">Start the conversation by sending a message below</p>
            </div>
          ) : (
            <>
              {/* Combined Messages and Task Activities in chronological order */}
              {[
                ...messages,
                ...taskSessions.map((session) => ({
                  message_id: `task-${session.taskId}-${session.lastUpdated.getTime()}`,
                  type: "task-session",
                  content: "",
                  created_at: session.lastUpdated.toISOString(),
                  user_id: null,
                  task_id: 0,
                  subtask_id: 0,
                  metadata: null,
                  session: session,
                })),
              ]
                .sort((a, b) => {
                  const dateA =
                    a.type === "task-session"
                      ? (a as any).session.lastUpdated.getTime()
                      : new Date(a.created_at).getTime()
                  const dateB =
                    b.type === "task-session"
                      ? (b as any).session.lastUpdated.getTime()
                      : new Date(b.created_at).getTime()
                  return dateA - dateB
                })
                .map((item) => {
                  // Now, let's completely replace the task session rendering in the combined messages section
                  // Find the section where task sessions are rendered (around line 500-600)
                  // Replace the entire task session rendering block with this new implementation:

                  if (item.type === "task-session") {
                    return (
                      <div
                        key={`task-${item.session.taskId}-${item.session.lastUpdated.getTime()}`}
                        className={cn(
                          "mb-4 overflow-hidden transition-all duration-300 ease-in-out",
                          expandedTaskId === item.session.taskId ? "shadow-sm" : "",
                        )}
                      >
                        {/* Task Header - Always visible */}
                        <div
                          className="p-3 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                          onClick={() => toggleTaskExpansion(item.session.taskId)}
                        >
                          <div className="relative">
                            <div
                              className={cn(
                                "w-4 h-4 rounded-full mr-3 flex-shrink-0 flex items-center justify-center",
                                item.session.status === "done"
                                  ? "bg-[#8EEDC7]"
                                  : item.session.status === "in_progress"
                                    ? "bg-yellow-500"
                                    : "bg-gray-400",
                              )}
                            >
                              {/* Fixed toggle icon */}
                              <ChevronRight
                                size={12}
                                className={cn(
                                  "text-white transition-transform duration-200",
                                  expandedTaskId === item.session.taskId ? "rotate-90" : "",
                                )}
                              />
                            </div>
                          </div>
                          <div className="flex-1 flex items-center">
                            <span className="font-medium">
                              Task: {item.session.taskName}: {item.session.status === "done" ? "Done" : "in progress"} (
                              {item.session.completedSubtasks}/{item.session.subtaskCount})
                            </span>
                            {/* Move chat icon next to text */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (onSwitchTask) {
                                  onSwitchTask(item.session.taskId)
                                }
                              }}
                              className="ml-2 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                              title="Open in Task Chat"
                            >
                              <MessageSquare size={16} className="text-gray-600" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Task View - Visible when task is expanded */}
                        {expandedTaskId === item.session.taskId && currentTask && currentSubtasks.length > 0 && (
                          <div className="transform transition-all duration-300 ease-in-out origin-top">
                            {/* Subtasks with connecting line */}
                            <div className="animate-fadeIn relative ml-2">
                              {/* Vertical connecting line that stops at the last subtask */}
                              <div
                                className="absolute left-2 top-0 w-[1px] bg-gray-300"
                                style={{
                                  height: `${currentSubtasks.length * 40 - 8}px`,
                                }}
                              />

                              <div className="space-y-2 pl-6">
                                {currentSubtasks.map((subtask, index) => (
                                  <div
                                    key={subtask.task_id}
                                    className="flex items-center p-2 transform transition-all duration-300 ease-in-out"
                                    style={{
                                      animationDelay: `${index * 100}ms`,
                                      opacity: 0,
                                      animation: "fadeSlideIn 0.3s forwards",
                                    }}
                                  >
                                    <div
                                      className={cn(
                                        "w-3 h-3 rounded-full mr-3 flex-shrink-0 relative z-10",
                                        subtask.status === "done"
                                          ? "bg-[#8EEDC7]"
                                          : subtask.status === "in_progress"
                                            ? "bg-yellow-500"
                                            : "bg-gray-400",
                                      )}
                                    />
                                    <span className="text-sm">{subtask.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  } else if (item.type === "message") {
                    const isCurrentUser = item.user_id === "current-user"
                    return (
                      <div key={item.message_id} className={isCurrentUser ? "mb-2" : "mb-4"}>
                        {isCurrentUser ? (
                          <div className="flex justify-end">
                            <div className="bg-[#F0EEE6] rounded-2xl py-2 px-4 max-w-[80%]">
                              <p className="text-gray-800">{item.content}</p>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="relative mb-8"
                            onMouseEnter={() => setHoveredMessage(item.message_id)}
                            onMouseLeave={() => setHoveredMessage(null)}
                          >
                            {/* Removed the Grok label */}
                            <div className="p-3 rounded-lg">
                              <p className="text-gray-800">{item.content}</p>
                            </div>

                            {/* Interactive buttons */}
                            <div
                              className={cn(
                                "absolute right-0 bottom-0 transform translate-y-6 flex space-x-2 transition-opacity duration-200",
                                hoveredMessage === item.message_id ? "opacity-100" : "opacity-0",
                              )}
                            >
                              <button
                                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                onClick={() => copyToClipboard(item.content, item.message_id)}
                                title="Copy to clipboard"
                              >
                                <Copy
                                  size={14}
                                  className={cn(copiedMessage === item.message_id ? "text-green-500" : "text-gray-500")}
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
                              <button
                                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                title="Retry"
                              >
                                <RefreshCw size={14} className="text-gray-500" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  } else if (item.type === "event" && !item.metadata?.taskId) {
                    const metadata = item.metadata || {}
                    const eventType = metadata.eventType || "info"
                    const Icon = getIconForEventType(eventType)

                    return (
                      <div key={item.message_id} className="p-3 flex items-start space-x-3">
                        <Icon
                          size={20}
                          className={cn(
                            eventType === "system" && "text-blue-500",
                            eventType === "task" && "text-green-500",
                            eventType === "info" && "text-gray-500",
                            eventType === "alert" && "text-orange-500",
                          )}
                        />

                        <div className="flex-1">
                          <div className="font-medium">{metadata.title || "Event"}</div>
                          <p className="text-sm text-gray-600">{item.content}</p>
                        </div>
                      </div>
                    )
                  }

                  return null
                })}
            </>
          )}
          {/* Add a div at the end to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center my-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      )}

      {/* Input field - positioned at bottom with proper layout */}
      <div className="sticky bottom-0 left-0 w-full py-4 bg-background">
        <div className="max-w-3xl mx-auto px-4">
          {/* Quick Actions */}
          <div className="flex overflow-x-scroll overflow-y-hidden pb-3 space-x-2 no-scrollbar">
            <button
              className="px-3 py-1.5 bg-green-50 text-green-700 rounded-md whitespace-nowrap hover:bg-green-100 transition-colors text-sm flex-shrink-0 flex items-center"
              onClick={handleMarkAsDone}
            >
              <CheckCircle size={14} className="mr-1.5" />
              Mark milestone
            </button>

            <button
              className="px-3 py-1.5 bg-secondary text-foreground rounded-md whitespace-nowrap hover:bg-secondary/80 transition-colors text-sm flex-shrink-0"
              onClick={() => handleQuickAction("Generate project ideas")}
            >
              Generate ideas
            </button>

            <button
              className="px-3 py-1.5 bg-secondary text-foreground rounded-md whitespace-nowrap hover:bg-secondary/80 transition-colors text-sm flex-shrink-0"
              onClick={() => handleQuickAction("Analyze market trends")}
            >
              Market analysis
            </button>

            <button
              className="px-3 py-1.5 bg-secondary text-foreground rounded-md whitespace-nowrap hover:bg-secondary/80 transition-colors text-sm flex-shrink-0"
              onClick={() => handleQuickAction("Summarize project status")}
            >
              Summarize
            </button>

            <button
              className="px-3 py-1.5 bg-secondary text-foreground rounded-md whitespace-nowrap hover:bg-secondary/80 transition-colors text-sm flex-shrink-0"
              onClick={() => handleQuickAction("Create a project timeline")}
            >
              Timeline
            </button>

            <button
              className="px-3 py-1.5 bg-secondary text-foreground rounded-md whitespace-nowrap hover:bg-secondary/80 transition-colors text-sm flex-shrink-0"
              onClick={() => handleQuickAction("Find resources for this project")}
            >
              Resources
            </button>
          </div>

          {/* Message Input */}
          <div className="flex mt-2">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-background text-foreground"
            />
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-r-md hover:bg-primary/80 transition-colors"
              onClick={handleSendMessage}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

MasterChat.displayName = "MasterChat"

export default MasterChat
