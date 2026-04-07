import { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  action?: ReactNode
}

export function EmptyState({
  title = 'No items found',
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Inbox className="h-10 w-10 text-op-border mb-3" />
      <h3 className="text-sm font-medium text-op-text mb-1">{title}</h3>
      {description && <p className="text-op-muted text-xs mb-4">{description}</p>}
      {action}
    </div>
  )
}
