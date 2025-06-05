"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/utils/cn"

const TaskListPopover = PopoverPrimitive.Root

const TaskListPopoverTrigger = PopoverPrimitive.Trigger

const TaskListPopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    showArrow?: boolean
  }
>(({ className, align = "center", sideOffset = 4, showArrow = true, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-[100] max-h-[var(--radix-popover-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-lg border border-gray-200 bg-white p-4 text-gray-900 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    >
      {props.children}
      {showArrow && <PopoverPrimitive.Arrow className="fill-white" width={11} height={5} />}
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
))
TaskListPopoverContent.displayName = PopoverPrimitive.Content.displayName

export { TaskListPopover, TaskListPopoverTrigger, TaskListPopoverContent }
