"use client"

import { useEffect } from "react"
import NewsCard from "./news-card"
import type { NewsItem } from "@/lib/database"

interface NewsListProps {
  newsItems: NewsItem[]
  onOpenNewsChat?: (newsId: number) => void
  onRefresh?: () => Promise<void>
}

export default function NewsList({ newsItems, onOpenNewsChat, onRefresh }: NewsListProps) {
  useEffect(() => {
    // Refresh news when component mounts
    if (onRefresh) {
      onRefresh()
    }
  }, [])

  const handleStatusChange = async () => {
    if (onRefresh) {
      await onRefresh()
    }
  }

  if (newsItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <p className="text-gray-500 mb-4">No news items found</p>
      </div>
    )
  }

  return (
    <div className="divide-gray-100">
      {newsItems.map((item) => (
        <NewsCard key={item.id} item={item} onOpenNewsChat={onOpenNewsChat} onStatusChange={handleStatusChange} />
      ))}
    </div>
  )
}
