"use client"

import { memo } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { Task } from "@/lib/database"

interface TaskHeaderProps {
  task: Task
  position: string
  progress: number
  expanded: boolean
  onToggleExpand: () => void
}

const TaskHeader = memo(function TaskHeader({ task, position, progress, expanded, onToggleExpand }: TaskHeaderProps) {
  return (
    <div className="bg-background border-b border-gray-200 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">{position}</span>
          <h1 className="text-lg font-semibold">{task.title}</h1>
        </div>
        <button onClick={onToggleExpand} className="p-1 hover:bg-gray-100 rounded">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  )
})

export default TaskHeader
