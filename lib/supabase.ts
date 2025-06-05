import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co"
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })
  }

  return supabaseClient
}

// Mock data for development and testing
const mockData = {
  tasks: [
    {
      task_id: 1,
      description: "Market Research",
      parent_task_id: null,
      status: "in_progress",
      dependent_on_tasks: null,
    },
    {
      task_id: 2,
      description: "Competitor Analysis",
      parent_task_id: null,
      status: "planned",
      dependent_on_tasks: [1],
    },
    {
      task_id: 3,
      description: "User Interviews",
      parent_task_id: null,
      status: "planned",
      dependent_on_tasks: [1],
    },
    {
      task_id: 4,
      description: "Feature Prioritization",
      parent_task_id: null,
      status: "planned",
      dependent_on_tasks: [2, 3],
    },
    {
      task_id: 5,
      description: "MVP Definition",
      parent_task_id: null,
      status: "planned",
      dependent_on_tasks: [4],
    },
    {
      task_id: 10,
      description: "Payment Gateway Integration",
      parent_task_id: null,
      status: "planned",
      dependent_on_tasks: [5],
    },
    {
      task_id: 11,
      description: "Product Catalog Design",
      parent_task_id: null,
      status: "planned",
      dependent_on_tasks: [3, 4],
    },
    {
      task_id: 12,
      description: "User Authentication System",
      parent_task_id: null,
      status: "planned",
      dependent_on_tasks: [2],
    },
    {
      task_id: 13,
      description: "Shopping Cart Functionality",
      parent_task_id: null,
      status: "planned",
      dependent_on_tasks: [11, 10],
    },
    {
      task_id: 14,
      description: "Order Management System",
      parent_task_id: null,
      status: "planned",
      dependent_on_tasks: [13],
    },
    {
      task_id: 15,
      description: "Inventory Management",
      parent_task_id: null,
      status: "planned",
      dependent_on_tasks: [11, 14],
    },
    {
      task_id: 16,
      description: "Search & Filter Implementation",
      parent_task_id: null,
      status: "planned",
      dependent_on_tasks: [11],
    },
    {
      task_id: 17,
      description: "User Reviews & Ratings",
      parent_task_id: null,
      status: "planned",
      dependent_on_tasks: [12, 13],
    },
    {
      task_id: 18,
      description: "Shipping Integration",
      parent_task_id: null,
      status: "planned",
      dependent_on_tasks: [14],
    },
    {
      task_id: 19,
      description: "Analytics Dashboard",
      parent_task_id: null,
      status: "planned",
      dependent_on_tasks: [14, 15, 17],
    },
  ],
  subtasks: {
    1: [
      {
        task_id: 101,
        description: "Analyze competitor strengths and weaknesses",
        parent_task_id: 1,
        status: "in_progress",
        dependent_on_tasks: null,
      },
      {
        task_id: 102,
        description: "Identify market trends",
        parent_task_id: 1,
        status: "planned",
        dependent_on_tasks: null,
      },
      {
        task_id: 103,
        description: "Analyze target audience",
        parent_task_id: 1,
        status: "planned",
        dependent_on_tasks: null,
      },
      {
        task_id: 104,
        description: "Identify market gaps",
        parent_task_id: 1,
        status: "planned",
        dependent_on_tasks: null,
      },
    ],
  },
  messages: {
    0: [
      {
        message_id: 1,
        type: "message",
        task_id: 0,
        subtask_id: 0,
        content: "I want to build an e-commerce platform for handmade goods. Where should I start?",
        created_at: "2023-05-01T10:00:00Z",
        user_id: "user-1",
        metadata: null,
      },
      {
        message_id: 2,
        type: "message",
        task_id: 0,
        subtask_id: 0,
        content:
          "That's a great idea! Let's start by breaking this down into tasks. First, you should conduct market research to understand the landscape and identify opportunities.",
        created_at: "2023-05-01T10:01:00Z",
        user_id: null,
        metadata: null,
      },
      {
        message_id: 3,
        type: "event",
        task_id: 0,
        subtask_id: 0,
        content: "Created task: Market Research",
        created_at: "2023-05-01T10:01:30Z",
        user_id: null,
        metadata: { task_id: 1 },
      },
    ],
    1: [
      {
        message_id: 101,
        type: "message",
        task_id: 1,
        subtask_id: 0,
        content: "What should I focus on for the market research task?",
        created_at: "2023-05-01T11:00:00Z",
        user_id: "user-1",
        metadata: null,
      },
      {
        message_id: 102,
        type: "message",
        task_id: 1,
        subtask_id: 0,
        content:
          "For market research, you should analyze competitors, identify market trends, understand your target audience, and look for gaps in the market. Let me create subtasks for these.",
        created_at: "2023-05-01T11:01:00Z",
        user_id: null,
        metadata: null,
      },
      {
        message_id: 103,
        type: "event",
        task_id: 1,
        subtask_id: 0,
        content: "Created subtask: Analyze competitor strengths and weaknesses",
        created_at: "2023-05-01T11:01:30Z",
        user_id: null,
        metadata: { subtask_id: 101 },
      },
      {
        message_id: 104,
        type: "event",
        task_id: 1,
        subtask_id: 0,
        content: "Created subtask: Identify market trends",
        created_at: "2023-05-01T11:01:45Z",
        user_id: null,
        metadata: { subtask_id: 102 },
      },
      {
        message_id: 105,
        type: "event",
        task_id: 1,
        subtask_id: 0,
        content: "Created subtask: Analyze target audience",
        created_at: "2023-05-01T11:02:00Z",
        user_id: null,
        metadata: { subtask_id: 103 },
      },
      {
        message_id: 106,
        type: "event",
        task_id: 1,
        subtask_id: 0,
        content: "Created subtask: Identify market gaps",
        created_at: "2023-05-01T11:02:15Z",
        user_id: null,
        metadata: { subtask_id: 104 },
      },
    ],
    "1-101": [
      {
        message_id: 1001,
        type: "message",
        task_id: 1,
        subtask_id: 101,
        content: "How should I analyze the competitors?",
        created_at: "2023-05-01T12:00:00Z",
        user_id: "user-1",
        metadata: null,
      },
      {
        message_id: 1002,
        type: "message",
        task_id: 1,
        subtask_id: 101,
        content:
          "Here's what you need to do for this subtask:\n\n1. Research at least 5 direct competitors\n2. Analyze their product offerings\n3. Identify their pricing strategies\n4. Note their unique selling propositions",
        created_at: "2023-05-01T12:01:00Z",
        user_id: null,
        metadata: null,
      },
    ],
  },
  backlog_features: [
    {
      feature_id: 1,
      user_id: "00000000-0000-0000-0000-000000000001",
      project_id: 1,
      priority: 1,
      name: "User Authentication",
      description: "Implement secure user authentication with email and social login options.",
      date_added: "2023-05-01T10:00:00Z",
      is_clarified: false,
      is_task_created: false,
      questions: [
        {
          question_index: 0,
          prompt: "What authentication methods should be supported?",
          is_completed: false,
        },
        {
          question_index: 1,
          prompt: "Do we need role-based access control?",
          is_completed: false,
        },
        {
          question_index: 2,
          prompt: "What are the security requirements?",
          is_completed: false,
        },
      ],
    },
    {
      feature_id: 2,
      user_id: "00000000-0000-0000-0000-000000000001",
      project_id: 1,
      priority: 2,
      name: "Product Listings",
      description: "Create a system for sellers to list their handmade products with details and images.",
      date_added: "2023-05-01T11:00:00Z",
      is_clarified: false,
      is_task_created: false,
      questions: [
        {
          question_index: 0,
          prompt: "What product details should be captured?",
          is_completed: false,
        },
        {
          question_index: 1,
          prompt: "How many images should be supported per product?",
          is_completed: false,
        },
        {
          question_index: 2,
          prompt: "Should we support video content for products?",
          is_completed: false,
        },
      ],
    },
    {
      feature_id: 3,
      user_id: "00000000-0000-0000-0000-000000000001",
      project_id: 1,
      priority: 3,
      name: "Search and Filtering",
      description: "Implement robust search functionality with filters for categories, price, etc.",
      date_added: "2023-05-01T12:00:00Z",
      is_clarified: true,
      is_task_created: false,
      questions: [
        {
          question_index: 0,
          prompt: "What search algorithm should we use?",
          is_completed: true,
        },
        {
          question_index: 1,
          prompt: "What filters are most important for users?",
          is_completed: true,
        },
        {
          question_index: 2,
          prompt: "Should we implement saved searches?",
          is_completed: true,
        },
      ],
    },
  ],
  backlog_ideas: [
    {
      idea_id: 1,
      user_id: "00000000-0000-0000-0000-000000000001",
      project_id: 1,
      priority: 1,
      name: "Artisan Verification System",
      description: "A system to verify that sellers are genuine artisans creating handmade products.",
    },
    {
      idea_id: 2,
      user_id: "00000000-0000-0000-0000-000000000001",
      project_id: 1,
      priority: 2,
      name: "Sustainability Badges",
      description: "Award badges to products that meet certain sustainability criteria.",
    },
    {
      idea_id: 3,
      user_id: "00000000-0000-0000-0000-000000000001",
      project_id: 1,
      priority: 3,
      name: "Virtual Try-On",
      description: "AR feature to virtually try on jewelry and accessories.",
    },
  ],
  news: [
    {
      id: 1001,
      project_id: 2,
      title: "Stripe Launches New Payment Features for E-commerce",
      url: "https://stripe.com/blog/new-features",
      source_name: "Stripe Blog",
      favicon_url: "https://stripe.com/favicon.ico",
      published_at: "2023-06-15T10:00:00Z",
      summary:
        "Stripe has introduced new payment features designed specifically for e-commerce platforms, including improved checkout experiences, fraud prevention tools, and better subscription management.",
      implementation_advice:
        "Consider integrating Stripe's new checkout system into your e-commerce platform to improve conversion rates and reduce cart abandonment. The new fraud prevention tools could also help protect your business from chargebacks.",
      relevance_score: 0.95,
      status: "new",
      created_at: "2023-06-15T12:00:00Z",
      updated_at: "2023-06-15T12:00:00Z",
    },
    {
      id: 1002,
      project_id: 2,
      title: "Shopify Introduces New API for Headless Commerce",
      url: "https://shopify.dev/blog/headless-commerce",
      source_name: "Shopify Dev Blog",
      favicon_url: "https://shopify.com/favicon.ico",
      published_at: "2023-06-10T14:30:00Z",
      summary:
        "Shopify has released a new API specifically designed for headless commerce implementations, allowing developers to create custom storefronts with greater flexibility while leveraging Shopify's backend infrastructure.",
      implementation_advice:
        "This could be relevant if you're considering a headless architecture for your e-commerce platform. The new API would allow you to create a custom frontend experience while using Shopify's reliable backend services.",
      relevance_score: 0.85,
      status: "new",
      created_at: "2023-06-10T16:00:00Z",
      updated_at: "2023-06-10T16:00:00Z",
    },
    {
      id: 1003,
      project_id: 2,
      title: "Amazon Introduces New Features for Small Sellers",
      url: "https://sell.amazon.com/blog/new-features",
      source_name: "Amazon Seller Central",
      favicon_url: "https://amazon.com/favicon.ico",
      published_at: "2023-06-05T09:15:00Z",
      summary:
        "Amazon has launched new tools and features specifically designed to help small and medium-sized businesses compete more effectively on their platform, including improved analytics, inventory management, and marketing tools.",
      implementation_advice:
        "While your platform is separate from Amazon, you might want to consider implementing similar seller-focused features to attract artisans to your platform. The analytics and inventory management tools could be particularly valuable for your sellers.",
      relevance_score: 0.75,
      status: "read",
      created_at: "2023-06-05T11:00:00Z",
      updated_at: "2023-06-06T09:00:00Z",
    },
    {
      id: 1004,
      project_id: 2,
      title: "Study Shows Growing Demand for Handmade Products",
      url: "https://craftindustryalliance.org/market-research",
      source_name: "Craft Industry Alliance",
      favicon_url: "https://craftindustryalliance.org/favicon.ico",
      published_at: "2023-05-28T13:45:00Z",
      summary:
        "A new market research study indicates that consumer demand for handmade and artisanal products has increased by 35% over the past year, with particular growth in home decor, jewelry, and sustainable products.",
      implementation_advice:
        "This research validates your platform's focus on handmade goods. Consider highlighting these growing categories (home decor, jewelry, sustainable products) in your platform's design and marketing.",
      relevance_score: 0.9,
      status: "backlog",
      created_at: "2023-05-28T15:00:00Z",
      updated_at: "2023-05-29T10:00:00Z",
    },
    {
      id: 1005,
      project_id: 2,
      title: "New EU Regulations for E-commerce Platforms",
      url: "https://ec.europa.eu/digital-single-market/en/news",
      source_name: "European Commission",
      favicon_url: "https://ec.europa.eu/favicon.ico",
      published_at: "2023-05-20T08:30:00Z",
      summary:
        "The European Union has announced new regulations for e-commerce platforms that will come into effect next year, focusing on consumer protection, transparency, and platform liability for third-party sellers.",
      implementation_advice:
        "If you plan to operate in the EU market, you'll need to ensure your platform complies with these new regulations. Key areas to focus on include transparent seller verification, clear return policies, and proper handling of consumer data.",
      relevance_score: 0.8,
      status: "dismissed",
      created_at: "2023-05-20T10:00:00Z",
      updated_at: "2023-05-21T09:00:00Z",
    },
  ],
  news_sources: [
    {
      id: 1,
      project_id: 2,
      name: "Stripe Blog",
      url: "https://stripe.com/blog",
      favicon_url: "https://stripe.com/favicon.ico",
      is_enabled: true,
      created_at: "2023-05-01T10:00:00Z",
      updated_at: "2023-05-01T10:00:00Z",
    },
    {
      id: 2,
      project_id: 2,
      name: "Shopify Dev Blog",
      url: "https://shopify.dev/blog",
      favicon_url: "https://shopify.com/favicon.ico",
      is_enabled: true,
      created_at: "2023-05-01T10:05:00Z",
      updated_at: "2023-05-01T10:05:00Z",
    },
    {
      id: 3,
      project_id: 2,
      name: "E-commerce Trends",
      url: "https://ecommercenews.eu",
      favicon_url: "https://ecommercenews.eu/favicon.ico",
      is_enabled: true,
      created_at: "2023-05-01T10:10:00Z",
      updated_at: "2023-05-01T10:10:00Z",
    },
    {
      id: 4,
      project_id: 2,
      name: "TechCrunch E-commerce",
      url: "https://techcrunch.com/category/e-commerce",
      favicon_url: "https://techcrunch.com/favicon.ico",
      is_enabled: false,
      created_at: "2023-05-01T10:15:00Z",
      updated_at: "2023-05-01T10:15:00Z",
    },
  ],
  projects: [
    {
      project_id: 1,
      title: "Handmade Marketplace",
      description: "An e-commerce platform for artisans to sell handmade products",
      stage: "ideation",
    },
    {
      project_id: 2,
      title: "E-commerce Platform",
      description: "A comprehensive e-commerce solution with advanced features",
      stage: "implementation",
    },
  ],
}

