"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, ExternalLink, BookmarkPlus, Archive, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/utils/cn"
import {
  getNewsItemById,
  markNewsItemAsRead,
  dismissNewsItem,
  addNewsItemToBacklog,
  type NewsItem,
} from "@/lib/database"
import { generateGrokResponse } from "@/lib/grok"

interface NewsChatProps {
  newsId: number
  onBack: () => void
  onStatusChange?: () => Promise<void>
}

export default function NewsChat({ newsId, onBack, onStatusChange }: NewsChatProps) {
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadNewsItem() {
      setLoading(true)
      try {
        const item = await getNewsItemById(newsId)
        if (item) {
          setNewsItem(item)

          // Mark as read if it's new
          if (item.status === "new") {
            await markNewsItemAsRead(newsId)
            if (onStatusChange) {
              await onStatusChange()
            }
          }
        } else {
          // Create a fallback item if none was returned
          const fallbackItem = {
            id: newsId,
            project_id: 2,
            title: "News Item",
            url: "https://example.com/news",
            source_name: "News Source",
            favicon_url: null,
            published_at: new Date().toISOString(),
            summary: "This news item was created as a fallback when the requested item couldn't be found.",
            implementation_advice: "Consider implementing robust error handling in your application.",
            relevance_score: 0.8,
            status: "new",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as NewsItem

          setNewsItem(fallbackItem)
          console.log("Created fallback news item:", fallbackItem)
        }
      } catch (err) {
        console.error("Error loading news item:", err)

        // Create a fallback item in case of error
        const fallbackItem = {
          id: newsId,
          project_id: 2,
          title: "Error Recovery Item",
          url: "https://example.com/news",
          source_name: "Error Recovery",
          favicon_url: null,
          published_at: new Date().toISOString(),
          summary: "This news item was created to recover from an error when loading the requested item.",
          implementation_advice: "Implement graceful error handling and fallbacks in your application.",
          relevance_score: 0.8,
          status: "new",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as NewsItem

        setNewsItem(fallbackItem)
        setError("Created fallback news item due to loading error")
      } finally {
        setLoading(false)
      }
    }

    loadNewsItem()
  }, [newsId, onStatusChange])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() || !newsItem) return

    // Add user message
    const userMessage = { role: "user" as const, content: message }
    setMessages([...messages, userMessage])
    setMessage("")
    setIsGenerating(true)

    try {
      // Prepare conversation history for Grok
      const conversationHistory = [
        {
          role: "system" as const,
          content: `You are an AI assistant helping with a news article titled "${newsItem.title}". 
          The article is from ${newsItem.source_name} and was published ${formatDistanceToNow(new Date(newsItem.published_at), { addSuffix: true })}.
          The article summary is: ${newsItem.summary || "Not available"}.
          The implementation advice is: ${newsItem.implementation_advice || "Not available"}.
          Be concise, helpful, and focus on providing actionable advice related to the article.`,
        },
        ...messages,
        userMessage,
      ]

      // Get response from Grok
      const grokResponse = await generateGrokResponse(conversationHistory)

      // Add assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: grokResponse }])
    } catch (error) {
      console.error("Error generating response:", error)
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.",
        },
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAddToBacklog = async () => {
    if (!newsItem) return

    await addNewsItemToBacklog(newsItem.id, newsItem.project_id)
    setNewsItem({ ...newsItem, status: "backlog" })

    if (onStatusChange) {
      await onStatusChange()
    }
  }

  const handleDismiss = async () => {
    if (!newsItem) return

    await dismissNewsItem(newsItem.id)
    setNewsItem({ ...newsItem, status: "dismissed" })

    if (onStatusChange) {
      await onStatusChange()
    }

    // Go back after dismissing
    onBack()
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-[64px] p-4 border-b border-gray-200 flex items-center">
          <button
            onClick={onBack}
            className="p-1 mr-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Back to news list"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error || !newsItem) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-[64px] p-4 border-b border-gray-200 flex items-center">
          <button
            onClick={onBack}
            className="p-1 mr-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Back to news list"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-semibold">Error</h2>
        </div>
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
            <p className="text-gray-700 mb-4">{error || "Failed to load news item"}</p>
            <div className="flex justify-center">
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Back to News
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* News headline and source info */}
      <div className="p-4 border-b border-gray-200">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-3">
            <button
              onClick={onBack}
              className="p-1 mr-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Back to news list"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold flex-1">{newsItem.title}</h1>
            <a
              href={newsItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm px-2 py-1 rounded hover:bg-gray-100 ml-2"
              title="Open original article"
            >
              <ExternalLink size={16} className="mr-1" />
              <span>Original</span>
            </a>
          </div>
          <div className="flex items-center ml-8">
            {newsItem.favicon_url && (
              <img
                src={newsItem.favicon_url || "/placeholder.svg"}
                alt={`${newsItem.source_name} favicon`}
                className="w-5 h-5 mr-2"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
            )}
            <span className="text-sm text-gray-500 mr-2">{newsItem.source_name}</span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(newsItem.published_at), { addSuffix: true })}
            </span>

            {newsItem.status === "backlog" && (
              <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">In Backlog</span>
            )}
          </div>
        </div>
      </div>

      {/* News content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto">
          {/* Summary */}
          {newsItem.summary && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Summary</h2>
              <p className="text-gray-700">{newsItem.summary}</p>
            </div>
          )}

          {/* Implementation advice */}
          {newsItem.implementation_advice && (
            <div className="mb-6 bg-blue-50 py-4 px-4 rounded-lg">
              <h2 className="text-lg font-bold text-blue-800 mb-2">Implementation for Your Project</h2>
              <p className="text-gray-700">{newsItem.implementation_advice}</p>
            </div>
          )}

          {/* Quick actions */}
          <div className="mb-6 flex space-x-3">
            {newsItem.status !== "backlog" && (
              <button
                onClick={handleAddToBacklog}
                className="flex items-center text-sm px-3 py-2 rounded bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                title="Save to ideas"
              >
                <BookmarkPlus size={16} className="mr-2" />
                <span>Save to Ideas</span>
              </button>
            )}

            {newsItem.status !== "dismissed" && (
              <button
                onClick={handleDismiss}
                className="flex items-center text-sm px-3 py-2 rounded bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                title="Archive"
              >
                <Archive size={16} className="mr-2" />
                <span>Archive</span>
              </button>
            )}
          </div>

          {/* Chat messages */}
          {messages.length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Discussion</h2>
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg p-3",
                        msg.role === "user" ? "bg-primary text-white" : "bg-gray-100 text-gray-800",
                      )}
                    >
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200">
        <div className="max-w-2xl mx-auto">
          <div className="flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this news item..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isGenerating}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isGenerating}
              className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
