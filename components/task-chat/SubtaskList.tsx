"use client"

import { ChevronDown } from "lucide-react"
import { cn } from "@/utils/cn"
import type { Task } from "@/lib/database"

interface SubtaskListProps {
  subtasks: Task[]
  activeSubtask: number | null
  onSubtaskClick: (subtaskId: number) => void
}

export default function SubtaskList({ subtasks, activeSubtask, onSubtaskClick }: SubtaskListProps) {
  return (
    <div>
      {subtasks.map((subtask, index) => (
        <div
          key={subtask.task_id}
          className={cn(
            "overflow-hidden",
            index === 0 ? "rounded-t-lg" : "",
            index === subtasks.length - 1 ? "rounded-b-lg" : "",
          )}
        >
          <div
            className={cn(
              "p-3 flex justify-between items-center cursor-pointer border-t border-b border-gray-200 transition-all duration-200",
              index !== 0 && "border-t-0",
              subtask.status === "done" ? "bg-background" : "bg-background",
              activeSubtask === subtask.task_id && "bg-gray-50",
            )}
            onClick={() => onSubtaskClick(subtask.task_id)}
          >
            <div className="flex items-center">
              <div
                className={cn(
                  "w-6 h-6 rounded-full mr-3 flex items-center justify-center",
                  subtask.status === "done"
                    ? "bg-[#A7D8F0] text-gray-700 hover:bg-[#8ECBEB]"
                    : "border border-gray-300 hover:bg-gray-100",
                )}
              >
                {subtask.status === "done" && "✓"}
              </div>
              <span className={cn(subtask.status === "done" && "text-gray-500")}>{subtask.description}</span>
            </div>
            <ChevronDown size={18} />
          </div>
        </div>
      ))}
    </div>
  )
}
