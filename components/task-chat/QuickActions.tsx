"use client"

import { CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"

interface QuickActionsProps {
  onMarkAsDone: () => void
}

export default function QuickActions({ onMarkAsDone }: QuickActionsProps) {
  // In a real implementation, these could come from the database or API
  const [quickActions, setQuickActions] = useState<string[]>([
    "Analyze deeper",
    "Find alternatives",
    "Summarize",
    "Expand",
    "Simplify",
    "Examples",
  ])

  // This effect could fetch dynamic quick actions based on the current task
  useEffect(() => {
    // Fetch quick actions from API or database
    // For now, we'll use the default ones
  }, [])

  return (
    <div className="flex overflow-x-scroll overflow-y-hidden pb-3 space-x-2 no-scrollbar">
      <button
        className="px-3 py-1.5 bg-[#A7D8F0]/10 text-[#A7D8F0] rounded-md whitespace-nowrap hover:bg-[#A7D8F0]/20 transition-colors text-sm flex-shrink-0 flex items-center"
        onClick={onMarkAsDone}
      >
        <CheckCircle size={14} className="mr-1.5" />
        Mark as done
      </button>

      {quickActions.map((action, index) => (
        <button
          key={index}
          className="px-3 py-1.5 bg-secondary text-foreground rounded-md whitespace-nowrap hover:bg-secondary/80 transition-colors text-sm flex-shrink-0"
        >
          {action}
        </button>
      ))}
    </div>
  )
}
