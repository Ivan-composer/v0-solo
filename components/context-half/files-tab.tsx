"use client"

import { useEffect, useState } from "react"
import { File, Folder, Tree, type TreeViewElement } from "@/components/ui/file-tree"
import { getFilesForProject } from "@/lib/database"
import { ChevronDown, ChevronUp, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { File as FileType } from "@/lib/database"

interface FilesTabProps {
  projectId: string
}

// Helper function to organize files into a tree structure
function organizeFilesIntoTree(files: FileType[]): TreeViewElement[] {
  // Create a map to store folders
  const folderMap: Record<string, TreeViewElement> = {}

  // Root element
  const root: TreeViewElement = {
    id: "root",
    name: "Project Files",
    children: [],
  }

  // Add root to the map
  folderMap["root"] = root

  // Process each file
  files.forEach((file, index) => {
    // Extract path components from storage_path
    // Remove leading slash if present
    const path = file.storage_path.startsWith("/") ? file.storage_path.substring(1) : file.storage_path

    const pathParts = path.split("/")

    // The file name is the last part
    const fileName = file.file_name

    // Start from the root
    let currentFolder = root
    let currentPath = "root"

    // Create folder structure
    for (let i = 0; i < pathParts.length - 1; i++) {
      const folderName = pathParts[i]
      if (!folderName) continue // Skip empty folder names

      const folderPath = `${currentPath}/${folderName}`

      // Create folder if it doesn't exist
      if (!folderMap[folderPath]) {
        const newFolder: TreeViewElement = {
          id: folderPath,
          name: folderName,
          children: [],
        }

        // Add to parent's children
        currentFolder.children = currentFolder.children || []
        currentFolder.children.push(newFolder)

        // Add to map
        folderMap[folderPath] = newFolder
      }

      // Move to this folder
      currentFolder = folderMap[folderPath]
      currentPath = folderPath
    }

    // Add the file to the current folder
    currentFolder.children = currentFolder.children || []
    currentFolder.children.push({
      id: file.id,
      name: fileName,
      isSelectable: true,
    })
  })

  return [root]
}

export default function FilesTab({ projectId }: FilesTabProps) {
  const [files, setFiles] = useState<FileType[]>([])
  const [fileTree, setFileTree] = useState<TreeViewElement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandAll, setExpandAll] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null)

  useEffect(() => {
    async function loadFiles() {
      // Validate projectId before making the call
      if (
        !projectId ||
        projectId === "undefined" ||
        !projectId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      ) {
        console.warn("Invalid projectId provided to FilesTab:", projectId)
        setError("Invalid project ID")
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const projectFiles = await getFilesForProject(projectId)
        setFiles(projectFiles)

        // Organize files into tree structure
        const tree = organizeFilesIntoTree(projectFiles)
        setFileTree(tree)
      } catch (err) {
        console.error("Error loading files:", err)
        setError("Failed to load project files")
      } finally {
        setLoading(false)
      }
    }

    loadFiles()
  }, [projectId])

  // Handle file selection
  const handleFileSelect = (fileId: string) => {
    const selectedFile = files.find((file) => file.id === fileId)
    setSelectedFile(selectedFile || null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading files...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-destructive mb-2">Error</div>
        <p>{error}</p>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No files found</h3>
        <p className="text-muted-foreground text-center">
          This project doesn't have any files yet. Upload files to see them here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* File tree sidebar */}
      <div className="w-1/3 border-r p-4 h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Project Files</h3>
          <Button variant="ghost" size="sm" onClick={() => setExpandAll(!expandAll)} className="h-8 w-8 p-0">
            {expandAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>

        <div className="h-[calc(100%-40px)]">
          <Tree elements={fileTree} expandAll={expandAll} className="h-full">
            {fileTree.map((rootItem) => (
              <RenderTreeItem key={rootItem.id} item={rootItem} onFileSelect={handleFileSelect} />
            ))}
          </Tree>
        </div>
      </div>

      {/* File preview */}
      <div className="flex-1 p-4 overflow-auto">
        {selectedFile ? (
          <div>
            <h2 className="text-xl font-semibold mb-2">{selectedFile.file_name}</h2>
            <Separator className="my-4" />
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <span>Type: {selectedFile.mime_type}</span>
              <span className="mx-2">•</span>
              <span>Version: {selectedFile.version}</span>
              <span className="mx-2">•</span>
              <span>Created: {new Date(selectedFile.created_at).toLocaleDateString()}</span>
            </div>

            {/* File preview based on mime type */}
            <div className="mt-4 border rounded-md p-4 bg-muted/30">
              {selectedFile.mime_type.startsWith("image/") ? (
                <div className="flex justify-center">
                  <img
                    src={`/api/files/${selectedFile.id}`}
                    alt={selectedFile.file_name}
                    className="max-w-full max-h-[500px] object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center p-8">
                  <FileText className="h-16 w-16 text-muted-foreground" />
                  <div className="ml-4">
                    <p>Preview not available</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Download File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Select a file to preview</h3>
            <p className="text-muted-foreground text-center mt-2">Choose a file from the sidebar to view its details</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper component to recursively render the tree
function RenderTreeItem({
  item,
  onFileSelect,
}: {
  item: TreeViewElement
  onFileSelect: (fileId: string) => void
}) {
  if (!item.children || item.children.length === 0) {
    return (
      <File value={item.id} onClick={() => onFileSelect(item.id)}>
        <p>{item.name}</p>
      </File>
    )
  }

  return (
    <Folder element={item.name} value={item.id}>
      {item.children.map((child) => (
        <RenderTreeItem key={child.id} item={child} onFileSelect={onFileSelect} />
      ))}
    </Folder>
  )
}
