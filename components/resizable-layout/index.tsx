"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/utils/cn"
import "./resizable-layout.css"

interface ResizableLayoutProps {
  leftContent: React.ReactNode
  rightContent: React.ReactNode
  initialLeftWidth?: number // in percentage
  minLeftWidth?: number // in pixels
  maxLeftWidth?: number // in pixels for content, not for the panel
  minRightWidth?: number // in pixels
  leftPadding?: number // in pixels
  rightPadding?: number // in pixels
}

export default function ResizableLayout({
  leftContent,
  rightContent,
  initialLeftWidth = 50, // default to 50%
  minLeftWidth = 360, // minimum width for left panel
  maxLeftWidth = 770, // maximum width for content, not panel - UPDATED TO 770px
  minRightWidth = 360, // minimum width for right panel
  leftPadding = 25,
  rightPadding = 45,
}: ResizableLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth)
  const [isDragging, setIsDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showRightOnMobile, setShowRightOnMobile] = useState(false)
  const [rightPanelExpanded, setRightPanelExpanded] = useState(true)
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)
  const [separatorRef, setSeparatorRef] = useState<HTMLDivElement | null>(null)
  const dragStartXRef = useRef<number | null>(null)
  const initialLeftWidthRef = useRef<number>(leftWidth)

  // Handle resize
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragStartXRef.current = e.clientX
    initialLeftWidthRef.current = leftWidth

    // Prevent the separator from jumping when clicked
    e.stopPropagation()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    dragStartXRef.current = e.touches[0].clientX
    initialLeftWidthRef.current = leftWidth

    // Prevent the separator from jumping when touched
    e.stopPropagation()
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    dragStartXRef.current = null
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    dragStartXRef.current = null
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef || dragStartXRef.current === null) return

    const containerRect = containerRef.getBoundingClientRect()
    const containerWidth = containerRect.width

    // Calculate the delta movement from the drag start position
    const deltaX = e.clientX - dragStartXRef.current
    const deltaPercent = (deltaX / containerWidth) * 100

    // Apply the delta to the initial width
    let newLeftWidth = initialLeftWidthRef.current + deltaPercent

    // Apply constraints - ensure right side has at least minRightWidth
    const minRightWidthPercent = (minRightWidth / containerWidth) * 100
    const maxLeftWidthPercent = 100 - minRightWidthPercent

    // Apply min constraint for left side
    const minLeftWidthPercent = (minLeftWidth / containerWidth) * 100

    // Apply final constraints
    newLeftWidth = Math.max(minLeftWidthPercent, Math.min(newLeftWidth, maxLeftWidthPercent))

    setLeftWidth(newLeftWidth)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !containerRef || dragStartXRef.current === null) return

    const containerRect = containerRef.getBoundingClientRect()
    const containerWidth = containerRect.width

    // Calculate the delta movement from the drag start position
    const deltaX = e.touches[0].clientX - dragStartXRef.current
    const deltaPercent = (deltaX / containerWidth) * 100

    // Apply the delta to the initial width
    let newLeftWidth = initialLeftWidthRef.current + deltaPercent

    // Apply constraints - ensure right side has at least minRightWidth
    const minRightWidthPercent = (minRightWidth / containerWidth) * 100
    const maxLeftWidthPercent = 100 - minRightWidthPercent

    // Apply min constraint for left side
    const minLeftWidthPercent = (minLeftWidth / containerWidth) * 100

    // Apply final constraints
    newLeftWidth = Math.max(minLeftWidthPercent, Math.min(newLeftWidth, maxLeftWidthPercent))

    setLeftWidth(newLeftWidth)
  }

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove)
      document.addEventListener("touchend", handleTouchEnd)

      // Add class to body to prevent scrolling on mobile
      document.body.classList.add("resize-dragging")
    } else {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)

      // Remove class from body
      document.body.classList.remove("resize-dragging")
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
      document.body.classList.remove("resize-dragging")
    }
  }, [isDragging])

  // Toggle between views on mobile
  const toggleMobileView = () => {
    setShowRightOnMobile(!showRightOnMobile)
  }

  // Toggle right panel expanded state
  const toggleRightPanel = () => {
    setRightPanelExpanded(!rightPanelExpanded)
  }

  return (
    <div ref={setContainerRef} className="flex h-full w-full relative">
      {/* Desktop toggle button - FIXED POSITION */}
      {!isMobile && (
        <button
          className="fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          onClick={toggleRightPanel}
          aria-label={rightPanelExpanded ? "Collapse right panel" : "Expand right panel"}
        >
          {rightPanelExpanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      )}

      {/* Mobile toggle button */}
      {isMobile && (
        <button
          className="fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          onClick={toggleMobileView}
          aria-label={showRightOnMobile ? "Show task view" : "Show context view"}
        >
          {showRightOnMobile ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      )}

      {/* Left content */}
      <div
        className={cn(
          "h-full transition-all duration-300 overflow-hidden flex",
          isMobile
            ? showRightOnMobile
              ? "w-0"
              : "w-full"
            : rightPanelExpanded
              ? "w-[var(--left-width)]"
              : "w-full justify-center",
        )}
        style={
          !isMobile && rightPanelExpanded
            ? ({
                "--left-width": `${leftWidth}%`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {/* This wrapper ensures content is centered and max-width is respected */}
        <div className="h-full overflow-auto flex justify-center w-full">
          <div
            className="h-full w-full"
            style={{
              maxWidth: maxLeftWidth,
              paddingLeft: leftPadding,
              paddingRight: rightPadding,
            }}
          >
            {leftContent}
          </div>
        </div>
      </div>

      {/* Resizable separator */}
      {!isMobile && rightPanelExpanded && (
        <div
          ref={setSeparatorRef}
          className={cn(
            "w-px bg-gray-200 h-full cursor-col-resize flex items-center justify-center group relative z-10",
            isDragging && "bg-primary",
          )}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="absolute w-4 h-8 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition-colors">
            <div className="w-px h-4 bg-gray-400 rounded-full group-hover:bg-gray-500"></div>
          </div>
        </div>
      )}

      {/* Right content */}
      <div
        className={cn(
          "h-full transition-all duration-300 overflow-hidden",
          isMobile ? (showRightOnMobile ? "w-full" : "w-0") : rightPanelExpanded ? "w-[var(--right-width)]" : "w-0",
        )}
        style={
          !isMobile && rightPanelExpanded
            ? ({
                "--right-width": `${100 - leftWidth}%`,
              } as React.CSSProperties)
            : undefined
        }
      >
        <div className="h-full w-full overflow-auto">{rightContent}</div>
      </div>
    </div>
  )
}
