"use client"

import { useState, useEffect } from "react"
import { TabProvider } from "./tab-context"
import TabManager from "./tab-manager"
import { getProject, updateProject } from "@/lib/database"
import { Pencil } from "lucide-react"

interface ProjectContextProps {
  projectId: string
}

export default function ProjectContext({ projectId }: ProjectContextProps) {
  const [project, setProject] = useState<any>({ name: `Project ${projectId}`, status: "active" })
  const [loading, setLoading] = useState(true)
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  async function updateProjectName(name: string) {
    try {
      // Pass projectId directly (it's a string UUID) and use { name }
      await updateProject(projectId, { name })
      setIsEditingTitle(false)
    } catch (error) {
      console.error("Error updating project name:", error)
    }
  }

  useEffect(() => {
    async function loadProject() {
      try {
        const projectData = await getProject(projectId)
        if (projectData) {
          setProject(projectData)
          console.log(`Project loaded`)
        }
      } catch (error) {
        console.error("Error loading project:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [projectId])

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
            value={project.name || ""} // Use project.name, provide fallback for initial state
            onChange={(e) => setProject({ ...project, name: e.target.value })}
            onBlur={() => updateProjectName(project.name)} // Call renamed function
            onKeyDown={(e) => e.key === "Enter" && updateProjectName(project.name)} // Call renamed function
            autoFocus
            className="text-xl font-semibold w-full focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
          />
        ) : (
          <div className="flex items-center flex-1">
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">Ideation</span>
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
          <TabManager projectStage="ideation" />
        </TabProvider>
      </div>
    </div>
  )
}
