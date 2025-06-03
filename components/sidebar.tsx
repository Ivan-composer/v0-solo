"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Home, Settings, Bell, LogOut, Folder, Moon, Sun } from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import { useTheme } from "./theme-context"

type Project = {
  project_id: number
  title: string
  description: string
}

export default function Sidebar() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    async function fetchProjects() {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from("projects")
        .select("project_id, title, description")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching projects:", error)
      } else {
        setProjects(data || [])
      }
      setLoading(false)
    }

    fetchProjects()
  }, [])

  return (
    <aside className="h-full w-64 bg-background border-r border-border text-foreground flex flex-col overflow-hidden">
      <div className="h-16"></div>

      <div className="mt-8 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-medium">
          U
        </div>
        <p className="mt-2 font-medium">Current User</p>
      </div>

      <nav className="mt-10 flex-1 w-full overflow-y-auto">
        <ul className="space-y-2 px-3">
          <li>
            <Link href="/" className="flex items-center py-2 px-3 hover:bg-secondary rounded-md transition-colors">
              <Home size={18} className="text-muted-foreground" />
              <span className="ml-3">Dashboard</span>
            </Link>
          </li>

          {/* Projects Section */}
          <li className="pt-4">
            <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Projects
            </div>
            {loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Loading projects...</div>
            ) : (
              <ul className="space-y-1">
                {projects.map((project) => (
                  <li key={project.project_id}>
                    <Link
                      href={`/projects/${project.project_id}`}
                      className="flex items-center py-2 px-3 hover:bg-secondary rounded-md transition-colors text-sm"
                    >
                      <Folder size={16} className="text-muted-foreground" />
                      <span className="ml-3 truncate">{project.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li className="pt-4">
            <Link
              href="/notifications"
              className="flex items-center py-2 px-3 hover:bg-secondary rounded-md transition-colors"
            >
              <Bell size={18} className="text-muted-foreground" />
              <span className="ml-3">Notifications</span>
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className="flex items-center py-2 px-3 hover:bg-secondary rounded-md transition-colors"
            >
              <Settings size={18} className="text-muted-foreground" />
              <span className="ml-3">Settings</span>
            </Link>
          </li>
          <li>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center py-2 px-3 hover:bg-secondary rounded-md transition-colors"
            >
              {theme === "dark" ? (
                <Sun size={18} className="text-muted-foreground" />
              ) : (
                <Moon size={18} className="text-muted-foreground" />
              )}
              <span className="ml-3">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="mt-auto mb-6 px-3">
        <button className="flex items-center py-2 px-3 hover:bg-secondary rounded-md transition-colors w-full">
          <LogOut size={18} className="text-muted-foreground" />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </aside>
  )
}
