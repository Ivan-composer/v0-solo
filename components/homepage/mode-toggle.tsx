"use client"

import { useState } from "react"
import { cn } from "../../lib/utils"

export default function ModeToggle() {
  const [mode, setMode] = useState<"new" | "existing">("new")

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 flex justify-center">
      <div className="bg-gray-100 p-1 rounded-lg inline-flex">
        <button
          onClick={() => setMode("new")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            mode === "new" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900",
          )}
        >
          New Idea
        </button>

        <button
          onClick={() => setMode("existing")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            mode === "existing" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900",
          )}
        >
          Existing Project
        </button>
      </div>
    </div>
  )
}
