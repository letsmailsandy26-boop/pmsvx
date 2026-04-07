interface ProgressBarProps {
  value: number
  showLabel?: boolean
}

export function ProgressBar({ value, showLabel = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-op-border rounded-full h-1.5">
        <div
          className="bg-op-primary h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px] text-op-muted w-7 text-right tabular-nums">{pct}%</span>
      )}
    </div>
  )
}
