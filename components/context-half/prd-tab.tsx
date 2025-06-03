"use client"

import { Tag } from "lucide-react"
import ReturnHomeButton from "./return-home-button"

interface PRDTabProps {
  projectStage: string
}

export default function PRDTab({ projectStage }: PRDTabProps) {
  const isPostIdea = projectStage === "post_idea"

  if (isPostIdea) {
    return (
      <div className="w-full max-w-[700px] mx-auto p-6 bg-white">
        {/* Stage indicator for post-idea */}
        <div className="flex items-center justify-between mb-4 bg-[#A7D8F0]/10 p-2 rounded-md">
          <div className="flex items-center">
            <Tag className="text-[#A7D8F0] mr-2" size={18} />
            <span className="text-[#A7D8F0] text-sm">Post-Idea Stage View</span>
          </div>
          <ReturnHomeButton />
        </div>

        <h2 className="text-xl font-semibold mb-6">Product Requirements Document</h2>

        <div className="prose max-w-none px-5">
          <h2>1. Introduction</h2>
          <p>
            The AI-powered content calendar is a tool designed to help content creators plan, schedule, and optimize
            their content across multiple platforms. The tool leverages artificial intelligence to suggest content
            ideas, optimal posting times, and content performance analytics.
          </p>

          <h2>2. Problem Statement</h2>
          <p>
            Content creators struggle with consistently generating fresh content ideas and determining the optimal time
            to post for maximum engagement. Current solutions lack intelligent recommendations based on trending topics
            and audience behavior.
          </p>

          <h2>3. Target Audience</h2>
          <ul>
            <li>Social media content creators</li>
            <li>Digital marketing professionals</li>
            <li>Small business owners managing their own content</li>
            <li>Bloggers and newsletter writers</li>
          </ul>

          <h2>4. Key Features</h2>
          <h3>4.1 AI-Powered Content Suggestions</h3>
          <p>
            The system will analyze trending topics and user preferences to suggest relevant content ideas tailored to
            the creator's niche and audience.
          </p>

          <h3>4.2 Optimal Scheduling</h3>
          <p>
            Using historical engagement data, the system will recommend the best times to post content for maximum reach
            and engagement.
          </p>

          <h3>4.3 Content Calendar</h3>
          <p>Visual calendar interface for planning and scheduling content across multiple platforms.</p>

          <h3>4.4 Performance Analytics</h3>
          <p>Comprehensive analytics dashboard to track content performance and audience engagement.</p>

          <h2>5. Success Metrics</h2>
          <ul>
            <li>User engagement with suggested content ideas</li>
            <li>Improvement in content engagement rates</li>
            <li>User retention and platform usage frequency</li>
            <li>Time saved in content planning process</li>
          </ul>

          <h2>6. Implementation Timeline</h2>
          <p>To be determined based on development resources and priorities.</p>
        </div>
      </div>
    )
  }

  // Original idea stage UI
  return (
    <div className="w-full max-w-[700px] mx-auto p-5 bg-white">
      <div className="prose max-w-none px-5">
        <h1>Product Requirements Document</h1>

        <h2>1. Introduction</h2>
        <p>
          The AI-powered content calendar is a tool designed to help content creators plan, schedule, and optimize their
          content across multiple platforms. The tool leverages artificial intelligence to suggest content ideas,
          optimal posting times, and content performance analytics.
        </p>

        <h2>2. Problem Statement</h2>
        <p>
          Content creators struggle with consistently generating fresh content ideas and determining the optimal time to
          post for maximum engagement. Current solutions lack intelligent recommendations based on trending topics and
          audience behavior.
        </p>

        <h2>3. Target Audience</h2>
        <ul>
          <li>Social media content creators</li>
          <li>Digital marketing professionals</li>
          <li>Small business owners managing their own content</li>
          <li>Bloggers and newsletter writers</li>
        </ul>

        <h2>4. Key Features</h2>
        <h3>4.1 AI-Powered Content Suggestions</h3>
        <p>
          The system will analyze trending topics and user preferences to suggest relevant content ideas tailored to the
          creator's niche and audience.
        </p>

        <h3>4.2 Optimal Scheduling</h3>
        <p>
          Using historical engagement data, the system will recommend the best times to post content for maximum reach
          and engagement.
        </p>

        <h3>4.3 Content Calendar</h3>
        <p>Visual calendar interface for planning and scheduling content across multiple platforms.</p>

        <h3>4.4 Performance Analytics</h3>
        <p>Comprehensive analytics dashboard to track content performance and audience engagement.</p>

        <h2>5. Success Metrics</h2>
        <ul>
          <li>User engagement with suggested content ideas</li>
          <li>Improvement in content engagement rates</li>
          <li>User retention and platform usage frequency</li>
          <li>Time saved in content planning process</li>
        </ul>

        <h2>6. Implementation Timeline</h2>
        <p>To be determined based on development resources and priorities.</p>
      </div>
    </div>
  )
}
