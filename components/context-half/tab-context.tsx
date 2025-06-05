"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type TabType = "home" | "tasks" | "dashboard" | "files" | "news" | "backlog"

interface Tab {
  id: string
  title: string
  content: TabType
  isDefault?: boolean
}

interface TabContextType {
  tabs: Tab[]
  activeTabId: string
  addTab: (tab: Omit<Tab, "id">) => void
  closeTab: (id: string) => void
  activateTab: (id: string) => void
  updateTabContent: (id: string, content: TabType, title: string) => void
  addHomeTab: () => void
  initializeTabs: (stage: "ideation" | "development") => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

interface TabProviderProps {
  children: ReactNode
  projectId: string
}

export function TabProvider({ children, projectId }: TabProviderProps) {
  // Define default tabs but don't set them yet
  const defaultIdeationTabs = [
    { id: `tasks-${projectId}`, title: "Task List", content: "tasks" as TabType, isDefault: true },
    { id: `dashboard-${projectId}`, title: "Dashboard", content: "dashboard" as TabType, isDefault: true },
    { id: `files-${projectId}`, title: "Files", content: "files" as TabType, isDefault: true }, // Changed from "PRD" to "Files"
  ]

  const defaultDevelopmentTabs = [
    { id: `home-${projectId}`, title: "Home", content: "home" as TabType, isDefault: true },
  ]

  // Start with empty tabs
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string>("")
  const [initialized, setInitialized] = useState(false)

  // Initialize tabs based on project stage
  const initializeTabs = useCallback(
    (stage: "ideation" | "development") => {
      if (initialized) return

      const defaultIdeationTabs = [
        { id: `tasks-${projectId}`, title: "Task List", content: "tasks" as TabType, isDefault: true },
        { id: `dashboard-${projectId}`, title: "Dashboard", content: "dashboard" as TabType, isDefault: true },
        { id: `files-${projectId}`, title: "Files", content: "files" as TabType, isDefault: true }, // Changed from "PRD" to "Files"
      ]

      const defaultDevelopmentTabs = [
        { id: `home-${projectId}`, title: "Home", content: "home" as TabType, isDefault: true },
      ]

      const initialTabs = stage === "ideation" ? defaultIdeationTabs : defaultDevelopmentTabs
      setTabs(initialTabs)
      setActiveTabId(initialTabs[0].id)
      setInitialized(true)
    },
    [initialized, projectId],
  )

  const addTab = useCallback((tab: Omit<Tab, "id">) => {
    const id = `${tab.content}-${Date.now()}`
    const newTab = { ...tab, id }
    setTabs((prevTabs) => [...prevTabs, newTab])
    setActiveTabId(id)
  }, [])

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prevTabs) => {
        // Don't close if it's the only tab left
        if (prevTabs.length <= 1) return prevTabs

        // Don't close default tabs in ideation mode
        const tab = prevTabs.find((t) => t.id === id)
        if (tab?.isDefault) return prevTabs

        const newTabs = prevTabs.filter((tab) => tab.id !== id)
        // If we're closing the active tab, activate the first tab
        if (id === activeTabId && newTabs.length > 0) {
          setActiveTabId(newTabs[0].id)
        }
        return newTabs
      })
    },
    [activeTabId],
  )

  const activateTab = useCallback((id: string) => {
    setActiveTabId(id)
  }, [])

  const updateTabContent = useCallback((id: string, content: TabType, title: string) => {
    setTabs((prevTabs) => prevTabs.map((tab) => (tab.id === id ? { ...tab, content, title } : tab)))
  }, [])

  const addHomeTab = useCallback(() => {
    const id = `home-${Date.now()}`
    const newTab = { id, title: "Home", content: "home" as TabType }
    setTabs((prevTabs) => [...prevTabs, newTab])
    setActiveTabId(id)
  }, [])

  return (
    <TabContext.Provider
      value={{
        tabs,
        activeTabId,
        addTab,
        closeTab,
        activateTab,
        updateTabContent,
        addHomeTab,
        initializeTabs,
      }}
    >
      {children}
    </TabContext.Provider>
  )
}

export function useTabs() {
  const context = useContext(TabContext)
  if (context === undefined) {
    throw new Error("useTabs must be used within a TabProvider")
  }
  return context
}
