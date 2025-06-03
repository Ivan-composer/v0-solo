"use client"

import { useState } from "react"
import { cn } from "@/utils/cn"

export default function TaskList() {
  const [selectedTask, setSelectedTask] = useState<number | null>(null)

  const taskGroups = [
    {
      title: "Research & Planning",
      tasks: [
        { id: 1, title: "Market Research", completed: false, active: true },
        { id: 2, title: "Target Audience Definition", completed: false, active: false },
        { id: 3, title: "Value Proposition", completed: false, active: false },
      ],
    },
    {
      title: "Design & Development",
      tasks: [
        { id: 4, title: "Feature List", completed: false, active: false },
        { id: 5, title: "User Flow Design", completed: false, active: false },
        { id: 6, title: "UI/UX Wireframes", completed: false, active: false },
      ],
    },
    {
      title: "Marketing & Launch",
      tasks: [
        { id: 7, title: "Marketing Strategy", completed: false, active: false },
        { id: 8, title: "Launch Plan", completed: false, active: false },
        { id: 9, title: "Post-Launch Analysis", completed: false, active: false },
      ],
    },
  ]

  const handleTaskClick = (taskId: number) => {
    setSelectedTask(taskId === selectedTask ? null : taskId)
  }

  return (
    <div className="px-8 py-4">
      {taskGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">{group.title}</h3>

          <div className="space-y-2">
            {group.tasks.map((task) => (
              <div key={task.id} className="relative">
                <button
                  onClick={() => handleTaskClick(task.id)}
                  className={cn(
                    "w-full flex items-center p-3 rounded-lg",
                    task.completed ? "bg-green-50" : task.active ? "bg-purple-50" : "bg-white",
                    "border border-gray-200 hover:border-gray-300 transition-colors",
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center mr-3",
                      task.completed
                        ? "bg-green-500 text-white"
                        : task.active
                          ? "bg-purple-500 text-white"
                          : "border border-gray-300",
                    )}
                  >
                    {task.completed && "✓"}
                    {task.active && "•"}
                  </div>
                  <span className={cn(task.completed && "line-through text-gray-500")}>{task.title}</span>
                </button>

                {selectedTask === task.id && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Estimated time:</span>
                      <span className="font-medium">2-3 hours</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={cn(
                          "font-medium",
                          task.completed ? "text-green-500" : task.active ? "text-purple-500" : "text-gray-500",
                        )}
                      >
                        {task.completed ? "Completed" : task.active ? "In Progress" : "Not Started"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
