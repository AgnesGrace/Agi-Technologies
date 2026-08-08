import { ChevronLeft, ChevronRight } from "lucide-react"

type PaginationProps = {
  page: number
  totalPages: number
  isLoading?: boolean
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  isLoading = false,
  onPageChange,
}: PaginationProps) {
  const hasPreviousPage = page > 1
  const hasNextPage = page < totalPages

  // if (totalPages <= 1) {
  //   return null
  // }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-3"
    >
      <button
        type="button"
        disabled={!hasPreviousPage || isLoading}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
        className="rounded-full border p-2 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <span className="text-sm font-medium">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={!hasNextPage || isLoading}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
        className="rounded-full border p-2 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  )
}
