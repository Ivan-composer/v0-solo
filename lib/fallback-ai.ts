// This is a simple fallback AI implementation that doesn't rely on external APIs
// It provides basic responses to common queries

const FALLBACK_RESPONSES: Record<string, string> = {
  hello: "Hello! How can I help you with your project today?",
  hi: "Hi there! What would you like to work on today?",
  help: "I'm here to help you with your project. You can ask me about project planning, task management, or specific questions about your current task.",
  thanks: "You're welcome! Let me know if you need anything else.",
  "thank you": "You're welcome! I'm happy to help.",
  default: "I understand. Let me know if you need any specific assistance with your project tasks.",
}

export function generateFallbackResponse(messages: { role: string; content: string }[]): string {
  // Get the last user message
  const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user")

  if (!lastUserMessage) {
    return FALLBACK_RESPONSES.default
  }

  const userText = lastUserMessage.content.toLowerCase().trim()

  // Check for exact matches first
  if (FALLBACK_RESPONSES[userText]) {
    return FALLBACK_RESPONSES[userText]
  }

  // Check for partial matches
  for (const [key, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (userText.includes(key)) {
      return response
    }
  }

  // Get task context if available
  const systemMessage = messages.find((msg) => msg.role === "system")
  if (systemMessage && systemMessage.content.includes("task:")) {
    const taskMatch = systemMessage.content.match(/task: "([^"]+)"/)
    if (taskMatch && taskMatch[1]) {
      return `I'm here to help with your task "${taskMatch[1]}". What specific aspect would you like assistance with?`
    }
  }

  // Default response
  return FALLBACK_RESPONSES.default
}
