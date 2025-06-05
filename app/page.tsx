"use client"

import { useState, useEffect } from "react"
import Header from "@/components/homepage/header"
import IdeaInput from "@/components/homepage/idea-input"
import TrendingIdeas from "@/components/homepage/trending-ideas"
import ProjectThumbnails from "@/components/homepage/project-thumbnails"
import { checkSupabaseConnection } from "@/lib/supabase"
import ModeToggle from "@/components/homepage/mode-toggle"

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [dbConnected, setDbConnected] = useState(false)

  useEffect(() => {
    // Check if we can connect to Supabase
    async function checkConnection() {
      try {
        const connected = await checkSupabaseConnection()
        setDbConnected(connected)
      } catch (err) {
        console.error("Error checking connection:", err)
        setDbConnected(false)
      } finally {
        setLoading(false)
      }
    }

    checkConnection()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="ml-3 text-gray-600">Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 overflow-auto p-4">
        {!dbConnected && (
          <div className="w-full max-w-3xl mx-auto mt-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-yellow-800 font-medium">Database Connection Notice</h3>
            <p className="text-yellow-700 text-sm mt-1">
              Running in demo mode with mock data. Some features may be limited.
            </p>
          </div>
        )}
        <ModeToggle />
        <IdeaInput />
        <TrendingIdeas />
        <ProjectThumbnails />
      </main>
    </div>
  )
}
