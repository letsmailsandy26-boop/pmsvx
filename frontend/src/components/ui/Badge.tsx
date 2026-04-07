import { cn } from '../../utils/cn'
import { statusColors } from '../../utils/statusColors'
import { TASK_STATUS_LABELS } from '../../constants/enums'

interface BadgeProps {
  value: string
  className?: string
  label?: string
}

export function Badge({ value, className, label }: BadgeProps) {
  const color = statusColors[value] || 'bg-gray-100 text-gray-600 border-gray-300'
  const display = label ?? TASK_STATUS_LABELS[value] ?? value
  return <span className={cn('badge-status', color, className)}>{display}</span>
}
