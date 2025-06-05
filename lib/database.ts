import { getSupabase } from "./supabase"

// Updated types based on your actual database schema
export type Project = {
  id: string // UUID
  owner_id: string // UUID, FK to users.auth_id
  name: string
  description: string | null
  status: "active" | "archived"
  template_version: number
  created_at: string
  updated_at: string
}

export type Task = {
  id: string // UUID
  project_id: string // UUID, FK to projects.id
  parent_task_id: string | null // UUID, FK to tasks.id
  author_id: string // UUID, FK to users.auth_id
  type: "template" | "user_task" | "tech_task"
  title: string // This is the task title
  description: string | null // This is the task description
  status: "active" | "on_hold" | "completed" | "skipped" | "archived"
  order_index: number | null
  sprint: number | null
  summary: string | null
  metadata: any | null // JSONB
  created_at: string
  updated_at: string
}

export type Message = {
  id: string // UUID
  task_id: string // UUID, FK to tasks.id
  author_id: string | null // UUID, FK to users.auth_id (nullable for system messages)
  role: "user" | "agent" | "system" | "tool"
  content: string | null
  tool_payload: any | null // JSONB
  created_at: string
}

export type User = {
  auth_id: string // UUID, PK
  id: number // bigserial
  name: string | null
  avatar_url: string | null
  last_login: string | null
  created_at: string
  updated_at: string
}

export type File = {
  id: string // UUID
  project_id: string // UUID, FK to projects.id
  storage_path: string
  file_name: string
  mime_type: string
  version: number
  created_by: string // UUID, FK to users.auth_id
  created_at: string
  updated_at: string
  metadata: any | null // JSONB
}

export type TemplateTask = {
  id: string // UUID
  parent_task_id: string | null // UUID, FK to template_tasks.id
  title: string
  description: string | null
  order_index: number
  sprint: number
  metadata: any | null // JSONB
  created_at: string
  updated_at: string
}

// Project functions
export async function getProject(projectId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle()

  if (error) {
    console.error(`Error fetching project ${projectId}:`, error)
    return null
  }

  return data as Project | null
}

export async function updateProject(
  projectId: string,
  updates: { name?: string; description?: string; status?: string },
) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating project ${projectId}:`, error)
    return null
  }

  return data as Project
}

export async function createProject(name: string, description: string | null, ownerId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        name,
        description,
        owner_id: ownerId,
        status: "active",
        template_version: 1,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating project:", error)
    return null
  }

  return data as Project
}

// Task functions
export async function getAllTasks(projectId?: string) {
  const supabase = getSupabase()
  let query = supabase.from("tasks").select("*").is("parent_task_id", null).order("order_index", { ascending: true })

  if (projectId) {
    query = query.eq("project_id", projectId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  return data as Task[]
}

export async function getSubtasks(taskId: string) {
  if (!taskId || taskId === "undefined") {
    console.warn("getSubtasks called with invalid taskId:", taskId)
    return []
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("parent_task_id", taskId)
    .order("order_index", { ascending: true })

  if (error) {
    console.error(`Error fetching subtasks for task ${taskId}:`, error)
    return []
  }

  return data as Task[]
}

export async function getTaskById(taskId: string) {
  // Validate UUID format
  if (
    !taskId ||
    taskId === "undefined" ||
    !taskId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  ) {
    console.warn("getTaskById called with invalid taskId:", taskId)
    return null
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.from("tasks").select("*").eq("id", taskId).maybeSingle()

  if (error) {
    console.error(`Error fetching task ${taskId}:`, error)
    return null
  }

  return data as Task | null
}

export async function createTask(
  projectId: string,
  title: string,
  description: string | null = null,
  authorId: string,
  parentTaskId: string | null = null,
  type: "template" | "user_task" | "tech_task" = "user_task",
) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        project_id: projectId,
        title,
        description,
        author_id: authorId,
        parent_task_id: parentTaskId,
        type,
        status: "on_hold",
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating task:", error)
    return null
  }

  return data as Task
}

export async function updateTaskStatus(
  taskId: string,
  status: "active" | "on_hold" | "completed" | "skipped" | "archived",
) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating task ${taskId}:`, error)
    return null
  }

  return data as Task
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating task ${taskId}:`, error)
    return null
  }

  return data as Task
}

// Message functions
export async function getMessagesForTask(taskId: string) {
  // Validate UUID format
  if (
    !taskId ||
    taskId === "undefined" ||
    !taskId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  ) {
    console.warn("getMessagesForTask called with invalid taskId:", taskId)
    return []
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error(`Error fetching messages for task ${taskId}:`, error)
    return []
  }

  return data as Message[]
}

export async function getMasterChatMessages(projectId: string) {
  // For master chat, we'll need to implement a special logic
  // For now, return empty array
  return []
}

export async function createMessage(
  taskId: string,
  content: string | null,
  authorId: string | null = null,
  role: "user" | "agent" | "system" | "tool" = "user",
  toolPayload: any = null,
) {
  // Validate UUID format
  if (
    !taskId ||
    taskId === "undefined" ||
    !taskId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  ) {
    console.error("createMessage called with invalid taskId:", taskId)
    return null
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        task_id: taskId,
        content,
        author_id: authorId,
        role,
        tool_payload: toolPayload,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating message:", error)
    return null
  }

  return data as Message
}

// File functions
export async function getFilesForProject(projectId: string) {
  // Validate UUID format
  if (
    !projectId ||
    projectId === "undefined" ||
    !projectId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  ) {
    console.warn("getFilesForProject called with invalid projectId:", projectId)
    return []
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error fetching files for project ${projectId}:`, error)
    return []
  }

  return data as File[]
}

export async function createFile(
  projectId: string,
  fileName: string,
  mimeType: string,
  storagePath: string,
  createdBy: string,
  metadata: any = null,
) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("files")
    .insert([
      {
        project_id: projectId,
        file_name: fileName,
        mime_type: mimeType,
        storage_path: storagePath,
        created_by: createdBy,
        version: 1,
        metadata,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating file:", error)
    return null
  }

  return data as File
}

// Template functions
export async function getTemplateTasks() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("template_tasks")
    .select("*")
    .order("sprint", { ascending: true })
    .order("order_index", { ascending: true })

  if (error) {
    console.error("Error fetching template tasks:", error)
    return []
  }

  return data as TemplateTask[]
}

// User functions
export async function getUserByAuthId(authId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("users").select("*").eq("auth_id", authId).maybeSingle()

  if (error) {
    console.error(`Error fetching user ${authId}:`, error)
    return null
  }

  return data as User | null
}

export async function createUser(authId: string, name: string | null = null) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        auth_id: authId,
        name,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating user:", error)
    return null
  }

  return data as User
}

// Function to check if a task is available (all dependencies completed)
export function isTaskAvailable(task: Task, allTasks: Task[]): boolean {
  // Since your schema doesn't have dependent_on_tasks, we'll use a simple logic
  // Tasks are available if their status is not 'completed' or 'skipped'
  return task.status === "on_hold" || task.status === "active"
}
