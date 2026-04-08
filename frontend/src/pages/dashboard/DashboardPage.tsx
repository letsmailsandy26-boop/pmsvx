import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { dashboardApi } from '../../api/dashboard.api'
import { Spinner } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { formatDate, formatRelative } from '../../utils/formatDate'
import { Task, Activity } from '../../types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  New: '#9ca3af',
  InProgress: '#3b82f6',
  ReviewPending: '#8b5cf6',
  Testing: '#f59e0b',
  TestingDone: '#f97316',
  ReadyForProduction: '#14b8a6',
  Closed: '#22c55e',
}

export function DashboardPage() {
  const { user } = useAuth()
  const isManagerOrAdmin = true

  const { data: userData, isLoading } = useQuery({
    queryKey: ['dashboard', 'user'],
    queryFn: dashboardApi.user,
  })
  const { data: managerData } = useQuery({
    queryKey: ['dashboard', 'manager'],
    queryFn: dashboardApi.manager,
  })
  const { data: adminData } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: dashboardApi.admin,
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-64"><Spinner /></div>
  )

  return (
    <div className="p-6 space-y-5">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-op-text">Overview</h1>
          <p className="text-xs text-op-muted mt-0.5">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="op-panel p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-op-muted mb-1">
            Assigned tasks
          </p>
          <p className="text-2xl font-bold text-op-text tabular-nums">
            {userData?.assignedTasks?.length ?? 0}
          </p>
        </div>
        <div className="op-panel p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-op-muted mb-1">
            Pending
          </p>
          <p className="text-2xl font-bold text-op-orange tabular-nums">
            {userData?.pendingTasksCount ?? 0}
          </p>
        </div>
        <div className="op-panel p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-op-muted mb-1">
            Hours this week
          </p>
          <p className="text-2xl font-bold text-op-primary tabular-nums">
            {(userData?.weeklyHours ?? 0).toFixed(1)}
          </p>
        </div>
        {true && adminData ? (
          <div className="op-panel p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-op-muted mb-1">
              Total projects
            </p>
            <p className="text-2xl font-bold text-op-green tabular-nums">
              {adminData.projectCount}
            </p>
          </div>
        ) : (
          <div className="op-panel p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-op-muted mb-1">
              Completed
            </p>
            <p className="text-2xl font-bold text-op-green tabular-nums">
              {userData?.assignedTasks?.filter((t: Task) => t.status === 'Closed').length ?? 0}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My Tasks */}
        <div className="op-panel overflow-hidden">
          <div className="op-panel-header">
            <span className="op-panel-title">My work packages</span>
            <Link to="/my-tasks" className="text-[11px] text-op-primary hover:underline">
              View all
            </Link>
          </div>
          <table className="op-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {userData?.assignedTasks?.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-op-muted">
                    No assigned tasks.
                  </td>
                </tr>
              )}
              {userData?.assignedTasks?.slice(0, 8).map((task: Task) => (
                <tr key={task.id}>
                  <td>
                    <Link
                      to={`/tasks/${task.id}`}
                      className="text-op-primary hover:underline font-medium truncate block max-w-[180px]"
                    >
                      {task.title}
                    </Link>
                    <span className="text-[10px] text-op-muted">{task.project?.name}</span>
                  </td>
                  <td><Badge value={task.status} /></td>
                  <td className="text-op-muted whitespace-nowrap">{formatDate(task.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Project Progress (Manager/Admin) */}
        {isManagerOrAdmin && managerData ? (
          <div className="op-panel overflow-hidden">
            <div className="op-panel-header">
              <span className="op-panel-title">Project progress</span>
              <Link to="/projects" className="text-[11px] text-op-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-op-border-light">
              {managerData.projects?.slice(0, 6).map(
                (p: { id: number; name: string; progress: number; status: string }) => (
                  <div key={p.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <Link
                        to={`/projects/${p.id}`}
                        className="text-xs font-medium text-op-primary hover:underline truncate max-w-[180px]"
                      >
                        {p.name}
                      </Link>
                      <Badge value={p.status} />
                    </div>
                    <ProgressBar value={p.progress} />
                  </div>
                ),
              )}
            </div>
          </div>
        ) : (
          /* Recent activity for plain users */
          <div className="op-panel overflow-hidden">
            <div className="op-panel-header">
              <span className="op-panel-title">Recent activity</span>
            </div>
            <div className="divide-y divide-op-border-light max-h-72 overflow-y-auto">
              {userData?.recentActivity?.length === 0 && (
                <p className="px-4 py-6 text-center text-op-muted text-xs">No recent activity.</p>
              )}
              {userData?.recentActivity?.map((a: Activity) => (
                <div key={a.id} className="flex items-start gap-3 px-4 py-3">
                  <Avatar name={a.actor?.name} src={a.actor?.avatarUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-op-text">
                      <span className="font-semibold">{a.actor?.name}</span>{' '}
                      {a.description || a.action}
                    </p>
                    <p className="text-[10px] text-op-muted mt-0.5">{formatRelative(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task status chart */}
      {isManagerOrAdmin && managerData?.taskSummary && (
        <div className="op-panel p-4">
          <p className="op-panel-title mb-3">Task status distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={managerData.taskSummary.map(
                (r: { status: string; _count: { id: number } }) => ({
                  status: r.status,
                  count: r._count.id,
                }),
              )}
              barSize={28}
            >
              <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 4, border: '1px solid #DDDDDD' }}
                cursor={{ fill: '#F5F9FD' }}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]} name="Tasks">
                {managerData.taskSummary.map((r: { status: string }) => (
                  <Cell key={r.status} fill={STATUS_COLORS[r.status] || '#9ca3af'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Activity (Admin) */}
      {true && adminData?.recentActivity && (
        <div className="op-panel overflow-hidden">
          <div className="op-panel-header">
            <span className="op-panel-title">Recent activity</span>
          </div>
          <div className="divide-y divide-op-border-light max-h-64 overflow-y-auto">
            {adminData.recentActivity.map((a: Activity) => (
              <div key={a.id} className="flex items-start gap-3 px-4 py-3">
                <Avatar name={a.actor?.name} src={a.actor?.avatarUrl} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-op-text">
                    <span className="font-semibold">{a.actor?.name}</span>{' '}
                    {a.description || a.action}
                  </p>
                  <p className="text-[10px] text-op-muted mt-0.5">{formatRelative(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
