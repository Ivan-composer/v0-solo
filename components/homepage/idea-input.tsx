"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Sparkles, Twitter } from "lucide-react"

export default function IdeaInput() {
  const [idea, setIdea] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (idea.trim()) {
      // In a real implementation, this would create a project and then redirect
      router.push("/projects/new-project")
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <input
            type="text"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Enter your project idea..."
            className="w-full px-4 py-3 pl-12 pr-32 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />

          <button
            type="submit"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-md hover:bg-primary/90 transition-colors"
          >
            Create
          </button>
        </div>
      </form>

      <div className="mt-4 flex space-x-2">
        <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Sparkles size={14} />
          <span>Generate ideas</span>
        </button>

        <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Twitter size={14} />
          <span>Idea based on your X account</span>
        </button>
      </div>
    </div>
  )
}
