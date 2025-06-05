"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { type NewsSource, toggleNewsSource, removeNewsSource } from "@/lib/database"
import AddSourceForm from "./add-source-form"

interface SourceSettingsProps {
  sources: NewsSource[]
  projectId: number | string
  onSourcesUpdated: () => Promise<void>
}

export default function SourceSettings({ sources, projectId, onSourcesUpdated }: SourceSettingsProps) {
  const [isAddingSource, setIsAddingSource] = useState(false)

  const handleToggleSource = async (sourceId: number, isEnabled: boolean) => {
    await toggleNewsSource(sourceId, isEnabled)
    onSourcesUpdated()
  }

  const handleRemoveSource = async (sourceId: number) => {
    await removeNewsSource(sourceId)
    onSourcesUpdated()
  }

  const handleAddSource = async () => {
    await onSourcesUpdated()
    setIsAddingSource(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">News Sources</h3>
        <p className="text-sm text-gray-600">Configure the sources from which you want to receive industry news.</p>
      </div>

      {sources.length === 0 && !isAddingSource ? (
        <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">No news sources configured yet.</p>
          <button
            onClick={() => setIsAddingSource(true)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Add Your First Source
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {sources.map((source) => (
              <div key={source.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  {source.favicon_url && (
                    <img
                      src={source.favicon_url || "/placeholder.svg"}
                      alt={`${source.name} favicon`}
                      className="w-5 h-5 mr-3"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  )}
                  <div>
                    <h4 className="font-medium">{source.name}</h4>
                    <p className="text-xs text-gray-500">{source.url}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={source.is_enabled}
                      onChange={(e) => handleToggleSource(source.id, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                  <button
                    onClick={() => handleRemoveSource(source.id)}
                    className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
                    title="Remove source"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!isAddingSource && (
            <button
              onClick={() => setIsAddingSource(true)}
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors w-full justify-center"
            >
              <Plus size={16} />
              <span>Add New Source</span>
            </button>
          )}
        </>
      )}

      {isAddingSource && (
        <AddSourceForm projectId={projectId} onCancel={() => setIsAddingSource(false)} onSuccess={handleAddSource} />
      )}
    </div>
  )
}
