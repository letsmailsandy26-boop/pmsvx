import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
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

type Period = 'today' | 'week' | 'month' | 'custom'
type ViewMode = 'summary' | 'detail'

function getPeriodDates(period: Period, customFrom: string, customTo: string) {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  if (period === 'today') { const t = fmt(now); return { dateFrom: t, dateTo: t } }
  if (period === 'week') {
    const day = now.getDay()
    const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
    return { dateFrom: fmt(mon), dateTo: fmt(now) }
  }
  if (period === 'month') {
    return { dateFrom: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, dateTo: fmt(now) }
  }
  return { dateFrom: customFrom, dateTo: customTo }
}

export function TimeLogsPage() {
  const { user } = useAuth()
  const isManagerOrAdmin = user?.role === 'Admin' || user?.role === 'Manager'

  const [period, setPeriod] = useState<Period>('today')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [filterUserId, setFilterUserId] = useState('')
  const [filterProjectId, setFilterProjectId] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('detail')
  const [page, setPage] = useState(1)
  const [myPage, setMyPage] = useState(1)

  const { dateFrom, dateTo } = getPeriodDates(period, customFrom, customTo)

  const filterParams = {
    ...(filterUserId ? { filterUserId } : {}),
    ...(filterProjectId ? { projectId: filterProjectId } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  }

  // Summary: dedicated endpoint that groups in DB — no pagination limit issues
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['timelogs-summary', filterUserId, filterProjectId, dateFrom, dateTo],
    queryFn: () => usersApi.timelogSummary(filterParams),
    enabled: isManagerOrAdmin && viewMode === 'summary',
  })

  // Detail: paginated list
  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['timelogs-detail', filterUserId, filterProjectId, dateFrom, dateTo, page],
    queryFn: () => usersApi.allTimeLogs({ ...filterParams, page, limit: 25 }),
    enabled: isManagerOrAdmin && viewMode === 'detail',
  })

  // Regular user — own logs
  const { data: myData, isLoading: myLoading } = useQuery({
    queryKey: ['my-timelogs', myPage],
    queryFn: () => usersApi.myTimeLogs({ page: myPage, limit: 25 }),
    enabled: !isManagerOrAdmin,
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

  type SummaryRow = { id: number; name: string; department: string; avatarUrl: string | null; cats: Record<string, number>; total: number }
  const pivot: SummaryRow[] = summaryData?.data ?? []
  const grandTotal = pivot.reduce((s: number, r: SummaryRow) => s + r.total, 0)

  // ── Regular user view ──────────────────────────────────────────────
  if (!isManagerOrAdmin) {
    const myLogs: TimeLog[] = myData?.data ?? []
    const myTotal = myLogs.reduce((s, l) => s + l.hours, 0)
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-op-text">My Time Logs</h1>
          <div className="op-panel px-3 py-1.5 text-xs text-op-muted">
            Page total: <span className="font-bold text-op-primary tabular-nums">{myTotal.toFixed(1)}h</span>
          </div>
        </div>
        <div className="op-panel overflow-hidden">
          {myLoading ? <div className="flex justify-center py-16"><Spinner /></div> :
            myLogs.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-op-muted">No time logs yet.</p>
                <p className="text-xs text-op-muted mt-1">Open a task and log time to see it here.</p>
              </div>
            ) : (
              <table className="op-table">
                <thead><tr><th>Task</th><th>Hours</th><th>Category</th><th>Date</th><th>Description</th></tr></thead>
                <tbody>
                  {myLogs.map((log) => (
                    <tr key={log.id}>
                      <td><Link to={`/tasks/${log.task?.id}`} className="text-op-primary hover:underline font-medium text-xs">{log.task?.title || '—'}</Link></td>
                      <td><span className="font-bold tabular-nums text-op-primary">{log.hours}h</span></td>
                      <td><Badge value={log.category} /></td>
                      <td className="text-op-muted text-xs whitespace-nowrap">{formatDate(log.logDate)}</td>
                      <td className="text-op-muted text-xs" style={{ minWidth: 160, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{log.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          <div className="px-4 py-3 border-t border-op-border">
            <Pagination page={myPage} totalPages={myData?.pagination?.totalPages || 1} onPage={setMyPage} />
          </div>
        </div>
      </div>
    )
  }

  // ── Admin / Manager view ───────────────────────────────────────────
  const isLoading = viewMode === 'summary' ? summaryLoading : detailLoading

  return (
    <div className="p-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-base font-semibold text-op-text">Time Logs</h1>
          <p className="text-xs text-op-muted mt-0.5">All team time entries</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded border border-op-border overflow-hidden text-xs">
            <button onClick={() => setViewMode('detail')} className={`px-3 py-1.5 font-medium transition-colors ${viewMode === 'detail' ? 'bg-op-primary text-white' : 'bg-white text-op-muted hover:bg-op-hover'}`}>By Member</button>
            <button onClick={() => setViewMode('summary')} className={`px-3 py-1.5 font-medium transition-colors ${viewMode === 'summary' ? 'bg-op-primary text-white' : 'bg-white text-op-muted hover:bg-op-hover'}`}>Category Totals</button>
          </div>
          {viewMode === 'summary' && (
            <div className="op-panel px-3 py-1.5 text-xs text-op-muted">
              Total: <span className="font-bold text-op-primary tabular-nums">{grandTotal.toFixed(1)}h</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded border border-op-border overflow-hidden text-xs">
          {(['today', 'week', 'month', 'custom'] as Period[]).map((p) => (
            <button key={p} onClick={() => { setPeriod(p); setPage(1) }}
              className={`px-3 py-1.5 font-medium capitalize transition-colors ${period === p ? 'bg-op-primary text-white' : 'bg-white text-op-muted hover:bg-op-hover'}`}>
              {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        {period === 'custom' && (
          <>
            <input type="date" className="input w-36 text-xs" value={customFrom} max={customTo || undefined} onChange={(e) => { setCustomFrom(e.target.value); setPage(1) }} />
            <span className="text-xs text-op-muted">to</span>
            <input type="date" className="input w-36 text-xs" value={customTo} min={customFrom || undefined} onChange={(e) => { setCustomTo(e.target.value); setPage(1) }} />
          </>
        )}
        <select className="input w-40 text-xs" value={filterUserId} onChange={(e) => { setFilterUserId(e.target.value); setPage(1) }}>
          <option value="">All members</option>
          {usersData?.data?.map((u: User) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select className="input w-40 text-xs" value={filterProjectId} onChange={(e) => { setFilterProjectId(e.target.value); setPage(1) }}>
          <option value="">All projects</option>
          {projectsData?.data?.map((p: Project) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : viewMode === 'summary' ? (

        /* ── SUMMARY TABLE ── */
        <div className="op-panel overflow-hidden">
          {pivot.length === 0 ? (
            <div className="py-16 text-center text-sm text-op-muted">No time logged for this period.</div>
          ) : (
            <table className="op-table">
              <thead>
                <tr>
                  <th>Member</th>
                  {LOG_CATEGORIES.map((c) => <th key={c} className="text-center">{c}</th>)}
                  <th className="text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {pivot.map((row: SummaryRow) => (
                  <tr key={row.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={row.name} src={row.avatarUrl ?? undefined} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-op-text">{row.name}</p>
                          <p className="text-[10px] text-op-muted">{row.department}</p>
                        </div>
                      </div>
                    </td>
                    {LOG_CATEGORIES.map((c) => (
                      <td key={c} className="text-center">
                        {(row.cats[c] || 0) > 0
                          ? <span className="font-semibold tabular-nums text-op-primary">{row.cats[c]}h</span>
                          : <span className="text-op-muted/40 text-xs">—</span>}
                      </td>
                    ))}
                    <td className="text-center">
                      <span className="font-bold tabular-nums text-op-text">{row.total}h</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-op-border bg-op-table-head">
                  <td className="px-4 py-2 text-xs font-bold text-op-text">Total</td>
                  {LOG_CATEGORIES.map((c) => {
                    const sum = pivot.reduce((s: number, r: SummaryRow) => s + (r.cats[c] || 0), 0)
                    return <td key={c} className="text-center px-4 py-2"><span className="font-bold tabular-nums">{sum > 0 ? `${sum}h` : '—'}</span></td>
                  })}
                  <td className="text-center px-4 py-2">
                    <span className="font-bold tabular-nums text-op-primary">{grandTotal}h</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

      ) : (

        /* ── DETAIL LIST grouped by user ── */
        (() => {
          const logs: TimeLog[] = detailData?.data ?? []
          if (logs.length === 0) return (
            <div className="op-panel py-16 text-center text-sm text-op-muted">No time logs for this period.</div>
          )
          // group by userId
          const groups = new Map<number, { user: TimeLog['user'] & { department?: string }; logs: TimeLog[] }>()
          logs.forEach((log) => {
            const uid = log.user?.id ?? 0
            if (!groups.has(uid)) groups.set(uid, { user: log.user as any, logs: [] })
            groups.get(uid)!.logs.push(log)
          })
          return (
            <div className="space-y-3">
              {Array.from(groups.values()).map((group) => {
                const groupTotal = group.logs.reduce((s, l) => s + l.hours, 0)
                return (
                  <div key={group.user?.id} className="op-panel overflow-hidden">
                    {/* User header */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-op-bg border-b border-op-border">
                      <div className="flex items-center gap-2">
                        <Avatar name={group.user?.name} src={(group.user as any)?.avatarUrl} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-op-text">{group.user?.name}</p>
                          <p className="text-[10px] text-op-muted">{(group.user as any)?.department || '—'}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-op-primary tabular-nums">{groupTotal}h total</span>
                    </div>
                    {/* Log entries */}
                    <div className="divide-y divide-op-border-light">
                      {group.logs.map((log) => (
                        <div key={log.id} className="px-4 py-3">
                          {/* Top line: task, project, hours, category, date */}
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <Link to={`/tasks/${log.task?.id}`} className="text-op-primary hover:underline font-medium text-xs">
                              {log.task?.title || '—'}
                            </Link>
                            <span className="text-[10px] text-op-muted">·</span>
                            <span className="text-[10px] text-op-muted">{(log.task as any)?.project?.name || '—'}</span>
                            <span className="text-[10px] text-op-muted">·</span>
                            <span className="font-bold tabular-nums text-op-primary text-xs">{log.hours}h</span>
                            <Badge value={log.category} />
                            <span className="text-[10px] text-op-muted ml-auto whitespace-nowrap">{formatDate(log.logDate)}</span>
                          </div>
                          {/* Description on its own line */}
                          {log.description && (
                            <p className="text-xs text-op-muted leading-relaxed mt-1 pl-0">{log.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              <div className="op-panel px-4 py-3">
                <Pagination page={page} totalPages={detailData?.pagination?.totalPages || 1} onPage={setPage} />
              </div>
            </div>
          )
        })()
      )}
    </div>
  )
}
