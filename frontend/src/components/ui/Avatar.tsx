import { cn } from '../../utils/cn'

interface AvatarProps {
  name?: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' }
const colors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
]

function getColor(name = '') {
  return colors[name.charCodeAt(0) % colors.length]
}

export function Avatar({ name = '', src, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover flex-shrink-0', sizes[size], className)}
      />
    )
  }
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0',
        getColor(name),
        sizes[size],
        className,
      )}
    >
      {initials || '?'}
    </div>
  )
}
