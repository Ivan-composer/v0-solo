"use client"

import { memo } from "react"
import SubtaskItem from "./SubtaskItem"
import type { Task } from "@/lib/database"

interface SubtaskListProps {
  subtasks: Task[]
  activeSubtask: string | null
  onSubtaskClick: (subtaskId: string) => void
}

const SubtaskList = memo(function SubtaskList({ subtasks, activeSubtask, onSubtaskClick }: SubtaskListProps) {
  return (
    <div>
      {subtasks.map((subtask, index) => (
        <SubtaskItem
          key={subtask.id}
          subtask={subtask}
          isActive={activeSubtask === subtask.id}
          isFirst={index === 0}
          isLast={index === subtasks.length - 1}
          onClick={onSubtaskClick}
        />
      ))}
    </div>
  )
})

export default SubtaskList
