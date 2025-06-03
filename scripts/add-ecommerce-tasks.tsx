"use client"

import { useState } from "react"
import { createTask, updateTaskDependencies, getAllTasks } from "@/lib/database"
import { Button } from "@/components/ui/button"

export default function AddEcommerceTasks() {
  const [status, setStatus] = useState<string>("Ready to add tasks")
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Define the new tasks for e-commerce platform
  const newTasks = [
    { description: "Payment Gateway Integration", dependencies: [5] }, // Depends on Feature Prioritization
    { description: "Product Catalog Design", dependencies: [3, 4] }, // Depends on Value Proposition and Competitive Analysis
    { description: "User Authentication System", dependencies: [2] }, // Depends on Target Audience
    { description: "Shopping Cart Functionality", dependencies: [7, 11] }, // Depends on Product Catalog and Payment Gateway
    { description: "Order Management System", dependencies: [13] }, // Depends on Shopping Cart
    { description: "Inventory Management", dependencies: [11, 14] }, // Depends on Product Catalog and Order Management
    { description: "Search & Filter Implementation", dependencies: [11] }, // Depends on Product Catalog
    { description: "User Reviews & Ratings", dependencies: [12, 13] }, // Depends on User Authentication and Shopping Cart
    { description: "Shipping Integration", dependencies: [14] }, // Depends on Order Management
    { description: "Analytics Dashboard", dependencies: [14, 15, 17] }, // Depends on Order Management, Inventory, and User Reviews
  ]

  const addTasks = async () => {
    setIsLoading(true)
    setStatus("Starting to add tasks...")

    try {
      // Get existing tasks to ensure we have the correct IDs
      const existingTasks = await getAllTasks()
      setStatus(`Found ${existingTasks.length} existing tasks`)

      // Create each task and store their IDs
      const createdTaskIds: Record<number, number> = {}

      for (let i = 0; i < newTasks.length; i++) {
        const task = newTasks[i]
        setStatus(`Creating task: ${task.description}`)

        // Create the task without dependencies first
        const createdTask = await createTask(task.description)

        if (createdTask) {
          // Store the mapping of index+10 (our reference) to actual task_id
          createdTaskIds[i + 10] = createdTask.task_id
          setStatus(`Created task: ${task.description} with ID: ${createdTask.task_id}`)
        } else {
          setStatus(`Failed to create task: ${task.description}`)
        }
      }

      // Now update dependencies for each task
      for (let i = 0; i < newTasks.length; i++) {
        const task = newTasks[i]
        const taskId = createdTaskIds[i + 10]

        if (taskId) {
          // Map the dependency references to actual task IDs
          const dependencyIds = task.dependencies
            .map((depIndex) => {
              // If it's one of our newly created tasks (index >= 10)
              if (depIndex >= 10) {
                return createdTaskIds[depIndex]
              }
              // Otherwise it's an existing task (index < 10)
              else {
                const existingTask = existingTasks.find((t) => t.task_id === depIndex)
                return existingTask ? existingTask.task_id : null
              }
            })
            .filter((id) => id !== null) as number[]

          setStatus(`Updating dependencies for task ID ${taskId}`)
          await updateTaskDependencies(taskId, dependencyIds)
        }
      }

      setStatus("All tasks added successfully!")
      setIsComplete(true)
    } catch (error) {
      console.error("Error adding tasks:", error)
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Add E-commerce Tasks</h1>

      <div className="mb-4 p-3 bg-gray-50 rounded border">
        <p className="font-medium">Status:</p>
        <p className="text-sm">{status}</p>
      </div>

      <Button onClick={addTasks} disabled={isLoading || isComplete} className="w-full">
        {isLoading ? "Adding Tasks..." : isComplete ? "Tasks Added!" : "Add E-commerce Tasks"}
      </Button>

      {isComplete && (
        <p className="mt-4 text-sm text-green-600">
          Tasks have been added successfully! Go to the Task List tab to see them.
        </p>
      )}
    </div>
  )
}
