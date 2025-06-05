"use client"

import { useEffect, useRef, useState } from "react"
import { useTabs } from "./tab-context"
import { X, Plus } from "lucide-react"
import { cn } from "@/utils/cn"
import TaskList from "./task-list"
import DashboardTab from "./dashboard-tab"
import FilesTab from "./files-tab"
import HomeTab from "./home-tab"

interface TabManagerProps {
  projectStage: "ideation" | "development"
}

export default function TabManager({ projectStage }: TabManagerProps) {
  const { tabs, activeTabId, closeTab, activateTab, addHomeTab, initializeTabs } = useTabs()
  const initializedRef = useRef(false)

  // State for tab styling
  const [hoveredTabIndex, setHoveredTabIndex] = useState<number | null>(null)
  const tabRefs = useRef<(HTMLDivElement | null)[]>([])
  const [hoveredTab, setHoveredTab] = useState<{ offsetLeft: number; offsetWidth: number } | null>(null)
  const [activeTabElement, setActiveTabElement] = useState<{ offsetLeft: number; offsetWidth: number } | null>(null)

  // Initialize tabs - use the original initialization method
  useEffect(() => {
    if (!initializedRef.current) {
      try {
        initializeTabs(projectStage)
        initializedRef.current = true
      } catch (error) {
        console.error("Error initializing tabs:", error)
      }
    }
  }, [initializeTabs, projectStage])

  // Update hover indicator
  useEffect(() => {
    if (hoveredTabIndex !== null && tabRefs.current[hoveredTabIndex]) {
      const element = tabRefs.current[hoveredTabIndex]
      if (element) {
        setHoveredTab({
          offsetLeft: element.offsetLeft,
          offsetWidth: element.offsetWidth,
        })
      }
    } else {
      setHoveredTab(null)
    }
  }, [hoveredTabIndex, tabs])

  // Update active indicator
  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTabId)
    if (activeIndex !== -1 && tabRefs.current[activeIndex]) {
      const element = tabRefs.current[activeIndex]
      if (element) {
        setActiveTabElement({
          offsetLeft: element.offsetLeft,
          offsetWidth: element.offsetWidth,
        })
      }
    }
  }, [activeTabId, tabs])

  // Initialize the refs array when tabs change
  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, tabs.length)
  }, [tabs.length])

  // Get the active tab
  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  // Helper function to extract project ID from tab ID
  const getProjectIdFromTabId = (tabId: string): string => {
    // Tab IDs are in format: "tabtype-projectId"
    // We need to extract everything after the first dash
    const dashIndex = tabId.indexOf("-")
    if (dashIndex === -1) {
      console.warn("Invalid tab ID format:", tabId)
      return "4d8682c2-7aba-4e92-9e19-e2750939e2e5" // fallback
    }
    return tabId.substring(dashIndex + 1)
  }

  // Render tab content based on the active tab
  const renderTabContent = (tab: typeof activeTab) => {
    if (!tab) {
      return <TaskList />
    }

    const projectId = getProjectIdFromTabId(tab.id)

    switch (tab.content) {
      case "home":
        return <HomeTab />
      case "tasks":
        return <TaskList />
      case "dashboard":
        return <DashboardTab />
      case "files":
        return <FilesTab projectId={projectId} />
      default:
        return <TaskList />
    }
  }

  if (tabs.length === 0) {
    return <TaskList />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-border overflow-x-auto relative">
        {/* Hover Highlight */}
        <div
          className="absolute h-[30px] transition-all duration-300 ease-out bg-primary/10 dark:bg-primary/20 rounded-[6px] flex items-center pointer-events-none"
          style={{
            left: hoveredTab?.offsetLeft + "px",
            width: hoveredTab?.offsetWidth + "px",
            opacity: hoveredTab ? 1 : 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1,
          }}
        />

        {/* Active Indicator */}
        <div
          className="absolute bottom-0 h-[2px] bg-primary dark:bg-primary transition-all duration-300 ease-out pointer-events-none"
          style={{
            left: activeTabElement?.offsetLeft + "px",
            width: activeTabElement?.offsetWidth + "px",
            zIndex: 1,
          }}
        />

        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            ref={(el) => (tabRefs.current[index] = el)}
            className={cn(
              "flex items-center px-4 py-2 cursor-pointer transition-colors duration-300 relative z-10",
              tab.id === activeTabId ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => activateTab(tab.id)}
            onMouseEnter={() => setHoveredTabIndex(index)}
            onMouseLeave={() => setHoveredTabIndex(null)}
          >
            <span className="text-sm">{tab.title}</span>
            {!tab.isDefault && (
              <button
                className="ml-2 p-1 rounded-full hover:bg-muted transition-opacity cursor-pointer"
                style={{
                  opacity: tab.id === activeTabId || index === hoveredTabIndex ? 1 : 0,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
                onMouseEnter={(e) => {
                  e.stopPropagation()
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}

        <button
          className="px-3 py-2 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors relative z-10"
          onClick={addHomeTab}
          title="Add new tab"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">{renderTabContent(activeTab)}</div>
    </div>
  )
}
