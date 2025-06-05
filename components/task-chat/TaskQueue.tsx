"use client"

import { CheckCircle } from "lucide-react"
import { cn } from "@/utils/cn"
import type { Task } from "@/lib/database"

interface TaskQueueProps {
  tasks: Task[]
  activeTaskId: number | null | undefined
  onSelectTask?: (taskId: number) => void
}

export default function TaskQueue({ tasks, activeTaskId, onSelectTask }: TaskQueueProps) {
  return (
    <div className="absolute top-[calc(4rem+1px)] left-0 right-0 bg-background border-b border-gray-200 py-0 z-20 shadow-md">
      <ul>
        {tasks.map((task, index) => {
          const isActive = task.id === activeTaskId
          const isCompleted = task.status === "done"

          return (
            <li
              key={task.id}
              className={cn(
                "py-0 px-4 border-t border-b border-gray-200 flex justify-between items-center cursor-pointer h-[4rem] min-h-[4rem]",
                index === 0 && "border-t",
                index === tasks.length - 1 && "border-b",
                isActive ? "bg-[#FFD180]/20 hover:bg-[#FFD180]/30" : "hover:bg-gray-50",
                isCompleted && "bg-[#F0FDF4]/50 hover:bg-[#F0FDF4]/70",
              )}
              onClick={() => {
                if (!isActive && onSelectTask) {
                  onSelectTask(task.id)
                }
              }}
            >
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-3">{`${index + 1}/${tasks.length}`}</span>
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
        })}
      </ul>
    </div>
  )
}
