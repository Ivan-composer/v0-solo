"use client"

import { ChevronDown } from "lucide-react"
import { cn } from "@/utils/cn"
import type { Task } from "@/lib/database"

interface SubtaskListProps {
  subtasks: Task[]
  activeSubtask: string | null
  onSubtaskClick: (subtaskId: string) => void
}

export default function SubtaskList({ subtasks, activeSubtask, onSubtaskClick }: SubtaskListProps) {
  return (
    <div>
      {subtasks.map((subtask, index) => (
        <div
          key={subtask.id}
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
              subtask.status === "completed" ? "bg-background" : "bg-background",
              activeSubtask === subtask.id && "bg-gray-50",
            )}
            onClick={() => onSubtaskClick(subtask.id)}
          >
            <div className="flex items-center">
              <div
                className={cn(
                  "w-6 h-6 rounded-full mr-3 flex items-center justify-center",
                  subtask.status === "completed"
                    ? "bg-[#A7D8F0] text-gray-700 hover:bg-[#8ECBEB]"
                    : "border border-gray-300 hover:bg-gray-100",
                )}
              >
                {subtask.status === "completed" && "✓"}
              </div>
              <span className={cn(subtask.status === "completed" && "text-gray-500")}>{subtask.title}</span>
            </div>
            <ChevronDown size={18} />
          </div>
        </div>
      ))}
    </div>
  )
}
