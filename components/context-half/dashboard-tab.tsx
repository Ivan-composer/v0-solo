"use client"

import { Tag } from "lucide-react"
import ReturnHomeButton from "./return-home-button"

interface DashboardTabProps {
  projectStage: string
}

export default function DashboardTab({ projectStage }: DashboardTabProps) {
  const isPostIdea = projectStage === "post_idea"

  const metrics = [
    {
      id: 1,
      name: "Market Potential",
      value: 85,
      change: "+12%",
      suggestion: "Growing market with room for innovation",
    },
    {
      id: 2,
      name: "Competition Level",
      value: 65,
      change: "-5%",
      suggestion: "Moderate competition, focus on differentiation",
    },
    {
      id: 3,
      name: "Technical Feasibility",
      value: 90,
      change: "+8%",
      suggestion: "Highly feasible with current technologies",
    },
    { id: 4, name: "Revenue Potential", value: 75, change: "+15%", suggestion: "Good monetization opportunities" },
    { id: 5, name: "Time to Market", value: 60, change: "-10%", suggestion: "Consider MVP approach to launch faster" },
    { id: 6, name: "Scalability", value: 80, change: "+5%", suggestion: "Highly scalable business model" },
  ]

  if (isPostIdea) {
    return (
      <div className="w-full max-w-[700px] mx-auto p-6">
        {/* Stage indicator for post-idea */}
        {isPostIdea && (
          <div className="flex items-center justify-between mb-4 bg-[#A7D8F0]/10 p-2 rounded-md">
            <div className="flex items-center">
              <Tag className="text-[#A7D8F0] mr-2" size={18} />
              <span className="text-[#A7D8F0] text-sm">Post-Idea Stage View</span>
            </div>
            <ReturnHomeButton />
          </div>
        )}

        <h2 className="text-xl font-semibold mb-6">Project Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-white p-4 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-gray-300"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{metric.name}</h3>
                <span className={metric.change.startsWith("+") ? "text-[#A7D8F0]" : "text-red-500"}>
                  {metric.change}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="h-2.5 rounded-full bg-[#A7D8F0]" style={{ width: `${metric.value}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Score: {metric.value}/100</span>
              </div>

              <p className="text-sm text-gray-600 mt-2">{metric.suggestion}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Original idea stage UI
  return (
    <div className="w-full max-w-[700px] mx-auto p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-white p-4 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-gray-300"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{metric.name}</h3>
              <span className={metric.change.startsWith("+") ? "text-[#A7D8F0]" : "text-red-500"}>{metric.change}</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div className="bg-[#A7D8F0] h-2.5 rounded-full" style={{ width: `${metric.value}%` }}></div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Score: {metric.value}/100</span>
            </div>

            <p className="text-sm text-gray-600 mt-2">{metric.suggestion}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