// Function to get mock data
export function getMockData(table: keyof typeof mockData) {
  return mockData[table]
}

// Function to get mock subtasks for a specific task
export function getMockSubtasks(taskId: number) {
  return mockData.subtasks[taskId as keyof typeof mockData.subtasks] || []
}

// Function to get mock messages for a specific context
export function getMockMessages(taskId: number, subtaskId = 0) {
  const key = subtaskId > 0 ? `${taskId}-${subtaskId}` : `${taskId}`
  return mockData.messages[key as keyof typeof mockData.messages] || []
}

export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      console.warn("Supabase client is not initialized.")
      return false
    }

    // Исправлено: используем правильное имя колонки 'id' вместо 'project_id'
    const { data, error } = await supabase.from("projects").select("id").limit(1)

    if (error) {
      console.error("Supabase connection error:", error.message)
      return false
    }

    return true
  } catch (error) {
    console.error("Error checking Supabase connection:", error)
    return false
  }
}

// Add a new function to test the connection and list available tables
export async function testSupabaseConnection() {
  try {
    const supabase = getSupabase()

    console.log("Testing Supabase connection...")
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("Anon Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    // Try to get information about available tables
    const { data, error } = await supabase
      .rpc("get_schema_tables")
      .then(() => {
        // If RPC doesn't work, try a direct query
        return supabase.from("pg_tables").select("tablename").eq("schemaname", "public").limit(10)
      })
      .catch(() => {
        // If that doesn't work either, try the most basic approach
        return supabase.from("information_schema.tables").select("table_name").eq("table_schema", "public").limit(10)
      })

    if (error) {
      console.error("Error fetching tables:", error)
      return { success: false, error: error.message, tables: [] }
    }

    console.log("Available tables:", data)
    return { success: true, error: null, tables: data || [] }
  } catch (err) {
    console.error("Exception during connection test:", err)
    return { success: false, error: err.message, tables: [] }
  }
}

// Add a simpler connection test
export async function simpleConnectionTest() {
  try {
    const supabase = getSupabase()

    // Try a simple query - just check if we can connect
    const { data, error } = await supabase.from("pg_stat_database").select("datname").limit(1)

    if (error) {
      console.error("Simple connection test failed:", error)
      return { success: false, error: error.message }
    }

    console.log("Connection successful! Database version:", data)
    return { success: true, error: null, version: data }
  } catch (err) {
    console.error("Exception during simple connection test:", err)
    return { success: false, error: err.message }
  }
}
