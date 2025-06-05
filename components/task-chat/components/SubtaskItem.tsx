"use client"

import React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/utils/cn"
import type { Task } from "@/lib/database"

interface SubtaskItemProps {
  subtask: Task
  isActive: boolean
  isFirst: boolean
  isLast: boolean
  onClick: (subtaskId: string) => void
}

const SubtaskItem = React.memo(({ subtask, isActive, isFirst, isLast, onClick }: SubtaskItemProps) => {
  return (
    <div className={cn("overflow-hidden", isFirst ? "rounded-t-lg" : "", isLast ? "rounded-b-lg" : "")}>
      <div
        className={cn(
          "p-3 flex justify-between items-center cursor-pointer border-t border-b border-gray-200 transition-all duration-200",
          !isFirst && "border-t-0",
          subtask.status === "completed" ? "bg-background" : "bg-background",
          isActive && "bg-gray-50",
        )}
        onClick={() => onClick(subtask.id)}
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
  )
})

SubtaskItem.displayName = "SubtaskItem"

export default SubtaskItem
