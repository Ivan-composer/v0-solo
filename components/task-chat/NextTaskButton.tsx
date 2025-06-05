"use client"

import { ArrowRight } from "lucide-react"
import type { Task } from "@/lib/database"

interface NextTaskButtonProps {
  currentTaskId: number | null | undefined
  tasks: Task[]
  onSwitchTask?: (taskId: number) => void
}

export default function NextTaskButton({ currentTaskId, tasks, onSwitchTask }: NextTaskButtonProps) {
  const handleNextTask = () => {
    if (!currentTaskId || !onSwitchTask) return

    const currentIndex = tasks.findIndex((t) => t.task_id === currentTaskId)
    if (currentIndex < tasks.length - 1) {
      onSwitchTask(tasks[currentIndex + 1].task_id)
    }
  }

  // Find the next task in the queue
  const currentIndex = currentTaskId ? tasks.findIndex((t) => t.task_id === currentTaskId) : -1
  const nextTask = currentIndex >= 0 && currentIndex < tasks.length - 1 ? tasks[currentIndex + 1] : null

  return (
    <div className="mt-4">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
        onClick={handleNextTask}
        disabled={!nextTask}
      >
        <span className="text-muted-foreground">Next Task</span>
        <div className="flex items-center text-foreground">
          <span>{nextTask ? nextTask.description : "No more tasks"}</span>
          <ArrowRight size={18} className="ml-2" />
        </div>
      </button>
    </div>
  )
}
