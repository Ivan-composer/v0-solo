"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import type { Task } from "@/lib/database"

interface TaskHeaderProps {
  task: Task
  position: string
  progress: number
  expanded: boolean
  onToggleExpand: () => void
}

export default function TaskHeader({ task, position, progress, expanded, onToggleExpand }: TaskHeaderProps) {
  // Calculate the circle properties
  const size = 70
  const strokeWidth = 5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // Parse the position to get current and total tasks
  const [current, total] = position.split("/").map((num) => Number.parseInt(num, 10))

  // Replace the entire return statement with this updated version that uses a linear progress bar

  return (
    <div className="bg-background border-b border-gray-200 py-4 cursor-pointer z-10" onClick={onToggleExpand}>
      <div className="flex items-center justify-between">
        {/* Task description and sprint position */}
        <div className="flex-grow">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{task.title}</h2>
            <span className="text-sm text-gray-500 font-medium">Sprint {position}</span>
          </div>

          {/* Linear progress bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-pink-300 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Expand/collapse icon */}
        <div className="flex-shrink-0 ml-4">{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
      </div>
    </div>
  )
}
