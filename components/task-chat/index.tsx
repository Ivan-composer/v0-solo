"use client"

import { useState, useEffect, useRef } from "react"
import {
  getTaskById,
  getSubtasks,
  getMessagesForTask,
  getAllTasks,
  isTaskAvailable,
  createMessage,
  type Task,
  type Message,
} from "@/lib/database"
import TaskHeader from "./TaskHeader"
import TaskQueue from "./TaskQueue"
import SubtaskList from "./SubtaskList"
import MessageList from "./MessageList"
import QuickActions from "./QuickActions"
import MessageInput from "./MessageInput"
import { ArrowRight, Lock, ChevronUp, ChevronDown } from "lucide-react"
// Add these imports at the top
import { generateGrokResponse } from "@/lib/grok"
import { cn } from "@/utils/cn"

// Define a type for the onTaskActivity callback
type TaskActivityCallback = (taskId: number, taskName: string, activityText: string) => void

export default function TaskChat({
  taskId,
  onSwitchTask,
  onTaskActivity,
}: {
  taskId?: string | null
  onSwitchTask?: (taskId: string) => void
  onTaskActivity?: TaskActivityCallback
}) {
  const [expanded, setExpanded] = useState(false)
  const [activeSubtask, setActiveSubtask] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [subtasks, setSubtasks] = useState<Task[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [taskQueue, setTaskQueue] = useState<Task[]>([])
  const [taskProgress, setTaskProgress] = useState(0)
  const [currentTaskPosition, setCurrentTaskPosition] = useState("N/A")
  const inputRef = useRef<HTMLInputElement>(null)
  // Add a ref for the message container to enable auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Add a loading state
  const [isLoading, setIsLoading] = useState(false)
  // Track scroll position
  const [scrollPosition, setScrollPosition] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const [showFloatingHeader, setShowFloatingHeader] = useState(false)
  const [activeSubtaskData, setActiveSubtaskData] = useState<Task | null>(null)
  // Reference to the task header element
  const taskHeaderRef = useRef<HTMLDivElement>(null)
  // Store the task header height
  const [taskHeaderHeight, setTaskHeaderHeight] = useState(0)
  // Track if user has scrolled up
  const [isScrolledUp, setIsScrolledUp] = useState(false)
  // Track if we should auto-scroll
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false)

  // Track the current session for this task
  const [currentSessionStartTime] = useState(new Date())
  const [lastActivityTime, setLastActivityTime] = useState<Date | null>(null)

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Only scroll to bottom when messages change AND shouldAutoScroll is true
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom()
    }
  }, [messages, shouldAutoScroll])

  // Function to load task queue data
  const loadTaskQueue = async () => {
    try {
      const tasks = await getAllTasks()
      setTaskQueue(tasks)

      // Calculate position and progress
      if (taskId && tasks.length > 0) {
        const currentIndex = tasks.findIndex((t) => t.task_id === taskId)
        if (currentIndex !== -1) {
          setCurrentTaskPosition(`${currentIndex + 1}/${tasks.length}`)
          setTaskProgress(((currentIndex + 1) / tasks.length) * 100)
        }
      }
    } catch (error) {
      console.error("Error loading task queue:", error)
    }
  }

  // Function to load task data
  const loadTaskData = async () => {
    if (!taskId || taskId === "undefined") {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Load the current task
      const task = await getTaskById(taskId)
      if (task) {
        setCurrentTask(task)

        // Load subtasks
        const subtasksData = await getSubtasks(taskId)
        setSubtasks(subtasksData)

        // Load messages for this task
        const messagesData = await getMessagesForTask(taskId)
        setMessages(messagesData)
      } else {
        console.log(`No task found with ID ${taskId}`)
        setCurrentTask(null)
        setSubtasks([])
        setMessages([])
      }
    } catch (error) {
      console.error("Error loading task data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTaskQueue()
    loadTaskData()
    // Close the task queue when switching tasks
    setExpanded(false)
    // Reset the session start time when switching tasks
    setLastActivityTime(null)
    // Reset scroll state when switching tasks
    setIsScrolledUp(false)
    // Don't auto-scroll when first loading the task
    setShouldAutoScroll(false)

    // Add this to check scroll state after data is loaded
    const checkScrollStateAfterLoad = () => {
      if (contentRef.current) {
        const scrollHeight = contentRef.current.scrollHeight
        const clientHeight = contentRef.current.clientHeight

        // If content is taller than container, show the button
        if (scrollHeight > clientHeight + 50) {
          setIsScrolledUp(true)
        }
      }
    }

    // Check scroll state after a delay to ensure content is loaded
    const timer = setTimeout(checkScrollStateAfterLoad, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  // Measure the task header height after render and when expanded state changes
  useEffect(() => {
    if (taskHeaderRef.current) {
      // Get the height of the task header including the task queue if expanded
      const headerHeight = taskHeaderRef.current.offsetHeight + (expanded ? 200 : 0) // 200px is an estimate for the task queue height
      setTaskHeaderHeight(headerHeight)
    }
  }, [expanded, loading])

  // Set up scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const scrollTop = contentRef.current.scrollTop
        const scrollHeight = contentRef.current.scrollHeight
        const clientHeight = contentRef.current.clientHeight

        setScrollPosition(scrollTop)

        // Check if we're scrolled up from the bottom
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50 // Within 50px of bottom
        setIsScrolledUp(!isAtBottom)

        // If we have an active subtask and have scrolled down more than 100px, show the floating header
        if (activeSubtask !== null && scrollTop > 100) {
          setShowFloatingHeader(true)
        } else {
          setShowFloatingHeader(false)
        }
      }
    }

    // Add this function to check initial scroll state
    const checkInitialScrollState = () => {
      if (contentRef.current) {
        const scrollHeight = contentRef.current.scrollHeight
        const clientHeight = contentRef.current.clientHeight

        // If content is taller than container, show the button
        if (scrollHeight > clientHeight + 50) {
          setIsScrolledUp(true)
        } else {
          setIsScrolledUp(false)
        }
      }
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll)

      // Check initial state after a short delay to ensure content is rendered
      setTimeout(checkInitialScrollState, 300)
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener("scroll", handleScroll)
      }
    }
  }, [activeSubtask, messages]) // Add messages as a dependency to re-evaluate when messages change

  // Update activeSubtaskData when activeSubtask changes
  useEffect(() => {
    if (activeSubtask !== null) {
      const subtask = subtasks.find((s) => s.id === activeSubtask)
      setActiveSubtaskData(subtask || null)
    } else {
      setActiveSubtaskData(null)
    }
  }, [activeSubtask, subtasks])

  // 1. Update the handleSubtaskClick function to reset scroll position when returning to task chat
  const handleSubtaskClick = async (subtaskId: string) => {
    if (!taskId || taskId === "undefined") return

    if (activeSubtask === subtaskId) {
      setActiveSubtask(null)
      // Load messages for the main task
      const messagesData = await getMessagesForTask(taskId)
      setMessages(messagesData)
      // Don't auto-scroll when switching back to main task
      setShouldAutoScroll(false)
      // Reset scroll position to top when returning to main task chat
      if (contentRef.current) {
        contentRef.current.scrollTop = 0
      }
    } else {
      setActiveSubtask(subtaskId)
      // Load messages for this subtask (validate subtaskId is a valid UUID)
      if (
        subtaskId &&
        subtaskId !== "undefined" &&
        subtaskId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      ) {
        const messagesData = await getMessagesForTask(subtaskId)
        setMessages(messagesData)
      } else {
        console.warn("Invalid subtaskId:", subtaskId)
        setMessages([])
      }
      // Don't auto-scroll when switching to subtask
      setShouldAutoScroll(false)
      // Reset scroll position to top when switching to subtask
      if (contentRef.current) {
        contentRef.current.scrollTop = 0
      }
    }
  }

  const getActiveSubtask = () => {
    return subtasks.find((subtask) => subtask.id === activeSubtask)
  }

  // Update the handleSendMessage function to use Grok
  const handleSendMessage = async (text: string) => {
    if (!taskId || taskId === "undefined" || !text.trim() || !currentTask) return

    try {
      // Enable auto-scrolling when sending a message
      setShouldAutoScroll(true)

      // Determine which task to send the message to
      let targetTaskId = taskId
      if (
        activeSubtask &&
        activeSubtask !== "undefined" &&
        activeSubtask.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      ) {
        targetTaskId = activeSubtask
      }

      // Create and add the user message with correct parameter order
      const newMessage = await createMessage(
        targetTaskId, // taskId (either main task or subtask)
        text, // content
        null, // authorId - use null since we don't have auth yet
        "user", // role
      )

      if (newMessage) {
        setMessages([...messages, newMessage])
        setComment("")

        // Determine if this is part of the same session or a new one
        const now = new Date()
        const isNewSession = !lastActivityTime || now.getTime() - lastActivityTime.getTime() > 30 * 60 * 1000 // 30 minutes

        // Update last activity time
        setLastActivityTime(now)

        // Create activity text based on context
        let activityText = text
        if (activeSubtask) {
          const subtask = getActiveSubtask()
          if (subtask) {
            activityText = `Message in subtask "${subtask.title}": ${text.substring(0, 50)}${text.length > 50 ? "..." : ""}`
          }
        }

        // Show loading indicator
        setIsLoading(true)

        // Prepare conversation history for Grok
        const conversationHistory = messages
          .filter((msg) => msg.role === "user" || msg.role === "agent")
          .slice(-10) // Only use the last 10 messages for context
          .map((msg) => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content,
          }))

        // Add the new user message
        conversationHistory.push({
          role: "user",
          content: text,
        })

        // Add a system message to provide context about the current task/subtask
        let systemPrompt = `You are an AI assistant helping with the task: "${currentTask.title}".`
        if (activeSubtask) {
          const subtask = getActiveSubtask()
          if (subtask) {
            systemPrompt += ` Currently working on subtask: "${subtask.title}".`
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

          // Create and add the assistant message with correct parameter order
          const assistantMessage = await createMessage(
            targetTaskId, // taskId (either main task or subtask)
            grokResponse, // content
            null, // authorId (null for AI)
            "agent", // role
          )

          if (assistantMessage) {
            setMessages((prevMessages) => [...prevMessages, assistantMessage])
          }
        } catch (error) {
          console.error("Error getting Grok response:", error)
          // Add an error message with correct parameter order
          const errorMessage = await createMessage(
            targetTaskId, // taskId (either main task or subtask)
            "I'm sorry, I'm having trouble connecting to my knowledge base right now. Let's continue our conversation when the connection is restored.", // content
            null, // authorId
            "system", // role
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

  const handleExecute = async (withComment = false) => {
    if (!taskId) return

    if (withComment) {
      setComment("Execute, but don't forget this: ")
      // Focus the input field
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          // Place cursor at the end
          const length = inputRef.current.value.length
          inputRef.current.setSelectionRange(length, length)
        }
      }, 0)
    } else {
      // Enable auto-scrolling when executing
      setShouldAutoScroll(true)
      // Send "execute" message
      handleSendMessage("Execute")
    }
  }

  const markAsDone = async (subtaskId?: string) => {
    if (!taskId || !currentTask) return

    try {
      const { updateTaskStatus } = await import("@/lib/database")

      if (subtaskId) {
        // Find the subtask that will be marked as done
        const subtask = subtasks.find((s) => s.id === subtaskId)
        if (!subtask) {
          console.error(`Subtask ${subtaskId} not found`)
          return
        }

        // Mark subtask as done
        await updateTaskStatus(subtaskId, "completed")

        // Reload subtasks to update UI
        const updatedSubtasks = await getSubtasks(taskId)
        setSubtasks(updatedSubtasks)

        // Create activity text
        const activityText = `Subtask "${subtask.title}" marked as done`

        // Notify the master chat about this activity
        console.log("Calling onTaskActivity for subtask:", taskId, currentTask.title, activityText)
        if (onTaskActivity) {
          onTaskActivity(taskId, currentTask.title, activityText)
        }
      } else {
        // Mark main task as done
        await updateTaskStatus(currentTask.id, "completed")

        // Create activity text
        const activityText = `Task "${currentTask.title}" marked as done`

        // Notify the master chat about this activity
        console.log("Calling onTaskActivity for task:", taskId, currentTask.title, activityText)
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
  }

  // Handle scroll to bottom button click
  const handleScrollToBottom = () => {
    setShouldAutoScroll(true)
    scrollToBottom()
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        {/* Skeleton for task header */}
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

        {/* Skeleton for task content */}
        <div className="flex-1 overflow-auto pb-48 pt-4">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse mb-6"></div>

          {/* Skeleton for subtasks */}
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

  // Find the "Task Not Found" section and update the button color
  if (!taskId || !currentTask) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <h2 className="text-xl font-semibold mb-4">Task Not Found</h2>
        <p className="text-gray-600 mb-6">
          The task you're looking for doesn't exist. Please check the task ID and try again.
        </p>
        <button
          onClick={loadTaskData}
          className="px-4 py-2 bg-[#FF6B6B] text-white rounded-md hover:bg-[#FF6B6B]/90 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const hasSubtaskMessages = messages.length > 0 && activeSubtask !== null

  const NextTaskButton = ({
    currentTaskId,
    tasks,
    onSwitchTask,
  }: { currentTaskId?: number | null; tasks: Task[]; onSwitchTask?: (taskId: number) => void }) => {
    const handleNextTask = () => {
      if (!currentTaskId || !onSwitchTask) return

      // Find the next available task
      const currentIndex = tasks.findIndex((t) => t.id === currentTaskId)

      // Look for the next available task after the current one
      for (let i = currentIndex + 1; i < tasks.length; i++) {
        if (isTaskAvailable(tasks[i], tasks)) {
          onSwitchTask(tasks[i].id)
          return
        }
      }
    }

    // Find the next task in the queue
    const currentIndex = currentTaskId ? tasks.findIndex((t) => t.id === currentTaskId) : -1
    let nextTask = null

    // Find the next available task
    for (let i = currentIndex + 1; i < tasks.length; i++) {
      if (isTaskAvailable(tasks[i], tasks)) {
        nextTask = tasks[i]
        break
      }
    }

    // If no available task was found, show the next task in sequence but indicate it's locked
    if (!nextTask && currentIndex < tasks.length - 1) {
      nextTask = tasks[currentIndex + 1]
    }

    return (
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
        onClick={handleNextTask}
        disabled={!nextTask || (nextTask && !isTaskAvailable(nextTask, tasks))}
      >
        <span className="text-muted-foreground">Next Task</span>
        <div className="flex items-center text-foreground">
          <span>{nextTask ? nextTask.title : "No more tasks"}</span>
          {nextTask && !isTaskAvailable(nextTask, tasks) ? (
            <Lock size={18} className="ml-2 text-gray-400" />
          ) : (
            <ArrowRight size={18} className="ml-2" />
          )}
        </div>
      </button>
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
          onToggleExpand={() => setExpanded(!expanded)}
        />

        {/* Task Queue */}
        {expanded && (
          <TaskQueue tasks={taskQueue} activeTaskId={taskId} onSelectTask={(id) => onSwitchTask(String(id))} />
        )}
      </div>

      {/* Fixed Subtask Header - Always positioned directly below task header when active */}
      {activeSubtaskData && (
        <div
          className="sticky top-0 left-0 right-0 z-30 p-3 flex justify-between items-center cursor-pointer border-b border-gray-200 bg-background shadow-md"
          onClick={() => handleSubtaskClick(activeSubtaskData.id)}
          style={{ top: `${taskHeaderHeight}px` }} // Position directly below task header
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
            {/* Render only the subtask content without the header */}
            {activeSubtaskData && (
              <div className="overflow-hidden rounded-lg">
                {/* Skip rendering the header here since we already have it fixed at the top */}
                <div className="p-4">
                  <div className="mb-4 text-gray-700">
                    <h3 className="font-semibold mb-2">{activeSubtaskData.title}</h3>
                    {activeSubtaskData.description && <p>{activeSubtaskData.description}</p>}
                  </div>

                  {/* Show execute buttons only if no messages */}
                  {!hasSubtaskMessages && (
                    <div className="flex space-x-2">
                      <button
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        onClick={() => handleExecute(false)}
                      >
                        Execute
                      </button>
                      <button
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        onClick={() => handleExecute(true)}
                      >
                        Execute with comment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Show messages if they exist */}
            {hasSubtaskMessages && <MessageList messages={messages} taskId={activeSubtask} />}
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
        )}
        {/* Add a div at the end to scroll to */}
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
        {/* Quick Actions */}
        <QuickActions onMarkAsDone={() => markAsDone(activeSubtask || undefined)} />

        {/* Message Input */}
        <MessageInput ref={inputRef} value={comment} onChange={setComment} onSend={handleSendMessage} />

        {/* Next Task Button - only show if current task is done */}
        {currentTask && currentTask.status === "completed" && (
          <NextTaskButton currentTaskId={taskId} tasks={taskQueue} onSwitchTask={onSwitchTask} />
        )}
      </div>
    </div>
  )
}
