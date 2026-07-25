import { LoaderIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function InnerSpinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export function LoadingCourseSpinner() {
  return (
    <div className="flex h-screen items-center justify-center gap-4">
      <InnerSpinner />
      <span>Loading courses...</span>
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex h-full items-center justify-center gap-4">
      <InnerSpinner />
    </div>
  )
}
