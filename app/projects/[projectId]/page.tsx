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
  const [taskId, setTaskId] = useState<number | null>(null)

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
        // First, check if there are any tasks for this project
        const tasks = await getAllTasks()

        if (tasks.length > 0) {
          // If tasks exist, use the first one
          setTaskId(tasks[0].task_id)
        } else {
          // If no tasks exist, create a default task for this project
          const defaultTask = await createTask("Market Research")
          if (defaultTask) {
            setTaskId(defaultTask.task_id)

            // Create some subtasks for this task
            await createTask("Identify direct competitors", defaultTask.task_id)
            await createTask("Analyze competitor strengths and weaknesses", defaultTask.task_id)
            await createTask("Identify market gaps and opportunities", defaultTask.task_id)
            await createTask("Create a competitive positioning map", defaultTask.task_id)
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
        const projectIdNum = Number.parseInt(params.projectId, 10)
        if (isNaN(projectIdNum)) {
          setError("Invalid project ID")
          setLoading(false)
          return
        }

        const supabase = getSupabase()
        const { data, error: supabaseError } = await supabase
          .from("projects")
          .select("project_id")
          .eq("project_id", projectIdNum)
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

  const handleSwitchTask = (newTaskId: number) => {
    setTaskId(newTaskId)
  }

  // Handle task activity to update the master chat
  const handleTaskActivity = (taskId: number, taskName: string, activityText: string) => {
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
        ) : taskId ? (
          <TaskChat taskId={taskId} onSwitchTask={handleSwitchTask} onTaskActivity={handleTaskActivity} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <h2 className="text-xl font-semibold mb-4">No Tasks Available</h2>
            <p className="text-gray-600 mb-6 text-center">
              There are no tasks for this project yet. Please create a task to get started.
            </p>
            <button
              onClick={async () => {
                const task = await createTask("Market Research")
                if (task) setTaskId(task.task_id)
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
