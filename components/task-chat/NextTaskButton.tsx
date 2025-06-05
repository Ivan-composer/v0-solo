"use client"

import React, { useMemo } from "react"
import { ArrowRight, Lock } from "lucide-react"
import { isTaskAvailable, type Task } from "@/lib/database"

interface NextTaskButtonProps {
  currentTaskId: string | null | undefined
  tasks: Task[]
  onSwitchTask?: (taskId: string) => void
}

const NextTaskButton = React.memo<NextTaskButtonProps>(({ currentTaskId, tasks, onSwitchTask }) => {
  const nextTask = useMemo(() => {
    if (!currentTaskId || !tasks.length) return null

    const currentIndex = tasks.findIndex((t) => t.id === currentTaskId)
    if (currentIndex === -1) return null

    // Find the next available task
    for (let i = currentIndex + 1; i < tasks.length; i++) {
      if (isTaskAvailable(tasks[i], tasks)) {
        return { task: tasks[i], isAvailable: true }
      }
    }

    // If no available task found, show next task but mark as locked
    if (currentIndex < tasks.length - 1) {
      return { task: tasks[currentIndex + 1], isAvailable: false }
    }

    return null
  }, [currentTaskId, tasks])

  const handleNextTask = React.useCallback(() => {
    if (!nextTask?.isAvailable || !onSwitchTask) return
    onSwitchTask(nextTask.task.id)
  }, [nextTask, onSwitchTask])

  if (!nextTask) return null

  return (
    <div className="mt-4">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
        onClick={handleNextTask}
        disabled={!nextTask.isAvailable}
      >
        <span className="text-muted-foreground">Next Task</span>
        <div className="flex items-center text-foreground">
          <span>{nextTask.task.title || nextTask.task.description}</span>
          {nextTask.isAvailable ? (
            <ArrowRight size={18} className="ml-2" />
          ) : (
            <Lock size={18} className="ml-2 text-gray-400" />
          )}
        </div>
      </button>
    </div>
  )
})

NextTaskButton.displayName = "NextTaskButton"

export default NextTaskButton
