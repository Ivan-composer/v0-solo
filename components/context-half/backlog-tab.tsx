"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Tag,
  Plus,
  Calendar,
  BarChart2,
  Lightbulb,
  Clock,
  Filter,
  Trash2,
  GripVertical,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/utils/cn"
import {
  getBacklogFeatures,
  getBacklogIdeas,
  deleteBacklogFeature,
  deleteBacklogIdea,
  updateBacklogFeaturePriorities,
  updateBacklogIdeaPriorities,
  type BacklogFeature,
  type BacklogIdea,
} from "@/lib/database"
import ReturnHomeButton from "./return-home-button"
import FeatureChat from "../feature-chat"
// Add this import at the top of the file
import { useRouter } from "next/navigation"

// Add this prop to the BacklogTabProps interface
interface BacklogTabProps {
  projectStage: string
  projectId?: number
  onOpenFeatureChat?: (featureId: number) => void
}

type ViewMode = "priority" | "date" | "ideas"

// Update the component definition to accept the new prop
export default function BacklogTab({ projectStage, projectId = 1, onOpenFeatureChat }: BacklogTabProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("priority")
  const [features, setFeatures] = useState<BacklogFeature[]>([])
  const [ideas, setIdeas] = useState<BacklogIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [newItemDescription, setNewItemDescription] = useState("")
  const [newItemPriority, setNewItemPriority] = useState(2)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [dragOverItem, setDragOverItem] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  // Add new state for feature clarification
  const [clarifyingFeatureId, setClarifyingFeatureId] = useState<number | null>(null)
  const [expandedFeatureId, setExpandedFeatureId] = useState<number | null>(null)

  useEffect(() => {
    async function loadBacklogData() {
      setLoading(true)
      try {
        // Load features sorted by priority or date
        const featuresData = await getBacklogFeatures(projectId, viewMode === "date" ? "date" : "priority")
        setFeatures(featuresData)

        // Load ideas
        const ideasData = await getBacklogIdeas(projectId)
        setIdeas(ideasData)
      } catch (error) {
        console.error("Error loading backlog data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBacklogData()
  }, [projectId, viewMode])

  const handleAddItem = async () => {
    if (!newItemName.trim()) return

    try {
      if (viewMode === "ideas") {
        const { createBacklogIdea } = await import("@/lib/database")
        const newIdea = await createBacklogIdea(projectId, newItemName, newItemDescription, newItemPriority)
        if (newIdea) {
          setIdeas([...ideas, newIdea])
        }
      } else {
        const { createBacklogFeature } = await import("@/lib/database")
        const newFeature = await createBacklogFeature(projectId, newItemName, newItemDescription, newItemPriority)
        if (newFeature) {
          setFeatures([...features, newFeature])
        }
      }

      // Reset form
      setNewItemName("")
      setNewItemDescription("")
      setNewItemPriority(2)
      setShowAddForm(false)
    } catch (error) {
      console.error("Error adding item:", error)
    }
  }

  const handleDeleteFeature = async (featureId: number) => {
    try {
      const success = await deleteBacklogFeature(featureId)
      if (success) {
        setFeatures(features.filter((feature) => feature.feature_id !== featureId))
      }
    } catch (error) {
      console.error("Error deleting feature:", error)
    }
    setDeleteConfirm(null)
  }

  const handleDeleteIdea = async (ideaId: number) => {
    try {
      const success = await deleteBacklogIdea(ideaId)
      if (success) {
        setIdeas(ideas.filter((idea) => idea.idea_id !== ideaId))
      }
    } catch (error) {
      console.error("Error deleting idea:", error)
    }
    setDeleteConfirm(null)
  }

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedItem(id)
    setIsDragging(true)
    // Set a ghost drag image
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move"
    }
  }

  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault()
    if (draggedItem === id) return
    setDragOverItem(id)
  }

  const handleDragEnd = async () => {
    setIsDragging(false)
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()

    if (draggedItem === null || dragOverItem === null || draggedItem === dragOverItem) {
      return
    }

    if (viewMode === "ideas") {
      // Reorder ideas
      const reorderedIdeas = [...ideas]
      const draggedIndex = reorderedIdeas.findIndex((item) => item.idea_id === draggedItem)
      const dropIndex = reorderedIdeas.findIndex((item) => item.idea_id === dragOverItem)

      if (draggedIndex !== -1 && dropIndex !== -1) {
        // Remove the dragged item
        const [draggedItemData] = reorderedIdeas.splice(draggedIndex, 1)
        // Insert it at the new position
        reorderedIdeas.splice(dropIndex, 0, draggedItemData)

        // Update priorities based on new order
        const updatedIdeas = reorderedIdeas.map((idea, index) => ({
          ...idea,
          priority: index + 1,
        }))

        setIdeas(updatedIdeas)

        // Update in database
        try {
          await updateBacklogIdeaPriorities(
            updatedIdeas.map((idea) => ({ idea_id: idea.idea_id, priority: idea.priority })),
          )
        } catch (error) {
          console.error("Error updating idea priorities:", error)
        }
      }
    } else if (viewMode === "priority") {
      // Reorder features
      const reorderedFeatures = [...features]
      const draggedIndex = reorderedFeatures.findIndex((item) => item.feature_id === draggedItem)
      const dropIndex = reorderedFeatures.findIndex((item) => item.feature_id === dragOverItem)

      if (draggedIndex !== -1 && dropIndex !== -1) {
        // Remove the dragged item
        const [draggedItemData] = reorderedFeatures.splice(draggedIndex, 1)
        // Insert it at the new position
        reorderedFeatures.splice(dropIndex, 0, draggedItemData)

        // Update priorities based on new order
        const updatedFeatures = reorderedFeatures.map((feature, index) => ({
          ...feature,
          priority: index + 1,
        }))

        setFeatures(updatedFeatures)

        // Update in database
        try {
          await updateBacklogFeaturePriorities(
            updatedFeatures.map((feature) => ({ feature_id: feature.feature_id, priority: feature.priority })),
          )
        } catch (error) {
          console.error("Error updating feature priorities:", error)
        }
      }
    }

    // Reset drag state
    setDraggedItem(null)
    setDragOverItem(null)
    setIsDragging(false)
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return "High"
      case 2:
        return "Medium"
      case 3:
        return "Low"
      default:
        return "Medium"
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case 2:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case 3:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  // Replace the handleClarifyFeature function with this new implementation
  const handleClarifyFeature = (featureId: number) => {
    if (onOpenFeatureChat) {
      onOpenFeatureChat(featureId)
    } else {
      setClarifyingFeatureId(featureId)
    }
  }

  // Add this function to handle toggling feature details
  const toggleFeatureDetails = (featureId: number) => {
    setExpandedFeatureId(expandedFeatureId === featureId ? null : featureId)
  }

  // Add this function to refresh features after clarification
  const handleFeatureUpdated = async () => {
    try {
      // Reload features
      const featuresData = await getBacklogFeatures(projectId, viewMode === "date" ? "date" : "priority")
      setFeatures(featuresData)
    } catch (error) {
      console.error("Error reloading features:", error)
    }
  }

  // If we're clarifying a feature, show the FeatureChat component
  if (clarifyingFeatureId !== null) {
    return (
      <FeatureChat
        featureId={clarifyingFeatureId}
        onBack={() => setClarifyingFeatureId(null)}
        onFeatureUpdated={handleFeatureUpdated}
      />
    )
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[700px] mx-auto p-6">
      {/* Header with stage indicator and return button */}
      <div className="flex items-center justify-between mb-4 bg-[#A7D8F0]/10 p-2 rounded-md dark:bg-[#A7D8F0]/20">
        <div className="flex items-center">
          <Tag className="text-[#A7D8F0] mr-2" size={18} />
          <span className="text-[#A7D8F0] text-sm dark:text-[#A7D8F0]">Post-Idea Stage View</span>
        </div>
        <ReturnHomeButton />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Backlog</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          <span>Add {viewMode === "ideas" ? "Idea" : "Feature"}</span>
        </button>
      </div>

      {/* Mode selector */}
      <div className="flex mb-6 bg-gray-100 p-1 rounded-lg dark:bg-gray-800">
        <button
          onClick={() => setViewMode("priority")}
          className={cn(
            "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
            viewMode === "priority"
              ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-primary"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
          )}
        >
          <BarChart2 size={16} />
          <span>By Priority</span>
        </button>

        <button
          onClick={() => setViewMode("date")}
          className={cn(
            "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
            viewMode === "date"
              ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-primary"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
          )}
        >
          <Calendar size={16} />
          <span>By Date Added</span>
        </button>

        <button
          onClick={() => setViewMode("ideas")}
          className={cn(
            "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
            viewMode === "ideas"
              ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-primary"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
          )}
        >
          <Lightbulb size={16} />
          <span>Idea Notes</span>
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
          <h3 className="font-medium mb-3">Add New {viewMode === "ideas" ? "Idea" : "Feature"}</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="item-name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                id="item-name"
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                placeholder={`Enter ${viewMode === "ideas" ? "idea" : "feature"} name`}
              />
            </div>
            <div>
              <label htmlFor="item-description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="item-description"
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                rows={3}
                placeholder="Enter description"
              ></textarea>
            </div>
            <div>
              <label htmlFor="item-priority" className="block text-sm font-medium mb-1">
                Priority
              </label>
              <select
                id="item-priority"
                value={newItemPriority}
                onChange={(e) => setNewItemPriority(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
              >
                <option value={1}>High</option>
                <option value={2}>Medium</option>
                <option value={3}>Low</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                disabled={!newItemName.trim()}
              >
                Add {viewMode === "ideas" ? "Idea" : "Feature"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drag instructions - only show when in priority mode */}
      {(viewMode === "priority" || viewMode === "ideas") && (
        <div className="mb-4 text-sm text-gray-500 bg-gray-50 p-2 rounded-md dark:bg-gray-800/50 dark:text-gray-400">
          <p className="flex items-center">
            <GripVertical size={16} className="mr-1" />
            Drag items to reorder and change priority
          </p>
        </div>
      )}

      {/* Feature/Idea list */}
      <div className="space-y-4">
        {viewMode === "ideas" ? (
          // Ideas list
          ideas.length > 0 ? (
            ideas.map((idea) => (
              <div
                key={idea.idea_id}
                draggable={viewMode === "ideas"}
                onDragStart={(e) => handleDragStart(e, idea.idea_id)}
                onDragOver={(e) => handleDragOver(e, idea.idea_id)}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                className={cn(
                  "p-4 border border-gray-200 rounded-lg transition-all bg-white dark:bg-gray-800 dark:border-gray-700",
                  draggedItem === idea.idea_id && "opacity-50 border-dashed",
                  dragOverItem === idea.idea_id && "border-primary border-2",
                  isDragging && "cursor-grabbing",
                  !isDragging && "hover:border-gray-300 dark:hover:border-gray-600 cursor-grab",
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <GripVertical size={18} className="mr-2 text-gray-400 cursor-grab" />
                    <h3 className="font-medium">{idea.name}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(idea.priority)}`}>
                      {getPriorityLabel(idea.priority)}
                    </span>
                    {deleteConfirm === idea.idea_id ? (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDeleteIdea(idea.idea_id)}
                          className="p-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="p-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(idea.idea_id)}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 dark:hover:bg-gray-700"
                        title="Delete idea"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                {idea.description && <p className="text-sm text-gray-600 dark:text-gray-300">{idea.description}</p>}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Lightbulb size={48} className="mx-auto mb-4 opacity-50" />
              <p>No idea notes yet. Add your first one!</p>
            </div>
          )
        ) : // Features list
        features.length > 0 ? (
          features.map((feature) => (
            <div
              key={feature.feature_id}
              draggable={viewMode === "priority"}
              onDragStart={(e) => handleDragStart(e, feature.feature_id)}
              onDragOver={(e) => handleDragOver(e, feature.feature_id)}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              className={cn(
                "p-4 border border-gray-200 rounded-lg transition-all bg-white dark:bg-gray-800 dark:border-gray-700",
                draggedItem === feature.feature_id && "opacity-50 border-dashed",
                dragOverItem === feature.feature_id && "border-primary border-2",
                viewMode === "priority" && isDragging && "cursor-grabbing",
                viewMode === "priority" &&
                  !isDragging &&
                  "hover:border-gray-300 dark:hover:border-gray-600 cursor-grab",
                viewMode !== "priority" && "hover:border-gray-300 dark:hover:border-gray-600",
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  {viewMode === "priority" && <GripVertical size={18} className="mr-2 text-gray-400 cursor-grab" />}
                  <h3 className="font-medium">{feature.name}</h3>
                  {feature.is_clarified && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-[#A7D8F0]/20 text-[#A7D8F0] rounded-full dark:bg-[#A7D8F0]/20 dark:text-[#A7D8F0]">
                      Clarified
                    </span>
                  )}
                  {feature.is_task_created && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                      Task Created
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {viewMode === "date" && (
                    <span className="text-xs flex items-center text-gray-500 dark:text-gray-400">
                      <Clock size={12} className="mr-1" />
                      {formatDate(feature.date_added)}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(feature.priority)}`}>
                    {getPriorityLabel(feature.priority)}
                  </span>
                  {deleteConfirm === feature.feature_id ? (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleDeleteFeature(feature.feature_id)}
                        className="p-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="p-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      {/* Update the button in the feature list to use the new handler */}
                      <button
                        onClick={() => handleClarifyFeature(feature.feature_id)}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary dark:hover:bg-gray-700"
                        title="Clarify details"
                      >
                        <MessageSquare size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(feature.feature_id)}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 dark:hover:bg-gray-700"
                        title="Delete feature"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {feature.description && <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>}

              {/* Add button to toggle feature details */}
              {feature.is_clarified && (
                <div className="mt-2">
                  <button
                    onClick={() => toggleFeatureDetails(feature.feature_id)}
                    className="text-sm flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {expandedFeatureId === feature.feature_id ? (
                      <>
                        <ChevronUp size={14} className="mr-1" /> Hide details
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} className="mr-1" /> View details
                      </>
                    )}
                  </button>

                  {/* Expanded details */}
                  {expandedFeatureId === feature.feature_id && feature.questions && feature.questions.length > 0 && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md dark:bg-gray-800/50">
                      <h4 className="text-sm font-medium mb-2">Clarification Details</h4>
                      <div className="space-y-2">
                        {feature.questions.map((question, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-5 h-5 rounded-full bg-[#A7D8F0]/20 text-[#A7D8F0] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 dark:bg-[#A7D8F0]/20 dark:text-[#A7D8F0]">
                              <CheckCircle size={12} />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{question.prompt}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {!feature.is_task_created && (
                        <button
                          onClick={() => handleClarifyFeature(feature.feature_id)}
                          className="mt-3 w-full px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm"
                        >
                          Turn into Task
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Filter size={48} className="mx-auto mb-4 opacity-50" />
            <p>No features in the backlog yet. Add your first one!</p>
          </div>
        )}
      </div>
    </div>
  )
}
