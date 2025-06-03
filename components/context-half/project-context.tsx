"use client"

import { useState, useEffect } from "react"
import { TabProvider } from "./tab-context"
import TabManager from "./tab-manager"
import { getProject, updateProject } from "@/lib/database"
import { Pencil } from "lucide-react"

interface ProjectContextProps {
  projectId: string
  onOpenFeatureChat?: (featureId: number) => void
  onOpenNewsChat?: (newsId: number) => void
}

export default function ProjectContext({ projectId, onOpenFeatureChat, onOpenNewsChat }: ProjectContextProps) {
  const [project, setProject] = useState<any>({ title: `Project ${projectId}`, stage: "ideation" })
  const [projectStage, setProjectStage] = useState<"ideation" | "development">("ideation")
  const [loading, setLoading] = useState(true)
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  const isPostIdea = projectStage === "development"

  async function updateProjectTitle(title: string) {
    try {
      await updateProject(Number.parseInt(projectId, 10), { title })
      setIsEditingTitle(false)
    } catch (error) {
      console.error("Error updating project title:", error)
    }
  }

  useEffect(() => {
    async function loadProject() {
      try {
        const projectData = await getProject(Number.parseInt(projectId, 10))
        if (projectData) {
          setProject(projectData)
          // Normalize stage values to either "ideation" or "development"
          const normalizedStage = projectData.stage === "post_idea" ? "development" : "ideation"
          setProjectStage(normalizedStage)
          console.log(`Project loaded with stage: ${normalizedStage}`)
        }
      } catch (error) {
        console.error("Error loading project:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProject()

    // Set up event listeners for refreshing data
    const projectContextElement = document.querySelector('[data-component="project-context"]')
    if (projectContextElement) {
      const refreshBacklogHandler = () => {
        console.log("Refreshing backlog data")
        // You can add specific refresh logic here if needed
      }

      const refreshNewsHandler = () => {
        console.log("Refreshing news data")
        // You can add specific refresh logic here if needed
      }

      projectContextElement.addEventListener("refresh-backlog", refreshBacklogHandler)
      projectContextElement.addEventListener("refresh-news", refreshNewsHandler)

      return () => {
        projectContextElement.removeEventListener("refresh-backlog", refreshBacklogHandler)
        projectContextElement.removeEventListener("refresh-news", refreshNewsHandler)
      }
    }
  }, [projectId])

  const handleOpenNewsChat = (newsId: number) => {
    // Just pass the ID up to the parent component
    if (onOpenNewsChat) {
      onOpenNewsChat(newsId)
    }

    // Do NOT change the active tab here
    // Do NOT set any local state that would change the view
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="h-[64px] p-4 border-b border-gray-200 flex items-center w-full">
        {isEditingTitle ? (
          <input
            type="text"
            value={project.title}
            onChange={(e) => setProject({ ...project, title: e.target.value })}
            onBlur={() => updateProjectTitle(project.title)}
            onKeyDown={(e) => e.key === "Enter" && updateProjectTitle(project.title)}
            autoFocus
            className="text-xl font-semibold w-full focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
          />
        ) : (
          <div className="flex items-center flex-1">
            <h1 className="text-xl font-semibold">{project.title}</h1>
            <span
              className={`ml-2 text-xs px-2 py-1 rounded-full ${
                isPostIdea ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
              }`}
            >
              {isPostIdea ? "Development" : "Ideation"}
            </span>
            <button
              onClick={() => setIsEditingTitle(true)}
              className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <Pencil size={16} />
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        <TabProvider projectId={projectId}>
          <TabManager
            projectStage={projectStage}
            onOpenFeatureChat={onOpenFeatureChat}
            onOpenNewsChat={onOpenNewsChat}
          />
        </TabProvider>
      </div>
    </div>
  )
}
