"use client"

import { useState } from "react"
import { Bell, MessageSquare } from "lucide-react"

export default function Header() {
  const [notifications, setNotifications] = useState(3)
  const [tasks, setTasks] = useState(5)

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold">My Projects</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-secondary transition-colors">
          <Bell size={18} className="text-muted-foreground" />
          {notifications > 0 && (
            <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>

        <button className="relative p-2 rounded-full hover:bg-secondary transition-colors">
          <MessageSquare size={18} className="text-muted-foreground" />
          {tasks > 0 && (
            <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {tasks}
            </span>
          )}
        </button>

        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
          U
        </div>
      </div>
    </header>
  )
}
