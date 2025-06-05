"use client"

import { memo } from "react"
import TaskQueueItem from "./components/TaskQueueItem"
import type { Task } from "@/lib/database"

interface TaskQueueProps {
  tasks: Task[]
  activeTaskId: number | null | undefined
  onSelectTask?: (taskId: number) => void
}

const TaskQueue = memo(function TaskQueue({ tasks, activeTaskId, onSelectTask }: TaskQueueProps) {
  return (
    <div className="absolute top-[calc(4rem+1px)] left-0 right-0 bg-background border-b border-gray-200 py-0 z-20 shadow-md">
      <ul>
        {tasks.map((task, index) => (
          <TaskQueueItem
            key={task.id}
            task={task}
            isActive={task.id === activeTaskId}
            isFirst={index === 0}
            isLast={index === tasks.length - 1}
            position={`${index + 1}/${tasks.length}`}
            onSelect={onSelectTask}
          />
        ))}
      </ul>
    </div>
  )
})

export default TaskQueue
