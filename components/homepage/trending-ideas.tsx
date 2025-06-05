"use client"

export default function TrendingIdeas() {
  const trendingIdeas = [
    {
      id: 1,
      title: "AI-Powered Task Manager",
      description: "Smart task management with AI prioritization",
      category: "Productivity",
    },
    {
      id: 2,
      title: "E-commerce Platform",
      description: "Modern online store with payment integration",
      category: "Business",
    },
    {
      id: 3,
      title: "Social Media Dashboard",
      description: "Unified dashboard for managing multiple social accounts",
      category: "Marketing",
    },
    {
      id: 4,
      title: "Learning Management System",
      description: "Online education platform with course management",
      category: "Education",
    },
    {
      id: 5,
      title: "Fitness Tracking App",
      description: "Personal fitness tracker with workout plans",
      category: "Health",
    },
    {
      id: 6,
      title: "Recipe Sharing Platform",
      description: "Community-driven recipe sharing and meal planning",
      category: "Lifestyle",
    },
  ]

  return (
    <section className="w-full max-w-6xl mx-auto mt-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trending Ideas</h2>
        <p className="text-gray-600">Popular project ideas from our community</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingIdeas.map((idea) => (
          <div
            key={idea.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                {idea.category}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{idea.title}</h3>
            <p className="text-sm text-gray-600">{idea.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
