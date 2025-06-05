"use client"

import { useTabs } from "./tab-context"

interface HomeTabProps {
  projectStage?: "ideation" | "development"
}

export default function HomeTab({ projectStage = "development" }: HomeTabProps) {
  const { activeTabId, updateTabContent } = useTabs()

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Project Home</h2>
      <p>This project is in the ideation stage. Please use the Task List to manage your project tasks.</p>
    </div>
  )
}
