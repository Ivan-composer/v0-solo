"use client"

import type React from "react"

import { useEffect, useState, createContext, forwardRef, useCallback, useContext } from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { FileIcon, FolderIcon, FolderOpenIcon, ChevronDown, ChevronUp, FileText, Loader2 } from "lucide-react"
import { getFilesForProject } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/utils/cn"
import type { File as FileType } from "@/lib/database"

// File Tree Types and Components (moved from ui/file-tree.tsx)
type TreeViewElement = {
  id: string
  name: string
  isSelectable?: boolean
  children?: TreeViewElement[]
}

type TreeContextProps = {
  selectedId: string | undefined
  expandedItems: string[] | undefined
  indicator: boolean
  handleExpand: (id: string) => void
  selectItem: (id: string) => void
  setExpandedItems?: React.Dispatch<React.SetStateAction<string[] | undefined>>
  openIcon?: React.ReactNode
  closeIcon?: React.ReactNode
  direction: "rtl" | "ltr"
}

const TreeContext = createContext<TreeContextProps | null>(null)

const useTree = () => {
  const context = useContext(TreeContext)
  if (!context) {
    throw new Error("useTree must be used within a TreeProvider")
  }
  return context
}

interface TreeViewComponentProps extends React.HTMLAttributes<HTMLDivElement> {}

type Direction = "rtl" | "ltr" | undefined

type TreeViewProps = {
  initialSelectedId?: string
  indicator?: boolean
  elements?: TreeViewElement[]
  initialExpandedItems?: string[]
  openIcon?: React.ReactNode
  closeIcon?: React.ReactNode
} & TreeViewComponentProps

const Tree = forwardRef<HTMLDivElement, TreeViewProps>(
  (
    {
      className,
      elements,
      initialSelectedId,
      initialExpandedItems,
      children,
      indicator = true,
      openIcon,
      closeIcon,
      dir,
      ...props
    },
    ref,
  ) => {
    const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId)
    const [expandedItems, setExpandedItems] = useState<string[] | undefined>(initialExpandedItems)

    const selectItem = useCallback((id: string) => {
      setSelectedId(id)
    }, [])

    const handleExpand = useCallback((id: string) => {
      setExpandedItems((prev) => {
        if (prev?.includes(id)) {
          return prev.filter((item) => item !== id)
        }
        return [...(prev ?? []), id]
      })
    }, [])

    const expandSpecificTargetedElements = useCallback((elements?: TreeViewElement[], selectId?: string) => {
      if (!elements || !selectId) return
      const findParent = (currentElement: TreeViewElement, currentPath: string[] = []) => {
        const isSelectable = currentElement.isSelectable ?? true
        const newPath = [...currentPath, currentElement.id]
        if (currentElement.id === selectId) {
          if (isSelectable) {
            setExpandedItems((prev) => [...(prev ?? []), ...newPath])
          } else {
            if (newPath.includes(currentElement.id)) {
              newPath.pop()
              setExpandedItems((prev) => [...(prev ?? []), ...newPath])
            }
          }
          return
        }
        if (isSelectable && currentElement.children && currentElement.children.length > 0) {
          currentElement.children.forEach((child) => {
            findParent(child, newPath)
          })
        }
      }
      elements.forEach((element) => {
        findParent(element)
      })
    }, [])

    useEffect(() => {
      if (initialSelectedId) {
        expandSpecificTargetedElements(elements, initialSelectedId)
      }
    }, [initialSelectedId, elements])

    const direction = dir === "rtl" ? "rtl" : "ltr"

    return (
      <TreeContext.Provider
        value={{
          selectedId,
          expandedItems,
          handleExpand,
          selectItem,
          setExpandedItems,
          indicator,
          openIcon,
          closeIcon,
          direction,
        }}
      >
        <div className={cn("size-full", className)}>
          <ScrollArea ref={ref} className="h-full relative px-2" dir={dir as Direction}>
            <AccordionPrimitive.Root
              {...props}
              type="multiple"
              defaultValue={expandedItems}
              value={expandedItems}
              className="flex flex-col gap-1"
              onValueChange={(value) => setExpandedItems((prev) => [...(prev ?? []), value[0]])}
              dir={dir as Direction}
            >
              {children}
            </AccordionPrimitive.Root>
          </ScrollArea>
        </div>
      </TreeContext.Provider>
    )
  },
)

Tree.displayName = "Tree"

interface FolderComponentProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {}

