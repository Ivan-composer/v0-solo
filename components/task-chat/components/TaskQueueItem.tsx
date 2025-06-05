"use client"

import React from "react"
import { CheckCircle } from "lucide-react"
import { cn } from "@/utils/cn"
import type { Task } from "@/lib/database"

interface TaskQueueItemProps {
  task: Task
  index: number
  totalTasks: number
  isActive: boolean
  isCompleted: boolean
  onClick: (taskId: number) => void
}

const TaskQueueItem = React.memo(({ task, index, totalTasks, isActive, isCompleted, onClick }: TaskQueueItemProps) => {
  return (
    <li
      className={cn(
        "py-0 px-4 border-t border-b border-gray-200 flex justify-between items-center cursor-pointer h-[4rem] min-h-[4rem]",
        index === 0 && "border-t",
        index === totalTasks - 1 && "border-b",
        isActive ? "bg-[#FFD180]/20 hover:bg-[#FFD180]/30" : "hover:bg-gray-50",
        isCompleted && "bg-[#F0FDF4]/50 hover:bg-[#F0FDF4]/70",
      )}
      onClick={() => {
        if (!isActive) {
          onClick(task.id)
        }
      }}
    >
      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-500 mr-3">{`${index + 1}/${totalTasks}`}</span>
        <span
          className={cn(
            "text-base",
            isActive ? "font-medium text-gray-700" : "text-gray-700",
            isCompleted && "text-gray-700",
          )}
        >
          {task.title}
        </span>
      </div>
      {isActive && <div className="w-2 h-2 rounded-full bg-purple-500"></div>}
      {isCompleted && <CheckCircle size={16} className="text-[#15803D]" />}
    </li>
  )
})

TaskQueueItem.displayName = "TaskQueueItem"

export default TaskQueueItem
