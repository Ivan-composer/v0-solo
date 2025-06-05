"use client"

import { useState, useEffect } from "react"
import { getTaskById, getSubtasks, getAllTasks, type Task } from "@/lib/database"

export function useTaskData(taskId?: string | null) {
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [subtasks, setSubtasks] = useState<Task[]>([])
  const [taskQueue, setTaskQueue] = useState<Task[]>([])
  const [taskProgress, setTaskProgress] = useState(0)
  const [currentTaskPosition, setCurrentTaskPosition] = useState("N/A")
  const [loading, setLoading] = useState(true)

  const loadTaskData = async () => {
    if (!taskId || taskId === "undefined") {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Load the current task
      const task = await getTaskById(taskId)
      if (task) {
        setCurrentTask(task)

        // Load subtasks
        const subtasksData = await getSubtasks(taskId)
        setSubtasks(subtasksData)
      } else {
        console.log(`No task found with ID ${taskId}`)
        setCurrentTask(null)
        setSubtasks([])
      }
    } catch (error) {
      console.error("Error loading task data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadTaskQueue = async () => {
    try {
      const tasks = await getAllTasks()
      setTaskQueue(tasks)

      // Calculate position and progress
      if (taskId && tasks.length > 0) {
        const currentIndex = tasks.findIndex((t) => t.task_id === taskId)
        if (currentIndex !== -1) {
          setCurrentTaskPosition(`${currentIndex + 1}/${tasks.length}`)
          setTaskProgress(((currentIndex + 1) / tasks.length) * 100)
        }
      }
    } catch (error) {
      console.error("Error loading task queue:", error)
    }
  }

  useEffect(() => {
    loadTaskQueue()
    loadTaskData()
  }, [taskId])

  const reloadSubtasks = async () => {
    if (taskId && taskId !== "undefined") {
      try {
        const subtasksData = await getSubtasks(taskId)
        setSubtasks(subtasksData)
      } catch (error) {
        console.error("Error reloading subtasks:", error)
      }
    }
  }

  return {
    currentTask,
    subtasks,
    taskQueue,
    taskProgress,
    currentTaskPosition,
    loading,
    reloadSubtasks,
    loadTaskData,
  }
}
