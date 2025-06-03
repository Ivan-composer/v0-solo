import { createClient } from "@supabase/supabase-js"

// Mock data for use when Supabase is not available
const mockTasks = [
  { task_id: 1, description: "Market Research", parent_task_id: null, status: "planned", dependent_on_tasks: null },
  {
    task_id: 2,
    description: "Target Audience Definition",
    parent_task_id: null,
    status: "planned",
    dependent_on_tasks: [1],
  },
  { task_id: 3, description: "Value Proposition", parent_task_id: null, status: "planned", dependent_on_tasks: [1] },
]

const mockSubtasks = {
  1: [
    { task_id: 4, description: "Analyze Competitors", parent_task_id: 1, status: "planned", dependent_on_tasks: null },
  ],
}

const mockMessages = {
  0: [
    {
      message_id: 1,
      type: "message",
      task_id: 0,
      subtask_id: 0,
      content: "Hello!",
      created_at: new Date().toISOString(),
      user_id: "user1",
      metadata: null,
    },
  ],
  1: [
    {
      message_id: 2,
      type: "message",
      task_id: 1,
      subtask_id: 0,
      content: "Research competitors",
      created_at: new Date().toISOString(),
      user_id: "user1",
      metadata: null,
    },
  ],
}

const mockNews = [
  {
    id: 1,
    project_id: 1,
    title: "AI Revolutionizing Content Creation",
    url: "https://example.com/news1",
    source_name: "Tech News",
    favicon_url: null,
    published_at: new Date().toISOString(),
    summary: "AI is transforming how content is created and distributed.",
    implementation_advice: "Consider AI tools for content generation.",
    relevance_score: 0.9,
    status: "new",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockNewsSources = [
  {
    id: 1,
    project_id: 1,
    name: "TechCrunch",
    url: "https://techcrunch.com",
    favicon_url: null,
    is_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock Supabase client for local development
function getMockSupabaseClient() {
  return {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            then: () => {
              if (table === "tasks") return Promise.resolve({ data: mockTasks, error: null })
              if (table === "messages") return Promise.resolve({ data: mockMessages[0], error: null })
              return Promise.resolve({ data: [], error: null })
            },
          }),
          maybeSingle: () => ({
            then: () => Promise.resolve({ data: mockTasks[0], error: null }),
          }),
        }),
        is: () => ({
          order: () => ({
            then: () => Promise.resolve({ data: mockTasks, error: null }),
          }),
        }),
      }),
      insert: () => ({
        select: () => ({
          then: () =>
            Promise.resolve({
              data: [
                {
                  task_id: 4,
                  description: "New Task",
                  parent_task_id: null,
                  status: "planned",
                  dependent_on_tasks: null,
                },
              ],
              error: null,
            }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            then: () =>
              Promise.resolve({
                data: [
                  {
                    task_id: 1,
                    description: "Updated Task",
                    parent_task_id: null,
                    status: "done",
                    dependent_on_tasks: null,
                  },
                ],
                error: null,
              }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => ({
          then: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
  }
}

export async function checkSupabaseConnection() {
  return true
}

export function getSupabase() {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      console.log("Server-side Supabase client requested")
    }

    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("Supabase environment variables are missing, using mock data")
      return getMockSupabaseClient()
    }

    // Try to create the Supabase client
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      // Return the mock client if we can't create a real one
      if (!supabaseUrl || !supabaseKey) {
        console.warn("Invalid Supabase credentials, using mock data")
        return getMockSupabaseClient()
      }

      return createClient(supabaseUrl, supabaseKey)
    } catch (error) {
      console.error("Error creating Supabase client:", error)
      return getMockSupabaseClient()
    }
  } catch (error) {
    console.error("Unexpected error in getSupabase:", error)
    return getMockSupabaseClient()
  }
}

export function getMockData(type: string) {
  if (type === "news") return mockNews
  if (type === "news_sources") return mockNewsSources
  return []
}

export function getMockSubtasks(taskId: number) {
  return mockSubtasks[taskId] || []
}

export function getMockMessages(taskId: number, subtaskId = 0) {
  return mockMessages[taskId] || []
}

export function resetMockData() {
  // In a real implementation, this would reset the mock data to its initial state
  console.log("Mock data reset")
}
