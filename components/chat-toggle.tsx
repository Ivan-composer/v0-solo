"use client"
import { cn } from "@/utils/cn"
import { useEffect, useRef, useState } from "react"

export default function ChatToggle({
  onToggle,
  showFeatureChat = false,
  showNewsChat = false,
  onCloseFeatureChat,
  onCloseNewsChat,
  currentMode = "task",
}: {
  onToggle: (mode: "master" | "task" | "feature" | "news") => void
  showFeatureChat?: boolean
  showNewsChat?: boolean
  onCloseFeatureChat?: () => void
  onCloseNewsChat?: () => void
  currentMode?: "master" | "task" | "feature" | "news"
}) {
  const handleToggle = (newMode: "master" | "task" | "feature" | "news") => {
    onToggle(newMode)
  }

  // Refs for each button to measure their positions
  const containerRef = useRef<HTMLDivElement>(null)
  const masterButtonRef = useRef<HTMLButtonElement>(null)
  const taskButtonRef = useRef<HTMLButtonElement>(null)

  // State to track the position and dimensions of the active button
  const [activeButtonStyle, setActiveButtonStyle] = useState({
    left: 0,
    width: 0,
  })

  // Update the active button style whenever the current mode changes
  useEffect(() => {
    if (!containerRef.current) return

    let targetButton: HTMLButtonElement | null = null

    if (currentMode === "master" && masterButtonRef.current) {
      targetButton = masterButtonRef.current
    } else if (currentMode === "task" && taskButtonRef.current) {
      targetButton = taskButtonRef.current
    }

    if (targetButton) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const buttonRect = targetButton.getBoundingClientRect()

      setActiveButtonStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      })
    }
  }, [currentMode, showFeatureChat, showNewsChat])

  return (
    <div ref={containerRef} className="bg-gray-100 p-1 rounded-lg inline-flex relative">
      {/* Sliding background element */}
      <div
        className="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-300"
        style={{
          left: activeButtonStyle.left,
          width: activeButtonStyle.width,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      <button
        ref={masterButtonRef}
        onClick={() => handleToggle("master")}
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-colors relative z-10",
          currentMode === "master" ? "text-purple-600" : "text-gray-600 hover:text-gray-900",
        )}
      >
        Master Chat
      </button>

      <button
        ref={taskButtonRef}
        onClick={() => handleToggle("task")}
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-colors relative z-10",
          currentMode === "task" ? "text-purple-600" : "text-gray-600 hover:text-gray-900",
        )}
      >
        Task Chat
      </button>

      {showFeatureChat && (
        <button
          onClick={onCloseFeatureChat}
          className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-purple-600 flex items-center relative z-10"
        >
          Feature Chat
          <span className="ml-2 text-xs bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center">×</span>
        </button>
      )}

      {showNewsChat && (
        <button
          onClick={onCloseNewsChat}
          className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-purple-600 flex items-center relative z-10"
        >
          News Chat
          <span className="ml-2 text-xs bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center">×</span>
        </button>
      )}
    </div>
  )
}
