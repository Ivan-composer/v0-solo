"use client"

import { useState } from "react"
import { ExternalLink, BookmarkPlus, X, ChevronDown, ChevronUp, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/utils/cn"
import { type NewsItem, markNewsItemAsRead, dismissNewsItem, addNewsItemToBacklog } from "@/lib/database"

interface NewsCardProps {
  item: NewsItem
  onOpenNewsChat?: (newsId: number) => void
  onStatusChange?: () => Promise<void>
}

export default function NewsCard({ item, onOpenNewsChat, onStatusChange }: NewsCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState(item.status)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleToggleExpand = () => {
    setExpanded(!expanded)
  }

  const handleOpenChat = () => {
    if (onOpenNewsChat) {
      // Mark as read when opening
      if (item.status === "new") {
        handleMarkAsRead()
      }

      // Dispatch a custom event to switch to news chat on the left side ONLY
      const event = new CustomEvent("switch-to-news-chat", {
        detail: { newsId: item.id },
      })
      document.dispatchEvent(event)

      // Also call the provided callback, but this should NOT change the right panel
      onOpenNewsChat(item.id)
    } else {
      console.error("onOpenNewsChat function is not provided")
      alert("Chat functionality is not available")
    }
  }

  const handleMarkAsRead = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    try {
      const result = await markNewsItemAsRead(item.id)
      if (result) {
        setStatus("read")
        if (onStatusChange) await onStatusChange()
      }
    } catch (err) {
      console.error("Error marking as read:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDismiss = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    try {
      const result = await dismissNewsItem(item.id)
      if (result) {
        setStatus("dismissed")
        if (onStatusChange) await onStatusChange()
      }
    } catch (err) {
      console.error("Error dismissing item:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddToBacklog = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    try {
      const result = await addNewsItemToBacklog(item.id, item.project_id)
      if (result) {
        setStatus("backlog")
        if (onStatusChange) await onStatusChange()
      }
    } catch (err) {
      console.error("Error adding to backlog:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div
      className={cn(
        "border-t border-b py-4 px-4 transition-all duration-200 cursor-pointer",
        "hover:bg-gray-50",
        "first:border-t-0 last:border-b-0",
      )}
      onClick={handleToggleExpand}
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start space-x-3">
              {item.favicon_url && (
                <img
                  src={item.favicon_url || "/placeholder.svg"}
                  alt={`${item.source_name} favicon`}
                  className="w-5 h-5 mt-1"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = "none"
                  }}
                />
              )}
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span>{item.source_name}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}</span>
                  {status === "backlog" && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="text-green-600 font-medium">Added to backlog</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleOpenChat()
              }}
              className="bg-[#FF6B6B]/10 text-[#FF6B6B] hover:bg-[#FF6B6B]/20 hover:text-[#FF6B6B] p-2 rounded-md flex items-center gap-1"
              aria-label="Discuss this news"
              title="Open chat about this news item on the left panel"
            >
              <MessageSquare size={16} />
              <span className="text-xs font-medium">Chat</span>
            </button>
            <button className="text-gray-500 hover:text-gray-700 p-1" aria-label={expanded ? "Collapse" : "Expand"}>
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
            {item.summary && <p className="text-gray-700">{item.summary}</p>}

            {item.implementation_advice && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mt-3">
                <h4 className="font-medium text-blue-800 mb-1">Implementation Advice</h4>
                <p className="text-gray-700">{item.implementation_advice}</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
              <div className="flex space-x-2">
                {status !== "backlog" && (
                  <button
                    onClick={handleAddToBacklog}
                    disabled={isProcessing}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <BookmarkPlus size={16} className="mr-1" />
                    Save to Ideas
                  </button>
                )}

                {status !== "dismissed" && (
                  <button
                    onClick={handleDismiss}
                    disabled={isProcessing}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <X size={16} className="mr-1" />
                    Archive
                  </button>
                )}
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-[#FF6B6B] hover:text-[#FF6B6B]/80 px-2 py-1 rounded hover:bg-[#FF6B6B]/10"
              >
                <ExternalLink size={16} className="mr-1" />
                Read full article
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
