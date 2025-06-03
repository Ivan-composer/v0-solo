"use client"

import { ChevronUp } from "lucide-react"
import { cn } from "@/utils/cn"
import type { Task } from "@/lib/database"
import { useState, useEffect } from "react"

interface SubtaskDetailProps {
  subtask: Task
  onSubtaskClick: (subtaskId: number) => void
  onExecute: (withComment: boolean) => void
  hasMessages: boolean
}

export default function SubtaskDetail({ subtask, onSubtaskClick, onExecute, hasMessages }: SubtaskDetailProps) {
  // This would ideally come from the database, but for now we'll use a placeholder
  const [subtaskDetails, setSubtaskDetails] = useState<string[]>([
    "Research at least 5 direct competitors",
    "Analyze their product offerings",
    "Identify their pricing strategies",
    "Note their unique selling propositions",
  ])

  // In a real implementation, we would fetch the subtask details from the database
  useEffect(() => {
    // This is where you would fetch the detailed instructions for this subtask
    // For now, we'll use the placeholder data
  }, [subtask?.task_id]) // Add optional chaining here

  // Guard clause to prevent rendering if subtask is null
  if (!subtask) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-lg">
      <div
        className="p-3 flex justify-between items-center cursor-pointer border-t border-b border-gray-200 bg-background"
        onClick={() => onSubtaskClick(subtask.task_id)}
      >
        <div className="flex items-center">
          <div
            className={cn(
              "w-6 h-6 rounded-full mr-3 flex items-center justify-center",
              subtask.status === "done"
                ? "bg-[#F0FDF4] text-gray-700 hover:bg-[#DCFCE7]"
                : "border border-gray-300 hover:bg-gray-100",
            )}
          >
            {subtask.status === "done" && "✓"}
          </div>
          <span className={cn(subtask.status === "done" && "text-gray-500")}>{subtask.description}</span>
        </div>
        <ChevronUp size={18} />
      </div>

      {/* Always show the subtask description */}
      <div className="p-4">
        <div className="mb-4 text-gray-700">
          <p>Here's what you need to do for this subtask:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            {subtaskDetails.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>

        {/* Show execute buttons only if no messages */}
        {!hasMessages && (
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              onClick={() => onExecute(false)}
            >
              Execute
            </button>
            <button
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => onExecute(true)}
            >
              Execute with comment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
