"use client"

import { useTabs, type TabType } from "./tab-context"
import {
  FileText,
  BarChart2,
  ListTodo,
  Newspaper,
  Archive,
  Settings,
  Calendar,
  CheckCircle,
  Circle,
} from "lucide-react"

interface HomeTabProps {
  projectStage?: "ideation" | "development"
}

export default function HomeTab({ projectStage = "development" }: HomeTabProps) {
  const { activeTabId, updateTabContent } = useTabs()
  const isIdeationStage = projectStage === "ideation"

  // If we're in ideation stage, show a message
  if (isIdeationStage) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Project Home</h2>
        <p>This project is in the ideation stage. Please use the Task List to manage your project tasks.</p>
      </div>
    )
  }

  const sections = [
    { type: "tasks" as TabType, title: "Task List", icon: ListTodo, description: "View and manage project tasks" },
    {
      type: "daily" as TabType,
      title: "Daily Tasks",
      icon: Calendar,
      description: "Today's tasks and priorities",
      badge: 4,
    },
    { type: "dashboard" as TabType, title: "Dashboard", icon: BarChart2, description: "Project metrics and analytics" },
    { type: "news" as TabType, title: "News", icon: Newspaper, description: "Project updates and announcements" },
    { type: "backlog" as TabType, title: "Backlog", icon: Archive, description: "Future tasks and ideas" },
    {
      type: "prd" as TabType,
      title: "Documents",
      icon: FileText,
      description: "Product requirements and documentation",
    },
    {
      type: "settings" as TabType,
      title: "Settings",
      icon: Settings,
      description: "Project configuration and preferences",
    },
  ]

  const handleSectionClick = (type: TabType, title: string) => {
    // Update the current tab's content instead of opening a new tab
    updateTabContent(activeTabId, type, title)
  }

  // Sample task progress data for the task list visualization
  const taskProgress = [
    { status: "done", icon: <CheckCircle size={24} className="text-[#A7D8F0]" /> },
    { status: "done", icon: <CheckCircle size={24} className="text-[#A7D8F0]" /> },
    { status: "in_progress", icon: <Circle size={24} className="text-orange-500 stroke-2" /> },
    { status: "planned", icon: <Circle size={24} className="text-gray-300 stroke-2" /> },
    { status: "planned", icon: <Circle size={24} className="text-gray-300 stroke-2" /> },
  ]

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Project Home</h2>

      <div className="grid grid-cols-1 gap-6">
        {/* Special Task List Card - Full Width */}
        <div
          className="border border-border rounded-lg p-0 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer bg-card overflow-hidden"
          onClick={() => handleSectionClick("tasks", "Task List")}
        >
          <div className="flex flex-col md:flex-row h-full">
            {/* Left side - 1/3 width */}
            <div className="p-4 md:w-1/3 border-b md:border-b-0 md:border-r border-border flex flex-col justify-center">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <ListTodo size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-medium">Task List</h3>
              </div>
              <p className="text-sm text-muted-foreground">Manage project tasks and dependencies</p>
            </div>

            {/* Right side - 2/3 width */}
            <div className="p-4 md:w-2/3 flex flex-col justify-center">
              <div className="mb-2">
                <span className="text-lg font-medium text-gray-500">Stage:</span>
                <span className="ml-2 text-lg font-medium text-[#A7D8F0]">Development</span>
              </div>

              <div className="flex items-center justify-center space-x-4 mt-3">
                {taskProgress.map((task, index) => (
                  <div key={index} className="flex flex-col items-center">
                    {task.icon}
                    <span className="text-xs text-gray-500 mt-1">{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Daily Tasks and Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer bg-card h-[130px]"
            onClick={() => handleSectionClick("daily", "Daily Tasks")}
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 relative">
                <Calendar size={20} className="text-primary" />
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full">
                  4
                </span>
              </div>
              <h3 className="text-lg font-medium">Daily Tasks</h3>
            </div>
            <p className="text-sm text-muted-foreground">Today's tasks and priorities</p>
          </div>

          <div
            className="border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer bg-card h-[130px]"
            onClick={() => handleSectionClick("dashboard", "Dashboard")}
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <BarChart2 size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-medium">Dashboard</h3>
            </div>
            <p className="text-sm text-muted-foreground">Project metrics and analytics</p>
          </div>
        </div>

        {/* Row 3: News and Backlog */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer bg-card h-[130px]"
            onClick={() => handleSectionClick("news", "News")}
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 relative">
                <Newspaper size={20} className="text-primary" />
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full">
                  5
                </span>
              </div>
              <h3 className="text-lg font-medium">News</h3>
            </div>
            <p className="text-sm text-muted-foreground">Project updates and announcements</p>
          </div>

          <div
            className="border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer bg-card h-[130px]"
            onClick={() => handleSectionClick("backlog", "Backlog")}
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Archive size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-medium">Backlog</h3>
            </div>
            <p className="text-sm text-muted-foreground">Future tasks and ideas</p>
          </div>
        </div>

        {/* Row 4: Documents and Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer bg-card h-[130px]"
            onClick={() => handleSectionClick("prd", "Documents")}
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <FileText size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-medium">Documents</h3>
            </div>
            <p className="text-sm text-muted-foreground">Product requirements and documentation</p>
          </div>

          <div
            className="border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer bg-card h-[130px]"
            onClick={() => handleSectionClick("settings", "Settings")}
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Settings size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-medium">Settings</h3>
            </div>
            <p className="text-sm text-muted-foreground">Project configuration and preferences</p>
          </div>
        </div>
      </div>
    </div>
  )
}