type FolderProps = {
  expandedItems?: string[]
  element: string
  isSelectable?: boolean
  isSelect?: boolean
} & FolderComponentProps

const Folder = forwardRef<HTMLDivElement, FolderProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ className, element, value, isSelectable = true, isSelect, children, ...props }, ref) => {
    const { direction, handleExpand, expandedItems, indicator, setExpandedItems, openIcon, closeIcon } = useTree()

    return (
      <AccordionPrimitive.Item {...props} value={value} className="relative overflow-hidden h-full ">
        <AccordionPrimitive.Trigger
          className={cn(`flex items-center gap-1 text-sm rounded-md`, className, {
            "bg-muted rounded-md": isSelect && isSelectable,
            "cursor-pointer": isSelectable,
            "cursor-not-allowed opacity-50": !isSelectable,
          })}
          disabled={!isSelectable}
          onClick={() => handleExpand(value)}
        >
          {expandedItems?.includes(value)
            ? (openIcon ?? <FolderOpenIcon className="size-4" />)
            : (closeIcon ?? <FolderIcon className="size-4" />)}
          <span>{element}</span>
        </AccordionPrimitive.Trigger>
        <AccordionPrimitive.Content className="text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down relative overflow-hidden h-full">
          {element && indicator && (
            <div
              dir={direction}
              className={cn(
                "h-full w-px bg-muted absolute left-1.5 rtl:right-1.5 py-3 rounded-md hover:bg-slate-300 duration-300 ease-in-out",
              )}
            />
          )}
          <AccordionPrimitive.Root
            dir={direction}
            type="multiple"
            className="flex flex-col gap-1 py-1 ml-5 rtl:mr-5 "
            defaultValue={expandedItems}
            value={expandedItems}
            onValueChange={(value) => {
              setExpandedItems?.((prev) => [...(prev ?? []), value[0]])
            }}
          >
            {children}
          </AccordionPrimitive.Root>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    )
  },
)

Folder.displayName = "Folder"

const File = forwardRef<
  HTMLButtonElement,
  {
    value: string
    handleSelect?: (id: string) => void
    isSelectable?: boolean
    isSelect?: boolean
    fileIcon?: React.ReactNode
  } & React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ value, className, handleSelect, isSelectable = true, isSelect, fileIcon, children, ...props }, ref) => {
  const { direction, selectedId, selectItem } = useTree()
  const isSelected = isSelect ?? selectedId === value
  return (
    <AccordionPrimitive.Item value={value} className="relative">
      <AccordionPrimitive.Trigger
        ref={ref}
        {...props}
        dir={direction}
        disabled={!isSelectable}
        aria-label="File"
        className={cn(
          "flex items-center gap-1 cursor-pointer text-sm pr-1 rtl:pl-1 rtl:pr-0 rounded-md  duration-200 ease-in-out",
          {
            "bg-muted": isSelected && isSelectable,
          },
          isSelectable ? "cursor-pointer" : "opacity-50 cursor-not-allowed",
          className,
        )}
        onClick={() => selectItem(value)}
      >
        {fileIcon ?? <FileIcon className="size-4" />}
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Item>
  )
})

File.displayName = "File"

// Helper function to organize files into a tree structure
function organizeFilesIntoTree(files: FileType[]): TreeViewElement[] {
  const folderMap: Record<string, TreeViewElement> = {}

  const root: TreeViewElement = {
    id: "root",
    name: "Project Files",
    children: [],
  }

  folderMap["root"] = root

  files.forEach((file) => {
    const path = file.storage_path.startsWith("/") ? file.storage_path.substring(1) : file.storage_path
    const pathParts = path.split("/")
    const fileName = file.file_name

    let currentFolder = root
    let currentPath = "root"

    for (let i = 0; i < pathParts.length - 1; i++) {
      const folderName = pathParts[i]
      if (!folderName) continue

      const folderPath = `${currentPath}/${folderName}`

      if (!folderMap[folderPath]) {
        const newFolder: TreeViewElement = {
          id: folderPath,
          name: folderName,
          children: [],
        }

        currentFolder.children = currentFolder.children || []
        currentFolder.children.push(newFolder)
        folderMap[folderPath] = newFolder
      }

      currentFolder = folderMap[folderPath]
      currentPath = folderPath
    }

    currentFolder.children = currentFolder.children || []
    currentFolder.children.push({
      id: file.id,
      name: fileName,
      isSelectable: true,
    })
  })

  return [root]
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

interface FilesTabProps {
  projectId: string
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
