import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()

    // Simple fallback response
    const response = "I'm sorry, the AI service is currently unavailable. This is a placeholder response."

    // Return a successful response
    return NextResponse.json({
      response,
      success: true,
    })
  } catch (error) {
    console.error("Error in Grok API route:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
