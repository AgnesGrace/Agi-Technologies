"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
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
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        Please try again. If this keeps happening, refresh the page.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link
          href="/"
          className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-sm"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
