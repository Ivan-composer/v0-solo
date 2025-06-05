"use client"

import { Home } from "lucide-react"
import { useTabs } from "./tab-context"

export default function ReturnHomeButton() {
  const { activeTabId, updateTabContent } = useTabs()

  const handleReturn = () => {
    updateTabContent(activeTabId, "home", "Project Home")
  }

  return (
    <button
      onClick={handleReturn}
      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
      title="Return to homepage"
    >
      <Home size={16} />
      <span>Home</span>
    </button>
  )
}
