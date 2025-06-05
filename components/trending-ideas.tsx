// This file has been moved to components/homepage/trending-ideas.tsx
export default function TrendingIdeas() {
  const trendingIdeas = [
    {
      id: 1,
      title: "AI-powered content calendar",
      growth: "+28%",
      description: "A tool that generates content ideas and schedules based on trending topics",
    },
    {
      id: 2,
      title: "Sustainable fashion marketplace",
      growth: "+42%",
      description: "Connect eco-friendly fashion brands with conscious consumers",
    },
    {
      id: 3,
      title: "Remote team collaboration platform",
      growth: "+35%",
      description: "All-in-one solution for remote teams to collaborate effectively",
    },
    {
      id: 4,
      title: "Mental wellness app",
      growth: "+51%",
      description: "Daily exercises and tracking for mental health improvement",
    },
  ]

  return (
    <div className="mt-10 w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Trending Ideas</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trendingIdeas.map((idea) => (
          <div
            key={idea.id}
            className="border border-border bg-card rounded-md p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{idea.title}</h3>
              <span className="text-green-600 text-sm font-medium">{idea.growth}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{idea.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
