"use client"

import { useState } from "react"

export default function ResetPage() {
  const [isResetting, setIsResetting] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)

  const handleReset = async () => {
    if (isResetting) return

    setIsResetting(true)
    setResult(null)

    try {
      const response = await fetch("/api/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Force reload the page after a successful reset
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error) {
      setResult({ success: false, message: String(error) })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Reset Application State</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="mb-4">This will reset all tasks and subtasks to "planned" status and clear all chat messages.</p>

        <button
          onClick={handleReset}
          disabled={isResetting}
          className={`px-4 py-2 rounded-md ${
            isResetting ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isResetting ? "Resetting..." : "Reset All Tasks and Messages"}
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-md ${result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {result.message}
          {result.success && <p className="mt-2">Page will reload automatically...</p>}
        </div>
      )}
    </div>
  )
}
