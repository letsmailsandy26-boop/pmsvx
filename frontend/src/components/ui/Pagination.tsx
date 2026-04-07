import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPage: (p: number) => void
}

export function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: number[] = []
  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  for (let i = start; i <= Math.min(start + 4, totalPages); i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        className="btn-ghost btn-sm"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={p === page ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
          onClick={() => onPage(p)}
        >
          {p}
        </button>
      ))}
      <button
        className="btn-ghost btn-sm"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
