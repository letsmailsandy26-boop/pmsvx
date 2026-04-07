import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { usersApi } from '../../api/users.api'
import { Spinner } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { Pagination } from '../../components/ui/Pagination'
import { formatDate } from '../../utils/formatDate'
import { TimeLog } from '../../types'

export function TimeLogsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['my-timelogs', page],
    queryFn: () => usersApi.myTimeLogs({ page, limit: 25 }),
  })

  const totalHours = data?.data?.reduce((sum: number, l: TimeLog) => sum + l.hours, 0) ?? 0

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-op-text">Time logs</h1>
        <div className="op-panel px-3 py-1.5 text-xs text-op-muted">
          Page total:{' '}
          <span className="font-bold text-op-primary tabular-nums">{totalHours.toFixed(1)}h</span>
        </div>
      </div>

      <div className="op-panel overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : data?.data?.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-op-muted">No time logs yet.</p>
            <p className="text-xs text-op-muted mt-1">Open a task and log time to see it here.</p>
          </div>
        ) : (
          <table className="op-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Hours</th>
                <th>Category</th>
                <th>Date</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((log: TimeLog) => (
                <tr key={log.id}>
                  <td>
                    <Link
                      to={`/tasks/${log.task?.id}`}
                      className="text-op-primary hover:underline font-medium"
                    >
                      {log.task?.title}
                    </Link>
                  </td>
                  <td className="font-semibold tabular-nums">{log.hours}h</td>
                  <td><Badge value={log.category} /></td>
                  <td className="text-op-muted">{formatDate(log.logDate)}</td>
                  <td className="text-op-muted max-w-xs truncate">{log.description || '—'}</td>
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
