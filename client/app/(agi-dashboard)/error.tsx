"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-xl font-semibold">Dashboard error</h2>
      <p className="text-sm text-muted-foreground">
        We could not load this page. Try again in a moment.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
