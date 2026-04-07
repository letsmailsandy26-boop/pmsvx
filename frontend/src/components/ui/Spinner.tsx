import { cn } from '../../utils/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-op-border border-t-op-primary" />
    </div>
  )
}
