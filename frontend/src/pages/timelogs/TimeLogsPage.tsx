import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { usersApi } from '../../api/users.api'
import { projectsApi } from '../../api/projects.api'
import { Spinner } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Pagination } from '../../components/ui/Pagination'
import { formatDate } from '../../utils/formatDate'
import { TimeLog, User, Project } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { LOG_CATEGORIES } from '../../constants/enums'

export function TimeLogsPage() {
  const { user } = useAuth()
  const isManagerOrAdmin = user?.role === 'Admin' || user?.role === 'Manager'

  const [page, setPage] = useState(1)
  const [filterUserId, setFilterUserId] = useState('')
  const [filterProjectId, setFilterProjectId] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const queryParams = {
    page,
    limit: 25,
    ...(filterUserId ? { filterUserId } : {}),
    ...(filterProjectId ? { projectId: filterProjectId } : {}),
    ...(filterCategory ? { category: filterCategory } : {}),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['timelogs', page, filterUserId, filterProjectId, filterCategory, isManagerOrAdmin],
    queryFn: () =>
      isManagerOrAdmin
        ? usersApi.allTimeLogs(queryParams)
        : usersApi.myTimeLogs({ page, limit: 25 }),
  })

  const { data: usersData } = useQuery({
    queryKey: ['users', 'all-active'],
    queryFn: () => usersApi.list({ limit: 100, isActive: 'true' }),
    enabled: isManagerOrAdmin,
  })

  const { data: projectsData } = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: () => projectsApi.list({ limit: 100 }),
    enabled: isManagerOrAdmin,
  })

  const logs: TimeLog[] = data?.data ?? []
  const totalHours = logs.reduce((sum, l) => sum + l.hours, 0)

  const resetFilters = () => {
    setFilterUserId('')
    setFilterProjectId('')
    setFilterCategory('')
    setPage(1)
  }
  const hasFilters = filterUserId || filterProjectId || filterCategory

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-base font-semibold text-op-text">Time Logs</h1>
          {isManagerOrAdmin && (
            <p className="text-xs text-op-muted mt-0.5">All team time entries</p>
          )}
        </div>
        <div className="flex items-center gap-2 op-panel px-3 py-2">
          <span className="text-xs text-op-muted">Page total:</span>
          <span className="text-sm font-bold text-op-primary tabular-nums">{totalHours.toFixed(1)}h</span>
        </div>
      </div>

      {/* Filters — admin/manager only */}
      {isManagerOrAdmin && (
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="input w-44"
            value={filterUserId}
            onChange={(e) => { setFilterUserId(e.target.value); setPage(1) }}
          >
            <option value="">All members</option>
            {usersData?.data?.map((u: User) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <select
            className="input w-44"
            value={filterProjectId}
            onChange={(e) => { setFilterProjectId(e.target.value); setPage(1) }}
          >
            <option value="">All projects</option>
            {projectsData?.data?.map((p: Project) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            className="input w-36"
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1) }}
          >
            <option value="">All categories</option>
            {LOG_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {hasFilters && (
            <button onClick={resetFilters} className="btn-ghost text-xs text-op-muted hover:text-op-text">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="op-panel overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-op-muted">No time logs found.</p>
            {!isManagerOrAdmin && (
              <p className="text-xs text-op-muted mt-1">Open a task and log time to see it here.</p>
            )}
          </div>
        ) : (
          <table className="op-table">
            <thead>
              <tr>
                {isManagerOrAdmin && <th>Member</th>}
                <th>Task</th>
                {isManagerOrAdmin && <th>Project</th>}
                <th>Hours</th>
                <th>Category</th>
                <th>Date</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: TimeLog) => (
                <tr key={log.id}>
                  {isManagerOrAdmin && (
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={log.user?.name} size="sm" />
                        <div>
                          <p className="text-xs font-medium text-op-text">{log.user?.name}</p>
                          {(log.user as any)?.department && (
                            <p className="text-[10px] text-op-muted">{(log.user as any).department}</p>
                          )}
                        </div>
                      </div>
                    </td>
                  )}
                  <td>
                    <Link
                      to={`/tasks/${log.task?.id}`}
                      className="text-op-primary hover:underline font-medium text-xs"
                    >
                      {log.task?.title || '—'}
                    </Link>
                    {!isManagerOrAdmin && log.task && (
                      <p className="text-[10px] text-op-muted">{(log.task as any).project?.name}</p>
                    )}
                  </td>
                  {isManagerOrAdmin && (
                    <td className="text-op-muted text-xs">
                      {(log.task as any)?.project?.name || '—'}
                    </td>
                  )}
                  <td>
                    <span className="font-bold tabular-nums text-op-primary">{log.hours}h</span>
                  </td>
                  <td><Badge value={log.category} /></td>
                  <td className="text-op-muted whitespace-nowrap text-xs">{formatDate(log.logDate)}</td>
                  <td className="text-op-muted text-xs max-w-[200px] truncate">
                    {log.description || <span className="italic">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="px-4 py-3 border-t border-op-border">
          <Pagination
            page={page}
            totalPages={data?.pagination?.totalPages || 1}
            onPage={setPage}
          />
        </div>
      </div>
    </div>
  )
}
