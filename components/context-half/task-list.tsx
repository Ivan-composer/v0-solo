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
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { JSX } from "react/jsx-runtime"
import ReturnHomeButton from "./return-home-button"
import { TaskListPopover, TaskListPopoverContent, TaskListPopoverTrigger } from "./tasklistpopover"

// Add a new type for Sprint at the top of the file, after the existing imports
type Sprint = {
  number: number
  name: string
  tasks: Task[]
}

// Define TaskGroup type
type TaskGroup = {
  id: string
  name: string
  tasks: Task[]
}

interface TaskListProps {
  projectStage: "ideation" | "development"
}

export default function TaskList({ projectStage }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [subtasks, setSubtasks] = useState<{ [key: number]: Task[] }>({})
  const [loading, setLoading] = useState(true)
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null)
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([])
  const [viewMode, setViewMode] = useState<"map" | "list">("map")
  const [expandedSprints, setExpandedSprints] = useState<Record<number, boolean>>({})

  // Determine if we're in post-idea stage (development)
  const isPostIdea = projectStage === "development"

  // Position mapping for S-shaped layout
  const positionMap = {
    "far-left": "calc(50% - 200px)",
    left: "calc(50% - 100px)",
    center: "50%",
    right: "calc(50% + 100px)",
    "far-right": "calc(50% + 200px)",
  }

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const tasksData = await getAllTasks()

      // Log the tasks to see what we're getting
      console.log("Loaded tasks:", tasksData)

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

      // Initialize all sprints as expanded
      const initialExpandedState: Record<number, boolean> = {}
      const TASKS_PER_SPRINT = 3
      const sprintCount = Math.ceil(tasksData.length / TASKS_PER_SPRINT)
      for (let i = 1; i <= sprintCount; i++) {
        initialExpandedState[i] = true
      }
      setExpandedSprints(initialExpandedState)
    } catch (error) {
      console.error("Error loading tasks:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Toggle sprint expansion
  const toggleSprintExpansion = (sprintNumber: number) => {
    setExpandedSprints((prev) => ({
      ...prev,
      [sprintNumber]: !prev[sprintNumber],
    }))
  }

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

  // Define task icons - updated with new icons for e-commerce tasks
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
      // New e-commerce task icons
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

    return iconMap[task.description] || <Award className="w-5 h-5" />
  }

  // Build the task dependency tree
  const buildTaskTree = () => {
    // Create a map for quick task lookup
    const taskMap = new Map<number, Task>()
    tasks.forEach((task) => taskMap.set(task.task_id, task))

    // Find root tasks (tasks with no dependencies)
    const rootTasks = tasks.filter((task) => !task.dependent_on_tasks || task.dependent_on_tasks.length === 0)

    // Group tasks by what they depend on
    const dependencyGroups = new Map<number, Task[]>()

    tasks.forEach((task) => {
      if (task.dependent_on_tasks && task.dependent_on_tasks.length > 0) {
        // Group by the first dependency (for simplicity)
        const dependsOnId = task.dependent_on_tasks[0]

        if (!dependencyGroups.has(dependsOnId)) {
          dependencyGroups.set(dependsOnId, [])
        }

        dependencyGroups.get(dependsOnId)?.push(task)
      }
    })

    return { rootTasks, dependencyGroups, taskMap }
  }

  const { rootTasks, dependencyGroups, taskMap } = buildTaskTree()

  // Calculate progress for a task based on its subtasks
  const calculateProgress = (taskId: number): number => {
    const taskSubtasks = subtasks[taskId] || []
    if (taskSubtasks.length === 0) return 0

    const completedSubtasks = taskSubtasks.filter((subtask) => subtask.status === "done").length
    return (completedSubtasks / taskSubtasks.length) * 100
  }

  // Updated renderProgressCircle function with 5px stroke width
  const renderProgressCircle = (progress: number, size = 80, status: string) => {
    // Use a 5px stroke width
    const strokeWidth = 5 // Changed from 12px to 5px for a more balanced look

    // Use a simple radius calculation that ensures the circle is visible
    const radius = size / 2 - strokeWidth / 2 - 2

    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference

    // Set color based on status
    let progressColor = "#9CA3AF" // Default gray
    if (status === "done") {
      progressColor = "#A7D8F0" // Changed from blue to #A7D8F0
    } else if (status === "in_progress") {
      progressColor = "#F97316" // Orange for in-progress tasks
    }

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute">
          {/* Background circle (gray line for remaining progress) */}
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth / 2} />

          {/* Progress circle (colored line for completed progress) */}
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

  // Render a task node - NO HOOKS INSIDE THIS FUNCTION
  const renderTaskNode = (task: Task, sprintNumber?: number) => {
    const isAvailable = isTaskAvailable(task, tasks)
    const progress = calculateProgress(task.task_id)
    // Always show the progress circle, even if there are no subtasks
    const hasSubtasks = true // Changed from: subtasks[task.task_id]?.length > 0

    return (
      <div className="flex flex-col items-center relative z-10">
        {/* Task circle with Popover */}
        <TaskListPopover>
          <TaskListPopoverTrigger>
            <div className="relative w-20 h-20">
              {/* Progress circle - always show it */}
              {renderProgressCircle(progress, 80, task.status)}

              <button
                type="button"
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 absolute", // Changed back to w-16 h-16
                  "bg-white text-gray-700 shadow-md hover:shadow-lg",
                  "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20", // Center the button
                  task.status === "done"
                    ? "border-0" // Remove border for completed tasks
                    : task.task_id === activeTaskId
                      ? "border-0" // Remove border for active tasks
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
                        ? "text-[#A7D8F0]" // Changed from blue to #A7D8F0
                        : task.status === "in_progress"
                          ? "text-orange-500" // Orange for in-progress tasks
                          : "text-gray-700",
                  )}
                >
                  {!isAvailable && task.status !== "done" ? <Lock className="w-5 h-5" /> : getTaskIcon(task)}
                </div>
              </button>

              {/* Glow effect for active tasks - changed to match status colors */}
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
                <h4 className="font-semibold">{task.description}</h4>
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
                            depTask?.status === "done" ? "bg-[#A7D8F0]" : "bg-gray-400", // Changed from blue to #A7D8F0
                          )}
                        ></div>
                        <span>{depTask?.description || `Task #${depId}`}</span>
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
                        subtask.status === "done" ? "bg-[#A7D8F0]" : "bg-gray-300", // Changed from blue to #A7D8F0
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
            {task.description}
          </div>
        </div>
      </div>
    )
  }

  // Add a function to organize tasks into sprints
  const organizeTasksIntoSprints = (tasks: Task[]): Sprint[] => {
    const TASKS_PER_SPRINT = 3
    const sprints: Sprint[] = []

    // Sort tasks by their dependencies to ensure proper order
    const sortedTasks = [...tasks].sort((a, b) => {
      // If b depends on a, a should come first
      if (b.dependent_on_tasks?.includes(a.task_id)) return -1
      // If a depends on b, b should come first
      if (a.dependent_on_tasks?.includes(b.task_id)) return 1
      // Otherwise, sort by task_id
      return a.task_id - b.task_id
    })

    // Group tasks into sprints
    for (let i = 0; i < sortedTasks.length; i += TASKS_PER_SPRINT) {
      const sprintTasks = sortedTasks.slice(i, i + TASKS_PER_SPRINT)
      sprints.push({
        number: Math.floor(i / TASKS_PER_SPRINT) + 1,
        name: `Sprint ${Math.floor(i / TASKS_PER_SPRINT) + 1}`,
        tasks: sprintTasks,
      })
    }

    return sprints
  }

  // Find tasks by description or create a mock task if not found
  const getTaskByDescription = (description: string, taskId?: number, dependsOn?: number) => {
    const existingTask = tasks.find((t) => t.description === description)
    if (existingTask) return existingTask

    // Create a mock task if not found
    return {
      task_id: taskId || Math.floor(Math.random() * 1000) + 100, // Generate a random ID if not provided
      description: description,
      parent_task_id: null,
      status: "planned",
      dependent_on_tasks: dependsOn ? [dependsOn] : [],
    } as Task
  }

  // Get task status color
  const getTaskStatusColor = (task?: Task) => {
    if (!task) return "bg-gray-300"
    return task.status === "done" ? "bg-[#A7D8F0]" : task.status === "in_progress" ? "bg-orange-500" : "bg-gray-300" // Changed from blue to #A7D8F0
  }

  // If we're in post-idea stage (development), show a different UI
  if (isPostIdea) {
    const sprints = organizeTasksIntoSprints(tasks)

    return (
      <div className="w-full h-full overflow-auto p-6">
        {/* Stage indicator for development stage - updated color */}
        <div className="flex items-center justify-between mb-4 bg-[#A7D8F0]/10 p-2 rounded-md">
          <div className="flex items-center">
            <Tag className="text-[#A7D8F0] mr-2" size={18} />
            <span className="text-[#A7D8F0] text-sm">Development Stage View</span>
          </div>
          <ReturnHomeButton />
        </div>

        <h2 className="text-xl font-semibold mb-4">Sprint Planning</h2>

        {/* Render tasks grouped by sprints */}
        <div className="space-y-8">
          {sprints.map((sprint) => (
            <div key={sprint.number} className="border border-[#A7D8F0]/30 rounded-lg overflow-hidden">
              <div className="bg-[#A7D8F0]/10 p-3 border-b border-[#A7D8F0]/30">
                <h3 className="font-medium text-[#A7D8F0]">
                  Sprint {sprint.number}
                  <span className="text-sm font-normal ml-2">
                    ({sprint.tasks.filter((t) => t.status === "done").length}/{sprint.tasks.length} completed)
                  </span>
                </h3>
              </div>
              <div className="space-y-2 p-3">
                {sprint.tasks.map((task) => (
                  <TaskListPopover key={task.task_id}>
                    <TaskListPopoverTrigger>
                      <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all cursor-pointer bg-white">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="relative w-10 h-10 mr-3">
                              {/* Progress circle for sprint view - always show it */}
                              {renderProgressCircle(calculateProgress(task.task_id), 40, task.status)}
                              <div
                                className={cn(
                                  "w-7 h-7 rounded-full flex items-center justify-center absolute", // Adjusted from w-6 h-6 to w-7 h-7
                                  "bg-white shadow-sm",
                                  "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20", // Center the button
                                  task.status === "done"
                                    ? "border-0" // Remove border
                                    : task.task_id === activeTaskId
                                      ? "border-0" // Remove border
                                      : "",
                                )}
                              >
                                {/* Task icon */}
                                <div
                                  className={cn(
                                    task.status === "done"
                                      ? "text-[#A7D8F0]" // Changed from blue to #A7D8F0
                                      : task.status === "in_progress"
                                        ? "text-orange-500" // Orange
                                        : "text-gray-500",
                                  )}
                                >
                                  {getTaskIcon(task)}
                                </div>
                              </div>
                              {/* Glow effect for active tasks - changed to match status colors */}
                              {task.status === "in_progress" && (
                                <div className="absolute inset-0 rounded-full bg-orange-500/10 -z-10 blur-sm"></div>
                              )}
                              {task.status === "done" && (
                                <div className="absolute inset-0 rounded-full bg-[#A7D8F0]/10 -z-10 blur-sm"></div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{task.description}</h3>
                            </div>
                          </div>
                          <div
                            className={cn(
                              "px-2 py-1 text-xs rounded-full",
                              task.status === "done"
                                ? "bg-[#A7D8F0]/20 text-[#A7D8F0]" // Changed from blue to #A7D8F0
                                : task.status === "in_progress"
                                  ? "bg-orange-100 text-orange-800" // Orange
                                  : "bg-gray-100 text-gray-800",
                            )}
                          >
                            {task.status === "done"
                              ? "Completed"
                              : task.status === "in_progress"
                                ? "In Progress"
                                : "Planned"}
                          </div>
                        </div>
                      </div>
                    </TaskListPopoverTrigger>
                    <TaskListPopoverContent className="w-[280px] p-4" side="right" align="start" sideOffset={8}>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <h4 className="font-semibold">{task.description}</h4>
                          <button
                            onClick={() => openTaskInChat(task.task_id)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                            title="Open in chat"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Subtasks section */}
                        {subtasks[task.task_id]?.length > 0 ? (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-500">Subtasks:</div>
                            {subtasks[task.task_id].map((subtask) => (
                              <div key={subtask.task_id} className="flex items-center">
                                <div
                                  className={cn(
                                    "w-4 h-4 rounded-full mr-2 flex-shrink-0",
                                    subtask.status === "done" ? "bg-[#A7D8F0]" : "bg-gray-300", // Changed from blue to #A7D8F0
                                  )}
                                ></div>
                                <span className="text-sm">{subtask.description}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No subtasks available</div>
                        )}
                      </div>
                    </TaskListPopoverContent>
                  </TaskListPopover>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Create a hardcoded list of all tasks to ensure we display everything
  // This is a fallback in case the database tasks aren't loading properly
  const allTasks = [
    // Original tasks
    getTaskByDescription("Market Research", 1),
    getTaskByDescription("Target Audience Definition", 2, 1),
    getTaskByDescription("Value Proposition", 3, 1),
    getTaskByDescription("Competitive Analysis", 4, 2),
    getTaskByDescription("Feature Prioritization", 5, 4),
    // New e-commerce tasks
    getTaskByDescription("Payment Gateway Integration", 10, 5),
    getTaskByDescription("Product Catalog Design", 11, 3),
    getTaskByDescription("User Authentication System", 12, 2),
    getTaskByDescription("Shopping Cart Functionality", 13, 11),
    getTaskByDescription("Order Management System", 14, 13),
    getTaskByDescription("Inventory Management", 15, 14),
    getTaskByDescription("Search & Filter Implementation", 16, 11),
    getTaskByDescription("User Reviews & Ratings", 17, 12),
    getTaskByDescription("Shipping Integration", 18, 14),
    getTaskByDescription("Analytics Dashboard", 19, 14),
  ]

  // Use the combined list of tasks from the database and our hardcoded list
  const combinedTasks = [...new Map([...tasks, ...allTasks].map((task) => [task.task_id, task])).values()]

  // Sort tasks by ID to ensure consistent order
  const sortedTasks = combinedTasks.sort((a, b) => a.task_id - b.task_id)

  // Define the positions for the S-shaped layout
  // Added more positions for the additional tasks with adjusted horizontal spacing
  const positions = [
    { top: 0, left: "50%" }, // Center (Market Research)
    { top: 140, left: "35%" }, // Left (Target Audience) - moved from 30% to 35%
    { top: 140, left: "65%" }, // Right (Value Proposition) - moved from 70% to 65%
    { top: 280, left: "50%" }, // Center (Competitive Analysis)
    { top: 420, left: "35%" }, // Left (Feature Prioritization) - moved from 30% to 35%
    { top: 560, left: "25%" }, // Far Left (Payment Gateway) - moved from 20% to 25%
    { top: 700, left: "35%" }, // Left (Product Catalog) - moved from 30% to 35%
    { top: 840, left: "50%" }, // Center (User Authentication)
    { top: 980, left: "65%" }, // Right (Shopping Cart) - moved from 70% to 65%
    { top: 1120, left: "75%" }, // Far Right (Order Management) - moved from 80% to 75%
    { top: 1260, left: "65%" }, // Right (Inventory Management) - moved from 70% to 65%
    { top: 1400, left: "50%" }, // Center (Search & Filter)
    { top: 1540, left: "35%" }, // Left (User Reviews) - moved from 30% to 35%
    { top: 1680, left: "25%" }, // Far Left (Shipping Integration) - moved from 20% to 25%
    { top: 1820, left: "35%" }, // Left (Analytics Dashboard) - moved from 30% to 35%
  ]

  // Calculate sprint boundaries
  const calculateSprintBoundaries = () => {
    const TASKS_PER_SPRINT = 3
    const boundaries = []

    for (let i = 1; i <= Math.ceil(sortedTasks.length / TASKS_PER_SPRINT); i++) {
      const taskIndex = i * TASKS_PER_SPRINT - 1
      if (taskIndex < positions.length) {
        boundaries.push(positions[taskIndex].top + 110) // 110px below the last task in sprint
      }
    }

    return boundaries
  }

  // Group tasks by sprint for the list view
  const getTasksBySprintForList = () => {
    const TASKS_PER_SPRINT = 3
    const sprints = []

    // Sort tasks by their dependencies to ensure proper order
    const sortedTasks = [...combinedTasks].sort((a, b) => {
      // If b depends on a, a should come first
      if (b.dependent_on_tasks?.includes(a.task_id)) return -1
      // If a depends on b, b should come first
      if (a.dependent_on_tasks?.includes(b.task_id)) return 1
      // Otherwise, sort by task_id
      return a.task_id - b.task_id
    })

    // Group tasks into sprints
    for (let i = 0; i < sortedTasks.length; i += TASKS_PER_SPRINT) {
      const sprintTasks = sortedTasks.slice(i, i + TASKS_PER_SPRINT)
      sprints.push({
        number: Math.floor(i / TASKS_PER_SPRINT) + 1,
        name: `Sprint ${Math.floor(i / TASKS_PER_SPRINT) + 1}`,
        tasks: sprintTasks,
      })
    }

    return sprints
  }

  // Original idea stage UI with S-shaped layout
  return (
    <div className="w-full h-full overflow-auto py-8">
      {/* Stage indicator for ideation stage - updated color */}
      <div className="flex items-center justify-between mb-4 mx-4 bg-[#A7D8F0]/10 p-2 rounded-md">
        <div className="flex items-center">
          <Tag className="text-[#A7D8F0] mr-2" size={18} />
          <span className="text-[#A7D8F0] text-sm">Ideation Stage View</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode("map")}
            className={cn(
              "px-3 py-1 text-xs rounded-md transition-colors",
              viewMode === "map" ? "bg-[#A7D8F0] text-white" : "bg-white text-gray-600 hover:bg-gray-100",
            )}
          >
            Map View
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "px-3 py-1 text-xs rounded-md transition-colors",
              viewMode === "list" ? "bg-[#A7D8F0] text-white" : "bg-white text-gray-600 hover:bg-gray-100",
            )}
          >
            List View
          </button>
        </div>
      </div>

      <div className="relative flex flex-col items-center w-full">
        {viewMode === "map" ? (
          // S-SHAPED TASK LAYOUT
          <div className="relative" style={{ height: "2000px", width: "100%" }}>
            {/* SVG for sprint dividers */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
              {/* Sprint dividers */}
              <g className="sprint-dividers">
                {calculateSprintBoundaries().map((boundary, index) => (
                  <g key={index}>
                    <line
                      x1="0%"
                      y1={`${boundary}px`}
                      x2="100%"
                      y2={`${boundary}px`}
                      stroke="#F0EEE6"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    <text x="10%" y={`${boundary - 5}px`} fill="#F0EEE6" fontSize="14" fontWeight="bold">
                      Sprint {index + 1}
                    </text>
                  </g>
                ))}
              </g>
            </svg>

            {/* Render tasks in S-shaped layout */}
            {sortedTasks.map((task, index) => {
              if (index >= positions.length) return null // Skip if we don't have a position defined

              const position = positions[index]

              return (
                <div
                  key={task.task_id}
                  className="absolute transition-all duration-500 ease-in-out"
                  style={{
                    top: `${position.top}px`,
                    left: position.left,
                    transform: "translateX(-50%)",
                  }}
                >
                  {renderTaskNode(task)}
                </div>
              )
            })}
          </div>
        ) : (
          // LIST VIEW LAYOUT - Redesigned to match news-list style
          <div className="w-full max-w-3xl mx-auto">
            {/* Group tasks by sprint */}
            {getTasksBySprintForList().map((sprint) => (
              <div key={sprint.number} className="mb-6">
                {/* Sprint header - similar to news-list section headers but subtle */}
                <div
                  className="flex items-center justify-between py-2 px-3 mb-2 border-b border-gray-100 cursor-pointer"
                  onClick={() => toggleSprintExpansion(sprint.number)}
                >
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500">Sprint {sprint.number}</span>
                    <span className="ml-2 text-xs text-gray-400">
                      ({sprint.tasks.filter((t) => t.status === "done").length}/{sprint.tasks.length})
                    </span>
                  </div>
                  <div className="text-gray-400">
                    {expandedSprints[sprint.number] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Task list - styled like news-list */}
                {expandedSprints[sprint.number] && (
                  <div className="divide-y divide-gray-100">
                    {sprint.tasks.map((task) => {
                      const progress = calculateProgress(task.task_id)
                      const isAvailable = isTaskAvailable(task, tasks)

                      return (
                        <div
                          key={task.task_id}
                          className="border-b border-gray-200 py-4 px-4 transition-all duration-200 cursor-pointer hover:bg-gray-50"
                          onClick={() => openTaskInChat(task.task_id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              {/* Task icon with progress circle */}
                              <div className="relative w-10 h-10 mt-1">
                                {renderProgressCircle(progress, 40, task.status)}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div
                                    className={cn(
                                      "w-6 h-6 rounded-full flex items-center justify-center bg-white",
                                      task.status === "done"
                                        ? "text-[#A7D8F0]"
                                        : task.status === "in_progress"
                                          ? "text-orange-500"
                                          : "text-gray-500",
                                    )}
                                  >
                                    {!isAvailable && task.status !== "done" ? (
                                      <Lock className="w-4 h-4" />
                                    ) : (
                                      getTaskIcon(task)
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h3 className="font-semibold text-lg">{task.description}</h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  {task.dependent_on_tasks && task.dependent_on_tasks.length > 0 && (
                                    <>
                                      <span>Dependencies: </span>
                                      <span className="mx-1">
                                        {task.dependent_on_tasks
                                          .map((depId) => {
                                            const depTask = tasks.find((t) => t.task_id === depId)
                                            return depTask ? depTask.description : `Task #${depId}`
                                          })
                                          .join(", ")}
                                      </span>
                                    </>
                                  )}

                                  {subtasks[task.task_id]?.length > 0 && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <span>
                                        {subtasks[task.task_id].filter((s) => s.status === "done").length}/
                                        {subtasks[task.task_id].length} subtasks
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Status badge */}
                            <div
                              className={cn(
                                "px-2 py-1 text-xs rounded-full",
                                task.status === "done"
                                  ? "bg-[#A7D8F0]/20 text-[#A7D8F0]"
                                  : task.status === "in_progress"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-gray-100 text-gray-800",
                              )}
                            >
                              {task.status === "done"
                                ? "Completed"
                                : task.status === "in_progress"
                                  ? "In Progress"
                                  : "Planned"}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
