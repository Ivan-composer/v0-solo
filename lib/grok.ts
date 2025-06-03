// Function to generate a response from Grok
export async function generateGrokResponse(messages: { role: "user" | "assistant" | "system"; content: string }[]) {
  try {
    // Make sure we're sending the full conversation history
    console.log("Sending to Grok API:", JSON.stringify(messages, null, 2))

    // Call our API route
    const response = await fetch("/api/grok", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    })

    const data = await response.json()

    // Check if we have a valid response with choices
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content
    } else if (data.error) {
      console.error("Error from API route:", data.error)
      return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Can you please try again later?"
    } else {
      console.error("Unexpected response format:", data)
      return "I'm sorry, I encountered an unexpected issue. Can you please try again?"
    }
  } catch (error) {
    console.error("Error generating response:", error)
    return "I apologize for the inconvenience, but I'm having technical difficulties at the moment. Please try again later."
  }
}
