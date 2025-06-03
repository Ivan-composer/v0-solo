"use client"

import { ChevronDown, ChevronUp, Lock, CheckCircle } from "lucide-react"
import { cn } from "@/utils/cn"
import type { FeatureQuestion } from "@/lib/database"

interface FeatureQuestionItemProps {
  question: FeatureQuestion
  index: number
  isActive: boolean
  isCompleted: boolean
  isLocked: boolean
  onSelect: () => void
  onComplete: (completed: boolean) => void
}

export default function FeatureQuestionItem({
  question,
  index,
  isActive,
  isCompleted,
  isLocked,
  onSelect,
  onComplete,
}: FeatureQuestionItemProps) {
  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden transition-all",
        isActive ? "border-primary" : "border-gray-200",
        isLocked ? "opacity-60" : "hover:border-gray-300",
      )}
    >
      <div
        className={cn(
          "p-3 flex justify-between items-center cursor-pointer",
          isActive ? "bg-primary/5" : "bg-white",
          isLocked && "cursor-not-allowed",
        )}
        onClick={() => !isLocked && onSelect()}
      >
        <div className="flex items-center">
          <div
            className={cn(
              "w-6 h-6 rounded-full mr-3 flex items-center justify-center",
              isCompleted
                ? "bg-green-100 text-green-700"
                : isActive
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-100 text-gray-500",
            )}
          >
            {isCompleted ? (
              <CheckCircle size={14} />
            ) : isLocked ? (
              <Lock size={14} />
            ) : (
              <span className="text-xs font-medium">{index + 1}</span>
            )}
          </div>
          <span className={cn(isCompleted && "line-through text-gray-500")}>{question.prompt}</span>
        </div>
        {isActive ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
    </div>
  )
}
