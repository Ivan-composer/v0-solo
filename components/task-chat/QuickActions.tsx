"use client"

import { memo } from "react"
import { CheckCircle } from "lucide-react"

interface QuickActionsProps {
  onMarkAsDone: () => void
}

const QuickActions = memo(function QuickActions({ onMarkAsDone }: QuickActionsProps) {
  return (
    <div className="mb-4">
      <button
        onClick={onMarkAsDone}
        className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
      >
        <CheckCircle size={16} />
        <span>Mark as Done</span>
      </button>
    </div>
  )
})

export default QuickActions
