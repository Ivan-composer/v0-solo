"use client"

import { useState, useEffect } from "react"
import { getNewsItems, getNewsSources, type NewsItem, type NewsSource } from "@/lib/database"
import NewsList from "./news-list"
import SourceSettings from "./source-settings"
import { Button } from "@/components/ui/button"
import { Settings, RefreshCw } from "lucide-react"
import { cn } from "@/utils/cn"

interface NewsTabProps {
  projectId: number | string
  onOpenNewsChat?: (newsId: number) => void
}

export default function NewsTab({ projectId, onOpenNewsChat }: NewsTabProps) {
  const [showSources, setShowSources] = useState(false)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [newsSources, setNewsSources] = useState<NewsSource[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<"new" | "saved" | "archived">("new")

  const loadNewsItems = async () => {
    try {
      console.log("Loading news items for project:", projectId)
      const items = await getNewsItems(projectId)
      console.log(`Loaded ${items.length} news items`)
      setNewsItems(items)
    } catch (error) {
      console.error("Error loading news items:", error)
    }
  }

  const loadNewsSources = async () => {
    try {
      const sources = await getNewsSources(projectId)
      setNewsSources(sources)
    } catch (error) {
      console.error("Error loading news sources:", error)
    }
  }

  const loadData = async () => {
    setLoading(true)
    await Promise.all([loadNewsItems(), loadNewsSources()])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [projectId])

  const handleOpenNewsChat = (newsId: number) => {
    console.log("Opening news chat for ID:", newsId)
    if (onOpenNewsChat) {
      onOpenNewsChat(newsId)
    }
  }

  const handleRefreshNews = async () => {
    await loadNewsItems()
  }

  const handleSourcesChange = async () => {
    await loadNewsSources()
    await loadNewsItems()
    // Return to news feed view after making changes to sources
    setShowSources(false)
  }

  const toggleSourcesView = () => {
    setShowSources(!showSources)
  }

  const filteredNewsItems = newsItems.filter((item) => {
    if (activeFilter === "new") return item.status === "new"
    if (activeFilter === "saved") return item.status === "backlog"
    if (activeFilter === "archived") return item.status === "read" || item.status === "dismissed"
    return true
  })

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="pt-6 px-6 pb-2">
        <div className="w-full max-w-[700px] mx-auto">
          {!showSources ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">News Feed</h2>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={handleRefreshNews} title="Refresh News">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={toggleSourcesView} title="Manage Sources">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Mode selector - full width */}
              <div className="flex w-full bg-gray-100 p-1 rounded-lg dark:bg-gray-800">
                <button
                  onClick={() => setActiveFilter("new")}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
                    activeFilter === "new"
                      ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-primary"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
                  )}
                >
                  <span>New</span>
                </button>

                <button
                  onClick={() => setActiveFilter("saved")}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
                    activeFilter === "saved"
                      ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-primary"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
                  )}
                >
                  <span>Saved</span>
                </button>

                <button
                  onClick={() => setActiveFilter("archived")}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
                    activeFilter === "archived"
                      ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-primary"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
                  )}
                >
                  <span>Archived</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">News Sources</h2>
              <Button variant="ghost" size="icon" onClick={toggleSourcesView} title="Back to News">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="w-full max-w-[700px] mx-auto p-6 pt-2">
          {showSources ? (
            <SourceSettings sources={newsSources} projectId={projectId} onSourcesChange={handleSourcesChange} />
          ) : (
            <NewsList newsItems={filteredNewsItems} onOpenNewsChat={handleOpenNewsChat} onRefresh={handleRefreshNews} />
          )}
        </div>
      </div>
    </div>
  )
}
