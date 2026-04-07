import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { usersApi } from '../../api/users.api'
import { Spinner } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { formatDate } from '../../utils/formatDate'
import { Task } from '../../types'
import { TASK_STATUS_LABELS } from '../../constants/enums'

const STATUS_COLUMNS = [
  'New',
  'InProgress',
  'ReviewPending',
  'Testing',
  'TestingDone',
  'ReadyForProduction',
]

export function MyTasksPage() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: usersApi.myTasks,
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-64"><Spinner /></div>
  )

  if (!tasks?.length) {
    return (
      <div className="p-6">
        <h1 className="text-base font-semibold text-op-text mb-6">My work packages</h1>
        <div className="op-panel py-16 text-center">
          <p className="text-sm text-op-muted">No work packages assigned to you.</p>
        </div>
      </div>
    )
  }

  const columns = STATUS_COLUMNS.map((status) => ({
    status,
    label: TASK_STATUS_LABELS[status],
    tasks: tasks.filter((t: Task) => t.status === status),
  }))

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-op-text">My work packages</h1>
        <span className="badge-status bg-gray-100 text-gray-600 border-gray-300">
          {tasks.length} open
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map((col) => (
          <div key={col.status} className="flex-shrink-0 w-64">
            {/* Column header */}
            <div className="flex items-center justify-between mb-2 px-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-op-muted">
                {col.label}
              </span>
              <span className="text-[10px] bg-op-border text-op-muted px-1.5 py-0.5 rounded-full tabular-nums">
                {col.tasks.length}
              </span>
            </div>
            {/* Cards */}
            <div className="space-y-2">
              {col.tasks.map((task: Task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="op-panel p-3 block hover:shadow-op-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-xs font-medium text-op-text line-clamp-2 flex-1 leading-snug">
                      {task.title}
                    </p>
                    <Badge value={task.type} className="flex-shrink-0" />
                  </div>
                  <p className="text-[10px] text-op-muted mb-2 truncate">{task.project?.name}</p>
                  <ProgressBar value={task.progressPercent} />
                  <div className="flex items-center justify-between mt-2">
                    <Badge value={task.priority} />
                    <span className="text-[10px] text-op-muted">
                      {task.dueDate ? formatDate(task.dueDate) : '—'}
                    </span>
                  </div>
                </Link>
              ))}
              {col.tasks.length === 0 && (
                <div className="text-center py-6 text-op-muted/40 text-[11px] border border-dashed border-op-border rounded">
                  Empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
