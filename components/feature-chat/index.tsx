"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, CheckCircle } from "lucide-react"
import {
  getBacklogFeatures,
  getMessagesForFeatureQuestion,
  createFeatureQuestionMessage,
  updateBacklogFeatureWithQuestions,
  markFeatureAsClarified,
  convertFeatureToTask,
  type BacklogFeature,
  type FeatureQuestion,
  type Message,
} from "@/lib/database"
import FeatureQuestionItem from "./feature-question-item"
import MessageInput from "../task-chat/MessageInput"
import MessageList from "../task-chat/MessageList"
import { generateGrokResponse } from "@/lib/grok"

interface FeatureChatProps {
  featureId: number
  onBack: () => void
  onFeatureUpdated?: () => void
}

export default function FeatureChat({ featureId, onBack, onFeatureUpdated }: FeatureChatProps) {
  const [feature, setFeature] = useState<BacklogFeature | null>(null)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [allMessages, setAllMessages] = useState<Record<number, Message[]>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Default questions to use if none are provided
  const defaultQuestions: FeatureQuestion[] = [
    {
      question_index: 0,
      prompt: "What problem does this feature solve?",
      is_completed: false,
    },
    {
      question_index: 1,
      prompt: "Who are the target users for this feature?",
      is_completed: false,
    },
    {
      question_index: 2,
      prompt: "What are the key requirements for this feature?",
      is_completed: false,
    },
    {
      question_index: 3,
      prompt: "Are there any technical constraints to consider?",
      is_completed: false,
    },
  ]

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load feature data and messages
  useEffect(() => {
    async function loadFeatureData() {
      setLoading(true)
      try {
        // Get the feature details
        const features = await getBacklogFeatures(1) // Assuming project ID 1
        const currentFeature = features.find((f) => f.feature_id === featureId)

        if (currentFeature) {
          // Ensure the feature has the required fields
          const updatedFeature = {
            ...currentFeature,
            questions: currentFeature.questions || [],
            is_clarified: currentFeature.is_clarified || false,
            is_task_created: currentFeature.is_task_created || false,
            task_id: currentFeature.task_id || null,
          }

          // If the feature doesn't have questions, add default ones
          if (!updatedFeature.questions || updatedFeature.questions.length === 0) {
            updatedFeature.questions = defaultQuestions

            try {
              // Update the feature with default questions
              const result = await updateBacklogFeatureWithQuestions(featureId, defaultQuestions)
              if (result) {
                // Use the result if available
                setFeature(result)
              } else {
                // Otherwise use our local version
                setFeature(updatedFeature)
              }
            } catch (error) {
              console.error("Error updating feature with default questions:", error)
              // Continue with our local version even if the update fails
              setFeature(updatedFeature)
            }
          } else {
            setFeature(updatedFeature)
          }

          // Set the active question to the first incomplete one, or the first one if all are complete
          const firstIncompleteIndex = updatedFeature.questions.findIndex((q) => !q.is_completed)
          const activeIndex = firstIncompleteIndex !== -1 ? firstIncompleteIndex : 0
          setActiveQuestionIndex(activeIndex)

          // Initialize an empty messages object for all questions
          const messagesObj: Record<number, Message[]> = {}
          for (let i = 0; i < updatedFeature.questions.length; i++) {
            messagesObj[i] = []
          }
          setAllMessages(messagesObj)

          // Try to load messages for the active question
          try {
            const questionMessages = await getMessagesForFeatureQuestion(featureId, activeIndex)
            if (questionMessages.length > 0) {
              messagesObj[activeIndex] = questionMessages
              setAllMessages(messagesObj)
              setMessages(questionMessages)
            }
          } catch (error) {
            console.error("Error loading question messages:", error)
          }
        }
      } catch (error) {
        console.error("Error loading feature data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFeatureData()
  }, [featureId])

  // Function to handle question selection
  const handleQuestionSelect = async (index: number) => {
    if (index === activeQuestionIndex) return

    setActiveQuestionIndex(index)

    // Use cached messages if available
    if (allMessages[index]) {
      setMessages(allMessages[index])
    } else {
      // Try to load messages from the database
      try {
        const questionMessages = await getMessagesForFeatureQuestion(featureId, index)
        setMessages(questionMessages)

        // Update the cached messages
        setAllMessages((prev) => ({
          ...prev,
          [index]: questionMessages,
        }))
      } catch (error) {
        console.error(`Error loading messages for question ${index}:`, error)
        setMessages([])
      }
    }
  }

  // Function to handle sending a message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || activeQuestionIndex === null || !feature) return

    try {
      // Create and add the user message
      const newMessage = await createFeatureQuestionMessage(
        text,
        featureId,
        activeQuestionIndex,
        "current-user", // Replace with actual user ID when auth is implemented
      )

      if (newMessage) {
        // Update the messages state
        const updatedMessages = [...messages, newMessage]
        setMessages(updatedMessages)

        // Update the cached messages
        setAllMessages((prev) => ({
          ...prev,
          [activeQuestionIndex]: updatedMessages,
        }))

        setMessage("")

        // Show loading indicator
        setIsLoading(true)

        // Prepare conversation history for Grok
        const conversationHistory = updatedMessages
          .filter((msg) => msg.type === "message")
          .slice(-10) // Only use the last 10 messages for context
          .map((msg) => ({
            role: msg.user_id === "current-user" ? "user" : "assistant",
            content: msg.content,
          }))

        // Add a system message to provide context about the current question
        const currentQuestion = feature.questions[activeQuestionIndex]
        const systemPrompt = `You are an AI assistant helping to clarify details about a feature called "${feature.name}". The current question is: "${currentQuestion.prompt}". Be concise, helpful, and focus on extracting specific details that would help implement this feature.`

        conversationHistory.unshift({
          role: "system",
          content: systemPrompt,
        })

        try {
          // Get response from Grok
          const grokResponse = await generateGrokResponse(conversationHistory)

          // Create and add the assistant message
          const assistantMessage = await createFeatureQuestionMessage(
            grokResponse,
            featureId,
            activeQuestionIndex,
            null, // AI message
          )

          if (assistantMessage) {
            // Update the messages state with the AI response
            const messagesWithAI = [...updatedMessages, assistantMessage]
            setMessages(messagesWithAI)

            // Update the cached messages
            setAllMessages((prev) => ({
              ...prev,
              [activeQuestionIndex]: messagesWithAI,
            }))
          }
        } catch (error) {
          console.error("Error getting Grok response:", error)
          // Add an error message with a more user-friendly message
          const errorMessage = await createFeatureQuestionMessage(
            "I'm sorry, I'm having trouble connecting to my knowledge base right now. Let's continue our conversation when the connection is restored.",
            featureId,
            activeQuestionIndex,
            null,
          )
          if (errorMessage) {
            // Update the messages state with the error message
            const messagesWithError = [...updatedMessages, errorMessage]
            setMessages(messagesWithError)

            // Update the cached messages
            setAllMessages((prev) => ({
              ...prev,
              [activeQuestionIndex]: messagesWithError,
            }))
          }
        } finally {
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)
    }
  }

  // Function to mark a question as complete
  const handleMarkQuestionComplete = async (index: number, completed: boolean) => {
    if (!feature) return

    try {
      // Update the question's completion status
      const updatedQuestions = [...feature.questions]
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        is_completed: completed,
      }

      // Update the feature with the new questions
      const updatedFeature = await updateBacklogFeatureWithQuestions(featureId, updatedQuestions)

      if (updatedFeature) {
        setFeature(updatedFeature)

        // If all questions are complete, mark the feature as clarified
        if (updatedQuestions.every((q) => q.is_completed)) {
          const clarifiedFeature = await markFeatureAsClarified(featureId)
          if (clarifiedFeature) {
            setFeature(clarifiedFeature)
          }

          if (onFeatureUpdated) onFeatureUpdated()
        }

        // Move to the next incomplete question if this one was marked complete
        if (completed) {
          const nextIncompleteIndex = updatedQuestions.findIndex((q, i) => i > index && !q.is_completed)
          if (nextIncompleteIndex !== -1) {
            handleQuestionSelect(nextIncompleteIndex)
          }
        }
      } else {
        // If the database update failed, update the local state
        setFeature({
          ...feature,
          questions: updatedQuestions,
          is_clarified: updatedQuestions.every((q) => q.is_completed),
        })
      }
    } catch (error) {
      console.error(`Error updating question ${index}:`, error)

      // Update the local state even if the database update failed
      if (feature) {
        const updatedQuestions = [...feature.questions]
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          is_completed: completed,
        }

        setFeature({
          ...feature,
          questions: updatedQuestions,
          is_clarified: updatedQuestions.every((q) => q.is_completed),
        })
      }
    }
  }

  // Function to convert feature to task
  const handleConvertToTask = async () => {
    if (!feature) return

    try {
      const result = await convertFeatureToTask(featureId)
      if (result) {
        setFeature({
          ...feature,
          is_task_created: true,
          task_id: result.task.task_id,
        })

        if (onFeatureUpdated) onFeatureUpdated()
      }
    } catch (error) {
      console.error("Error converting feature to task:", error)
    }
  }

  // Function to save all details
  const handleSaveDetails = async () => {
    if (!feature) return

    try {
      const updatedFeature = await markFeatureAsClarified(featureId)
      if (updatedFeature) {
        setFeature(updatedFeature)
      }

      if (onFeatureUpdated) onFeatureUpdated()
      onBack()
    } catch (error) {
      console.error("Error saving details:", error)
      // Go back anyway
      onBack()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-[64px] p-4 border-b border-gray-200 flex items-center">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!feature) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <h2 className="text-xl font-semibold mb-4">Feature Not Found</h2>
        <p className="text-gray-600 mb-6">The feature you're looking for doesn't exist.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Back to Backlog
        </button>
      </div>
    )
  }

  const allQuestionsCompleted = feature.questions.every((q) => q.is_completed)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-[64px] p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="p-1 mr-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Back to backlog"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-semibold">{feature.name}</h2>
        </div>

        {allQuestionsCompleted && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveDetails}
              className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              Save Details
            </button>
            {!feature.is_task_created && (
              <button
                onClick={handleConvertToTask}
                className="px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm"
              >
                Turn into Task
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Questions list */}
        <div className="space-y-4 mb-6">
          {feature.questions.map((question, index) => (
            <FeatureQuestionItem
              key={index}
              question={question}
              index={index}
              isActive={index === activeQuestionIndex}
              onSelect={() => handleQuestionSelect(index)}
              onComplete={(completed) => handleMarkQuestionComplete(index, completed)}
              isCompleted={question.is_completed}
              isLocked={index > 0 && !feature.questions[index - 1].is_completed}
            />
          ))}
        </div>

        {/* Chat area for active question */}
        {activeQuestionIndex !== null && (
          <div className="mt-6">
            <h3 className="font-medium mb-4">{feature.questions[activeQuestionIndex].prompt}</h3>

            {/* Messages */}
            <MessageList messages={messages} />

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-center my-4">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            )}

            {/* Reference for scrolling */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200">
        <MessageInput
          value={message}
          onChange={setMessage}
          onSend={handleSendMessage}
          disabled={activeQuestionIndex === null}
        />

        {/* Mark as complete button */}
        {activeQuestionIndex !== null && !feature.questions[activeQuestionIndex].is_completed && (
          <button
            onClick={() => handleMarkQuestionComplete(activeQuestionIndex, true)}
            className="w-full mt-2 flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
          >
            <CheckCircle size={16} className="mr-2" />
            Mark Question as Complete
          </button>
        )}
      </div>
    </div>
  )
}
