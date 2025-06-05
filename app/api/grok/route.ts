import { NextResponse } from "next/server"

// Define the expected request body type
type RequestBody = {
  messages: {
    role: "user" | "assistant" | "system"
    content: string
  }[]
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: RequestBody = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request format. 'messages' array is required" }, { status: 400 })
    }

    console.log("Received messages:", JSON.stringify(messages, null, 2))

    // Extract the system message for context
    const systemMessage = messages.find((msg) => msg.role === "system")?.content || ""

    // Get the last user message
    const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user")?.content || ""

    // Get all previous user messages to understand the full context
    const userMessages = messages.filter((msg) => msg.role === "user").map((msg) => msg.content)

    // Get the conversation history as pairs of user/assistant messages
    const conversationPairs = []
    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].role === "user" && messages[i + 1].role === "assistant") {
        conversationPairs.push({
          question: messages[i].content,
          answer: messages[i + 1].content,
        })
      }
    }

    // Generate a response based on the conversation context
    const response = generateContextualResponse(lastUserMessage, userMessages, systemMessage, conversationPairs)

    return NextResponse.json({
      choices: [
        {
          message: {
            content: response,
          },
        },
      ],
    })
  } catch (error) {
    console.error("Error processing request:", error)

    // Return a graceful fallback response
    return NextResponse.json({
      choices: [
        {
          message: {
            content: "I apologize, but I encountered an error while processing your request. Please try again later.",
          },
        },
      ],
    })
  }
}

function generateContextualResponse(
  lastUserMessage: string,
  allUserMessages: string[],
  systemContext: string,
  conversationPairs: Array<{ question: string; answer: string }>,
): string {
  // Convert to lowercase for easier matching
  const lastMessageLower = lastUserMessage.toLowerCase()

  // Check if this is a follow-up question
  const isFollowUp = allUserMessages.length > 1

  // Extract task context if available
  let taskContext = ""
  const taskMatch = systemContext.match(/task: "([^"]+)"/)
  if (taskMatch && taskMatch[1]) {
    taskContext = taskMatch[1]
  }

  // Check for specific topics in the message
  const containsTopic = (topics: string[]) => topics.some((topic) => lastMessageLower.includes(topic))

  // Generate response based on context
  if (
    lastMessageLower.startsWith("what") ||
    lastMessageLower.startsWith("how") ||
    lastMessageLower.startsWith("why") ||
    lastMessageLower.startsWith("when") ||
    lastMessageLower.startsWith("where") ||
    lastMessageLower.startsWith("who") ||
    lastMessageLower.startsWith("can you") ||
    lastMessageLower.includes("?")
  ) {
    // It's a question
    if (taskContext && lastMessageLower.includes(taskContext.toLowerCase())) {
      return `Based on the task "${taskContext}", I would recommend approaching this by breaking it down into smaller steps. First, you should analyze the requirements, then plan your implementation strategy, and finally execute with regular testing. Would you like me to elaborate on any of these steps?`
    }

    if (containsTopic(["feature", "implement", "build", "create", "develop"])) {
      return `That's an interesting question about implementation. When building this feature, you should consider the user experience, technical feasibility, and integration with existing systems. Would you like me to help you create a more detailed plan for this implementation?`
    }

    if (containsTopic(["problem", "issue", "error", "bug", "fix", "solve"])) {
      return `To troubleshoot this issue effectively, we should first identify the root cause. Based on what you've described, it could be related to data handling, user interface, or system integration. Let's systematically address each possibility. What specific symptoms or error messages are you seeing?`
    }

    // Generic question response that references previous conversation
    if (isFollowUp && conversationPairs.length > 0) {
      const lastPair = conversationPairs[conversationPairs.length - 1]
      return `Regarding your question about ${extractTopic(lastUserMessage)}, and following up on our discussion about ${extractTopic(lastPair.question)}, I think the key consideration here is how these elements work together in your project. Would you like me to explore this connection further?`
    }

    return `That's a great question about ${extractTopic(lastUserMessage)}. This is an important aspect of your project that deserves careful consideration. Would you like me to provide some specific recommendations or examples related to this?`
  }

  // Handle statements or commands
  if (containsTopic(["thanks", "thank you", "appreciate"])) {
    return "You're welcome! I'm glad I could help. Is there anything else you'd like to discuss about your project?"
  }

  if (containsTopic(["hello", "hi", "hey", "greetings"])) {
    if (isFollowUp) {
      return `Hello again! We were just discussing ${extractTopic(allUserMessages[allUserMessages.length - 2])}. Would you like to continue with that topic or explore something new?`
    }
    return "Hello! I'm your project assistant. How can I help you with your project today?"
  }

  if (isFollowUp) {
    // Reference previous conversation for continuity
    const topics = allUserMessages.slice(0, -1).map((msg) => extractTopic(msg))
    const uniqueTopics = [...new Set(topics)].slice(-2) // Get last 2 unique topics

    return `I see you're continuing our conversation about ${uniqueTopics.join(" and ")}. Based on what we've discussed so far, I think we should focus on how these elements integrate into your overall project strategy. What specific aspect would you like to explore further?`
  }

  // Default response for other types of messages
  return `I understand you're interested in ${extractTopic(lastUserMessage)}. This is an important aspect of project development. Would you like me to provide more specific guidance on how to approach this effectively?`
}

function extractTopic(message: string): string {
  // Simple function to extract a likely topic from a message
  const message_lower = message.toLowerCase()

  // Common project-related topics to check for
  const topics = [
    "design",
    "development",
    "planning",
    "research",
    "testing",
    "implementation",
    "user experience",
    "interface",
    "database",
    "architecture",
    "features",
    "requirements",
    "timeline",
    "resources",
    "budget",
    "stakeholders",
    "marketing",
    "launch",
    "deployment",
    "maintenance",
    "scaling",
  ]

  for (const topic of topics) {
    if (message_lower.includes(topic)) {
      return topic
    }
  }

  // If no specific topic found, extract a noun phrase (simplified approach)
  const words = message.split(" ")
  if (words.length > 3) {
    return words.slice(0, 3).join(" ") + "..." // First few words
  }

  return "your project" // Fallback
}
