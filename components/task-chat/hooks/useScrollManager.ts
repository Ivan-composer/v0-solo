"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export function useScrollManager() {
  const [isScrolledUp, setIsScrolledUp] = useState(false)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleScrollToBottom = useCallback(() => {
    setShouldAutoScroll(true)
    scrollToBottom()
  }, [scrollToBottom])

  // Only scroll to bottom when shouldAutoScroll is true
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom()
    }
  }, [shouldAutoScroll, scrollToBottom])

  // Set up scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const scrollTop = contentRef.current.scrollTop
        const scrollHeight = contentRef.current.scrollHeight
        const clientHeight = contentRef.current.clientHeight

        // Check if we're scrolled up from the bottom
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50 // Within 50px of bottom
        setIsScrolledUp(!isAtBottom)
      }
    }

    const checkInitialScrollState = () => {
      if (contentRef.current) {
        const scrollHeight = contentRef.current.scrollHeight
        const clientHeight = contentRef.current.clientHeight

        // If content is taller than container, show the button
        if (scrollHeight > clientHeight + 50) {
          setIsScrolledUp(true)
        } else {
          setIsScrolledUp(false)
        }
      }
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll)
      setTimeout(checkInitialScrollState, 300)
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  return {
    isScrolledUp,
    shouldAutoScroll,
    setShouldAutoScroll,
    contentRef,
    messagesEndRef,
    handleScrollToBottom,
  }
}
