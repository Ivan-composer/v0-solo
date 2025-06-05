"use client"

import { useState, useEffect, useRef } from "react"
import Sidebar from "@/components/sidebar"
import TaskChat from "@/components/task-chat"
import MasterChat from "@/components/master-chat"
import ProjectContext from "@/components/context-half/project-context"
import ChatToggle from "@/components/chat-toggle"
import ResizableLayout from "@/components/resizable-layout"
import { getAllTasks, createTask } from "@/lib/database"
import { Menu } from "lucide-react"
import { getSupabase, checkSupabaseConnection } from "@/lib/supabase"
import FeatureChat from "@/components/feature-chat"
import NewsChat from "@/components/news-chat"

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  // Add these new state variables to the existing state declarations at the top of the component
  const [chatMode, setChatMode] = useState<"master" | "task" | "feature" | "news">("task")
  const [activeFeatureId, setActiveFeatureId] = useState<number | null>(null)
  const [activeNewsId, setActiveNewsId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dbConnected, setDbConnected] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const sidebarTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)

  // Reference to the master chat component to call its methods
  const masterChatRef = useRef<any>(null)

  useEffect(() => {
    async function checkConnection() {
      try {
        // Set a default of false and only change if the check succeeds
        setDbConnected(false)

        // Only run the check in the browser
        if (typeof window !== "undefined") {
          const connected = await checkSupabaseConnection()
          setDbConnected(connected)
        }
      } catch (err) {
        console.warn("Error checking connection, using mock data:", err)
        setDbConnected(false)
      }
    }

    checkConnection()
  }, [])

  useEffect(() => {
    async function loadTaskId() {
      setLoading(true)
      setError(null)
      try {
        // Проверяем, что projectId определен и не равен "undefined"
        if (!params.projectId || params.projectId === "undefined") {
          setError("Invalid project ID. Please select a valid project.")
          setLoading(false)
          return
        }

        // First, check if there are any tasks for this project
        const tasks = await getAllTasks(params.projectId)

        if (tasks.length > 0) {
          // If tasks exist, use the first one
          setTaskId(tasks[0].id)
        } else {
          // If no tasks exist, create a default task for this project
          // Примечание: здесь нужно будет добавить author_id, когда у нас будет аутентификация
          const defaultTask = await createTask(
            params.projectId,
            "Market Research",
            "Research the market to understand competitors and opportunities",
            "7d61e0ff-031a-48af-a640-3dc85b3ad69c", // Default author_id from your sample data
          )

          if (defaultTask) {
            setTaskId(defaultTask.id)

            // Create some subtasks for this task
            await createTask(
              params.projectId,
              "Identify direct competitors",
              "Research and list main competitors in the market",
              "7d61e0ff-031a-48af-a640-3dc85b3ad69c",
              defaultTask.id,
            )
            await createTask(
              params.projectId,
              "Analyze competitor strengths and weaknesses",
              "Evaluate what competitors do well and where they fall short",
              "7d61e0ff-031a-48af-a640-3dc85b3ad69c",
              defaultTask.id,
            )
            await createTask(
              params.projectId,
              "Identify market gaps and opportunities",
              "Find areas where customer needs are not being met",
              "7d61e0ff-031a-48af-a640-3dc85b3ad69c",
              defaultTask.id,
            )
            await createTask(
              params.projectId,
              "Create a competitive positioning map",
              "Visualize where your product fits in the market",
              "7d61e0ff-031a-48af-a640-3dc85b3ad69c",
              defaultTask.id,
            )
          } else {
            setError("Failed to create default task")
          }
        }
      } catch (error) {
        console.error("Error loading or creating tasks:", error)
        setError("Failed to load tasks. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    // Check if the project exists first
    async function checkProject() {
      try {
        // Проверяем, что projectId определен и не равен "undefined"
        if (!params.projectId || params.projectId === "undefined") {
          setError("Invalid project ID. Please select a valid project.")
          setLoading(false)
          return
        }

        const supabase = getSupabase()
        // Используем правильное имя колонки 'id' вместо 'project_id'
        const { data, error: supabaseError } = await supabase
          .from("projects")
          .select("id")
          .eq("id", params.projectId)
          .single()

        if (supabaseError || !data) {
          console.warn("Project not found or error:", supabaseError)
          // Instead of setting an error, we'll just use mock data
          // This allows the app to work even when Supabase is not available
          setLoading(false)
          loadTaskId()
          return
        }

        // Project exists, now load or create tasks
        loadTaskId()
      } catch (error) {
        console.warn("Error checking project, using mock data:", error)
        setLoading(false)
        loadTaskId()
      }
    }

    checkProject()
  }, [params.projectId])

  // Add event listener for the custom switch-task event
  useEffect(() => {
    const handleSwitchTaskEvent = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail && customEvent.detail.taskId) {
        // Switch to the task
        setTaskId(customEvent.detail.taskId)
        // Make sure we're in task chat mode
        setChatMode("task")
      }
    }

    document.addEventListener("switch-task", handleSwitchTaskEvent)

    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener("switch-task", handleSwitchTaskEvent)
    }
  }, [])

  // Add event listener for the custom switch-to-news-chat event
  useEffect(() => {
    const handleSwitchToNewsChat = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail && customEvent.detail.newsId) {
        // Switch to the news chat
        setActiveNewsId(customEvent.detail.newsId)
        // Make sure we're in news chat mode
        setChatMode("news")
      }
    }

    document.addEventListener("switch-to-news-chat", handleSwitchToNewsChat)

    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener("switch-to-news-chat", handleSwitchToNewsChat)
    }
  }, [])

  const handleSwitchTask = (newTaskId: string | number) => {
    setTaskId(String(newTaskId))
  }

  // Handle task activity to update the master chat
  const handleTaskActivity = (taskId: string, taskName: string, activityText: string) => {
    // If masterChatRef.current exists and has the addTaskActivity method, call it
    if (masterChatRef.current && typeof masterChatRef.current.addTaskActivity === "function") {
      masterChatRef.current.addTaskActivity(taskId, taskName, activityText)
    }
  }

  const handleMouseEnterSidebar = () => {
    if (sidebarTimeoutRef.current) {
      clearTimeout(sidebarTimeoutRef.current)
      sidebarTimeoutRef.current = null
    }
    setSidebarHovered(true)
  }

  const handleMouseLeaveSidebar = () => {
    sidebarTimeoutRef.current = setTimeout(() => {
      setSidebarHovered(false)
    }, 300) // Delay to prevent immediate collapse
  }

  useEffect(() => {
    return () => {
      if (sidebarTimeoutRef.current) {
        clearTimeout(sidebarTimeoutRef.current)
      }
    }
  }, [])

  // Add this function to handle feature chat activation
  const handleOpenFeatureChat = (featureId: number) => {
    setActiveFeatureId(featureId)
    setChatMode("feature")
  }

  // Add this function to handle feature chat closure
  const handleCloseFeatureChat = () => {
    setActiveFeatureId(null)
    setChatMode("task")
  }

  // Add this function to handle opening the news chat
  const handleOpenNewsChat = (newsId: number) => {
    console.log("ProjectPage: handleOpenNewsChat called with newsId:", newsId)
    setActiveNewsId(newsId)
    setChatMode("news")
  }

  // Add this function to handle closing the news chat
  const handleCloseNewsChat = () => {
    setActiveNewsId(null)
    setChatMode("task")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="ml-3 text-gray-600">Loading project...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={() => (window.location.href = "/")}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Modify the leftContent variable to include feature chat
  const leftContent = (
    <div className="flex flex-col h-full">
      <div className="h-[64px] p-4 border-b border-gray-200 flex justify-center items-center">
        <ChatToggle
          onToggle={(mode) => setChatMode(mode)}
          showFeatureChat={chatMode === "feature"}
          showNewsChat={chatMode === "news"}
          onCloseFeatureChat={handleCloseFeatureChat}
          onCloseNewsChat={handleCloseNewsChat}
          currentMode={chatMode} // Add this prop to pass the current mode
        />
      </div>

      <div className="flex-1 overflow-hidden">
        {chatMode === "master" ? (
          <MasterChat
            ref={masterChatRef}
            onSwitchTask={(taskId) => {
              setTaskId(taskId)
              setChatMode("task")
            }}
          />
        ) : chatMode === "feature" && activeFeatureId ? (
          <FeatureChat
            featureId={activeFeatureId}
            onBack={handleCloseFeatureChat}
            onFeatureUpdated={() => {
              // Refresh backlog data when feature is updated
              const projectContext = document.querySelector('[data-component="project-context"]')
              if (projectContext) {
                const event = new CustomEvent("refresh-backlog")
                projectContext.dispatchEvent(event)
              }
            }}
          />
        ) : chatMode === "news" && activeNewsId ? (
          <NewsChat
            newsId={activeNewsId}
            onBack={handleCloseNewsChat}
            onStatusChange={async () => {
              // Refresh news data when status changes
              const projectContext = document.querySelector('[data-component="project-context"]')
              if (projectContext) {
                const event = new CustomEvent("refresh-news")
                projectContext.dispatchEvent(event)
              }
            }}
          />
        ) : taskId && taskId !== "undefined" ? (
          <TaskChat taskId={taskId} onSwitchTask={handleSwitchTask} onTaskActivity={handleTaskActivity} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <h2 className="text-xl font-semibold mb-4">No Tasks Available</h2>
            <p className="text-gray-600 mb-6 text-center">
              There are no tasks for this project yet. Please create a task to get started.
            </p>
            <button
              onClick={async () => {
                if (params.projectId && params.projectId !== "undefined") {
                  const task = await createTask(
                    params.projectId,
                    "Market Research",
                    "Research the market to understand competitors and opportunities",
                    "7d61e0ff-031a-48af-a640-3dc85b3ad69c", // Default author_id from your sample data
                  )
                  if (task) setTaskId(task.id)
                } else {
                  setError("Invalid project ID. Please select a valid project.")
                }
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Create First Task
            </button>
          </div>
        )}
      </div>
    </div>
  )

  // Right content with project context
  const rightContent = (
    <div className="h-full flex flex-col" data-component="project-context">
      <ProjectContext
        projectId={params.projectId}
        onOpenFeatureChat={handleOpenFeatureChat}
        onOpenNewsChat={handleOpenNewsChat}
      />
    </div>
  )

  return (
    <div className="flex h-screen">
      {/* Removed the "Running in demo mode" notification banner */}

      {/* Sidebar trigger area */}
      <div className="fixed top-0 left-0 h-full w-2 z-20" onMouseEnter={handleMouseEnterSidebar}></div>

      {/* Sidebar - collapsed by default */}
      <div
        className={`fixed top-0 left-0 h-full z-30 transition-all duration-300 ${
          sidebarExpanded || sidebarHovered ? "w-64 opacity-100" : "w-0 opacity-0 pointer-events-none"
        }`}
        onMouseLeave={handleMouseLeaveSidebar}
      >
        <div className="h-full" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
          <Sidebar />
        </div>
      </div>

      {/* Sidebar toggle button */}
      <button
        className="fixed top-4 left-4 z-40 p-2 bg-background rounded-full shadow-md hover:bg-secondary transition-colors"
        onClick={() => setSidebarExpanded(!sidebarExpanded)}
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Main content area with resizable layout */}
      <div className={`flex flex-1 transition-all duration-300 ${sidebarExpanded ? "ml-64" : "ml-0"}`}>
        <ResizableLayout
          leftContent={leftContent}
          rightContent={rightContent}
          initialLeftWidth={50}
          minLeftWidth={360} // minimum width for left panel
          maxLeftWidth={770} // updated to 770px
          minRightWidth={360} // minimum width for right panel
          leftPadding={25}
          rightPadding={45}
        />
      </div>
    </div>
  )
}
