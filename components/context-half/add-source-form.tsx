"use client"

import type React from "react"

import { useState } from "react"
import { addNewsSource } from "@/lib/database"

interface AddSourceFormProps {
  projectId: number | string
  onCancel: () => void
  onSuccess: () => Promise<void>
}

export default function AddSourceForm({ projectId, onCancel, onSuccess }: AddSourceFormProps) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !url.trim()) {
      setError("Please fill in all fields")
      return
    }

    // Simple URL validation
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setUrl("https://" + url)
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const result = await addNewsSource(projectId, name, url)

      if (result) {
        await onSuccess()
      } else {
        setError("Failed to add source. Please try again.")
      }
    } catch (err) {
      console.error("Error adding source:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Add News Source</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="source-name" className="block text-sm font-medium text-gray-700 mb-1">
            Source Name
          </label>
          <input
            id="source-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., TechCrunch, Hacker News"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="source-url" className="block text-sm font-medium text-gray-700 mb-1">
            Website URL
          </label>
          <input
            id="source-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g., https://techcrunch.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isSubmitting}
          />
        </div>

        {error && <div className="mb-4 p-2 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Source"}
          </button>
        </div>
      </form>
    </div>
  )
}
