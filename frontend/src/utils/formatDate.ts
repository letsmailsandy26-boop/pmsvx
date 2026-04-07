import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

export const formatDate = (date?: string | null): string => {
  if (!date) return '—'
  const d = parseISO(date)
  if (!isValid(d)) return '—'
  return format(d, 'MMM d, yyyy')
}

export const formatDateTime = (date?: string | null): string => {
  if (!date) return '—'
  const d = parseISO(date)
  if (!isValid(d)) return '—'
  return format(d, 'MMM d, yyyy HH:mm')
}

export const formatRelative = (date?: string | null): string => {
  if (!date) return '—'
  const d = parseISO(date)
  if (!isValid(d)) return '—'
  return formatDistanceToNow(d, { addSuffix: true })
}
