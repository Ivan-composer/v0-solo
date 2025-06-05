"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/utils/cn"
import { getAllTasks, getSubtasks, isTaskAvailable, type Task } from "@/lib/database"
import {
  FileText,
  Award,
  BarChart2,
  Layers,
  Target,
  Lock,
  Activity,
  Tag,
  MessageSquare,
  ShoppingCart,
  User,
  Package,
  Search,
  Star,
  Truck,
  BarChart,
  CreditCard,
} from "lucide-react"
import type { JSX } from "react/jsx-runtime"
import { TaskListPopover, TaskListPopoverContent, TaskListPopoverTrigger } from "./tasklistpopover"

interface TaskListProps {
  projectStage?: "ideation" | "development"
}

export default function TaskList({ projectStage = "ideation" }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [subtasks, setSubtasks] = useState<{ [key: number]: Task[] }>({})
  const [loading, setLoading] = useState(true)
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const tasksData = await getAllTasks()
      setTasks(tasksData)

      // Find the active task (first in-progress task, or first available planned task)
      const inProgressTask = tasksData.find((t) => t.status === "in_progress")

      if (inProgressTask) {
        setActiveTaskId(inProgressTask.task_id)
      } else {
        // Find first available planned task
        const availableTask = tasksData.find((t) => t.status === "planned" && isTaskAvailable(t, tasksData))
        if (availableTask) {
          setActiveTaskId(availableTask.task_id)
        }
      }

      // Load subtasks for each task
      const subtasksData: { [key: number]: Task[] } = {}
      for (const task of tasksData) {
        subtasksData[task.task_id] = await getSubtasks(task.task_id)
      }
      setSubtasks(subtasksData)
    } catch (error) {
      console.error("Error loading tasks:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Updated function to use custom event instead of URL navigation
  const openTaskInChat = (taskId: number) => {
    // Dispatch a custom event to notify the parent components
    const event = new CustomEvent("switch-task", {
      detail: { taskId },
      bubbles: true, // Allow the event to bubble up through the DOM
    })
    document.dispatchEvent(event)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#FF6B6B] rounded-full animate-spin"></div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center">
          <Tag className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
          <h3 className="text-lg font-medium mb-2">No tasks found</h3>
          <p className="text-muted-foreground">
            This project doesn't have any tasks yet. Tasks will appear here once they're created.
          </p>
        </div>
      </div>
    )
  }

  // Define task icons
  const getTaskIcon = (task: Task) => {
    const iconMap: Record<string, JSX.Element> = {
      "Market Research": <FileText className="w-5 h-5" />,
      "Target Audience Definition": <Target className="w-5 h-5" />,
      "Value Proposition": <Layers className="w-5 h-5" />,
      "Competitive Analysis": <Activity className="w-5 h-5" />,
      "Feature Prioritization": <BarChart2 className="w-5 h-5" />,
      "User Personas": <Target className="w-5 h-5" />,
      "User Journey Mapping": <Activity className="w-5 h-5" />,
      "MVP Definition": <Layers className="w-5 h-5" />,
      "Technical Feasibility": <FileText className="w-5 h-5" />,
      "Risk Assessment": <Activity className="w-5 h-5" />,
      "Go-to-Market Strategy": <BarChart2 className="w-5 h-5" />,
      "Pricing Strategy": <Layers className="w-5 h-5" />,
      "Business Model": <FileText className="w-5 h-5" />,
      "Partnership Strategy": <Target className="w-5 h-5" />,
      "Payment Gateway Integration": <CreditCard className="w-5 h-5" />,
      "Product Catalog Design": <Package className="w-5 h-5" />,
      "User Authentication System": <User className="w-5 h-5" />,
      "Shopping Cart Functionality": <ShoppingCart className="w-5 h-5" />,
      "Order Management System": <FileText className="w-5 h-5" />,
      "Inventory Management": <Package className="w-5 h-5" />,
      "Search & Filter Implementation": <Search className="w-5 h-5" />,
      "User Reviews & Ratings": <Star className="w-5 h-5" />,
      "Shipping Integration": <Truck className="w-5 h-5" />,
      "Analytics Dashboard": <BarChart className="w-5 h-5" />,
    }

    return iconMap[task.title] || <Award className="w-5 h-5" />
  }

  // Calculate progress for a task based on its subtasks
  const calculateProgress = (taskId: number): number => {
    const taskSubtasks = subtasks[taskId] || []
    if (taskSubtasks.length === 0) return 0

    const completedSubtasks = taskSubtasks.filter((subtask) => subtask.status === "done").length
    return (completedSubtasks / taskSubtasks.length) * 100
  }

  // Render progress circle
  const renderProgressCircle = (progress: number, size = 80, status: string) => {
    const strokeWidth = 5
    const radius = size / 2 - strokeWidth / 2 - 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference

    // Set color based on status
    let progressColor = "#9CA3AF" // Default gray
    if (status === "done") {
      progressColor = "#A7D8F0"
    } else if (status === "in_progress") {
      progressColor = "#F97316" // Orange for in-progress tasks
    }

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute">
          {/* Background circle */}
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth / 2} />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
      </div>
    )
  }

  // Render a task node
  const renderTaskNode = (task: Task) => {
    const isAvailable = isTaskAvailable(task, tasks)
    const progress = calculateProgress(task.task_id)

    return (
      <div className="flex flex-col items-center relative z-10">
        {/* Task circle with Popover */}
        <TaskListPopover>
          <TaskListPopoverTrigger>
            <div className="relative w-20 h-20">
              {/* Progress circle */}
              {renderProgressCircle(progress, 80, task.status)}

              <button
                type="button"
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 absolute",
                  "bg-white text-gray-700 shadow-md hover:shadow-lg",
                  "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20",
                  task.status === "done"
                    ? "border-0"
                    : task.task_id === activeTaskId
                      ? "border-0"
                      : !isAvailable
                        ? "opacity-70"
                        : "",
                )}
                disabled={!isAvailable && task.status !== "done"}
              >
                {/* Task icon */}
                <div
                  className={cn(
                    !isAvailable && task.status !== "done"
                      ? "text-gray-400"
                      : task.status === "done"
                        ? "text-[#A7D8F0]"
                        : task.status === "in_progress"
                          ? "text-orange-500"
                          : "text-gray-700",
                  )}
                >
                  {!isAvailable && task.status !== "done" ? <Lock className="w-5 h-5" /> : getTaskIcon(task)}
                </div>
              </button>

              {/* Glow effect for active tasks */}
              {task.status === "in_progress" && (
                <div className="absolute inset-0 rounded-full bg-orange-500/10 blur-md z-0"></div>
              )}
              {task.status === "done" && (
                <div className="absolute inset-0 rounded-full bg-[#A7D8F0]/10 blur-md z-0"></div>
              )}
            </div>
          </TaskListPopoverTrigger>
          <TaskListPopoverContent className="w-[280px] p-4" side="right" align="start" sideOffset={8}>
            {/* Header with chat icon */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <h4 className="font-semibold">{task.title}</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openTaskInChat(task.task_id)
                  }}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                  title="Open in chat"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dependencies section */}
            {task.dependent_on_tasks && task.dependent_on_tasks.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-500">Dependencies:</div>
                <div className="text-sm">
                  {task.dependent_on_tasks.map((depId) => {
                    const depTask = tasks.find((t) => t.task_id === depId)
                    return (
                      <div key={depId} className="flex items-center mt-1">
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full mr-2 flex-shrink-0",
                            depTask?.status === "done" ? "bg-[#A7D8F0]" : "bg-gray-400",
                          )}
                        ></div>
                        <span>{depTask?.title || `Task #${depId}`}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Subtasks section */}
            {subtasks[task.task_id]?.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Subtasks:</div>
                {subtasks[task.task_id].map((subtask) => (
                  <div key={subtask.task_id} className="flex items-center">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full mr-2 flex-shrink-0",
                        subtask.status === "done" ? "bg-[#A7D8F0]" : "bg-gray-300",
                      )}
                    ></div>
                    <span className="text-sm">{subtask.description}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No subtasks available</div>
            )}
          </TaskListPopoverContent>
        </TaskListPopover>

        {/* Task name below circle */}
        <div className="mt-2 text-center relative">
          <div
            className={cn(
              "font-medium px-3 py-1 bg-white rounded-md shadow-sm border border-gray-100",
              !isAvailable && task.status !== "done" && "opacity-70",
            )}
          >
            {task.title}
          </div>
        </div>
      </div>
    )
  }

  // Sort tasks by ID to ensure consistent order
  const sortedTasks = tasks.sort((a, b) => a.task_id - b.task_id)

  // Define positions for S-shaped layout
  const positions = [
    { top: 0, left: "50%" },
    { top: 140, left: "35%" },
    { top: 140, left: "65%" },
    { top: 280, left: "50%" },
    { top: 420, left: "35%" },
    { top: 560, left: "25%" },
    { top: 700, left: "35%" },
    { top: 840, left: "50%" },
    { top: 980, left: "65%" },
    { top: 1120, left: "75%" },
    { top: 1260, left: "65%" },
    { top: 1400, left: "50%" },
    { top: 1540, left: "35%" },
    { top: 1680, left: "25%" },
    { top: 1820, left: "35%" },
  ]

  return (
    <div className="w-full h-full overflow-auto py-8">
      {/* Stage indicator */}
      <div className="flex items-center justify-between mb-4 mx-4 bg-[#A7D8F0]/10 p-2 rounded-md">
        <div className="flex items-center">
          <Tag className="text-[#A7D8F0] mr-2" size={18} />
          <span className="text-[#A7D8F0] text-sm">Task Overview</span>
        </div>
      </div>

      <div className="relative flex flex-col items-center w-full">
        <div className="relative" style={{ height: `${Math.max(2000, sortedTasks.length * 150)}px`, width: "100%" }}>
          {/* Render tasks in S-shaped layout */}
          {sortedTasks.map((task, index) => {
            const position = positions[index % positions.length] || { top: index * 150, left: "50%" }

            return (
              <div
                key={task.task_id}
                className="absolute transition-all duration-500 ease-in-out"
                style={{
                  top: `${position.top + Math.floor(index / positions.length) * 2000}px`,
                  left: position.left,
                  transform: "translateX(-50%)",
                }}
              >
                {renderTaskNode(task)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
