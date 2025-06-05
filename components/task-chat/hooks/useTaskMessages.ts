"use client"

import { useState, useEffect, useCallback } from "react"
import { getMessagesForTask, createMessage, type Message, type Task } from "@/lib/database"

// Local function to generate AI responses
async function generateGrokResponse(conversationHistory: Array<{ role: string; content: string }>) {
  try {
    const response = await fetch("/api/grok", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: conversationHistory }),
    })

    if (!response.ok) {
      throw new Error("Failed to get AI response")
    }

    const data = await response.json()
    return data.message || "I'm here to help! What would you like to work on?"
  } catch (error) {
    console.error("Error calling AI API:", error)
    return "I'm having trouble connecting right now. Let's continue our conversation when the connection is restored."
  }
}

export function useTaskMessages(effectiveTaskId?: string | null, currentTask?: Task | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadMessages = useCallback(async () => {
    if (!effectiveTaskId || effectiveTaskId === "undefined") {
      setMessages([])
      return
    }

    try {
      const messagesData = await getMessagesForTask(effectiveTaskId)
      setMessages(messagesData)
    } catch (error) {
      console.error("Error loading messages:", error)
      setMessages([])
    }
  }, [effectiveTaskId])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const sendMessage = useCallback(
    async (text: string, activeSubtask?: string | null, getActiveSubtask?: () => Task | undefined) => {
      if (!effectiveTaskId || effectiveTaskId === "undefined" || !text.trim() || !currentTask) return

      try {
        setIsLoading(true)

        // Determine which task to send the message to
        let targetTaskId = effectiveTaskId
        if (
          activeSubtask &&
          activeSubtask !== "undefined" &&
          activeSubtask.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
        ) {
          targetTaskId = activeSubtask
        }

        // Create and add the user message
        const newMessage = await createMessage(targetTaskId, text, null, "user")

        if (newMessage) {
          setMessages((prev) => [...prev, newMessage])

          // Prepare conversation history for AI
          const conversationHistory = messages
            .filter((msg) => msg.role === "user" || msg.role === "agent")
            .slice(-10)
            .map((msg) => ({
              role: msg.role === "user" ? "user" : "assistant",
              content: msg.content,
            }))

          // Add the new user message
          conversationHistory.push({
            role: "user",
            content: text,
          })

          // Add a system message to provide context about the current task/subtask
          let systemPrompt = `You are an AI assistant helping with the task: "${currentTask.title}".`
          if (activeSubtask && getActiveSubtask) {
            const subtask = getActiveSubtask()
            if (subtask) {
              systemPrompt += ` Currently working on subtask: "${subtask.title}".`
            }
          }
          systemPrompt += " Be concise, helpful, and focus on providing actionable advice."

          conversationHistory.unshift({
            role: "system",
            content: systemPrompt,
          })

          try {
            // Get response from AI
            const aiResponse = await generateGrokResponse(conversationHistory)

            // Create and add the assistant message
            const assistantMessage = await createMessage(targetTaskId, aiResponse, null, "agent")

            if (assistantMessage) {
              setMessages((prev) => [...prev, assistantMessage])
            }
          } catch (error) {
            console.error("Error getting AI response:", error)
            // Add an error message
            const errorMessage = await createMessage(
              targetTaskId,
              "I'm sorry, I'm having trouble connecting to my knowledge base right now. Let's continue our conversation when the connection is restored.",
              null,
              "system",
            )
            if (errorMessage) {
              setMessages((prev) => [...prev, errorMessage])
            }
          }
        }
      } catch (error) {
        console.error("Error sending message:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [effectiveTaskId, currentTask, messages],
  )

  return {
    messages,
    isLoading,
    sendMessage,
    setMessages,
    loadMessages,
  }
}
