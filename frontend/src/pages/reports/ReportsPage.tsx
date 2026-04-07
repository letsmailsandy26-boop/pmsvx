import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../../api/reports.api'
import { Spinner } from '../../components/ui/Spinner'
import { ProgressBar } from '../../components/ui/ProgressBar'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const TABS = ['Time by User', 'Time by Project', 'Task Status', 'Project Progress']
const COLORS = ['#1A67A3', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

export function ReportsPage() {
  const [tab, setTab] = useState('Time by User')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data: timeByUser, isLoading: l1 } = useQuery({
    queryKey: ['reports', 'time-by-user', from, to],
    queryFn: () => reportsApi.timeByUser({ from: from || undefined, to: to || undefined }),
    enabled: tab === 'Time by User',
  })

  const { data: timeByProject, isLoading: l2 } = useQuery({
    queryKey: ['reports', 'time-by-project', from, to],
    queryFn: () => reportsApi.timeByProject({ from: from || undefined, to: to || undefined }),
    enabled: tab === 'Time by Project',
  })

  const { data: taskStatus, isLoading: l3 } = useQuery({
    queryKey: ['reports', 'task-status'],
    queryFn: () => reportsApi.taskStatusSummary({}),
    enabled: tab === 'Task Status',
  })

  const { data: projectProgress, isLoading: l4 } = useQuery({
    queryKey: ['reports', 'project-progress'],
    queryFn: reportsApi.projectProgress,
    enabled: tab === 'Project Progress',
  })

  const isLoading = l1 || l2 || l3 || l4

  const taskStatusAgg = taskStatus?.reduce(
    (acc: Record<string, number>, r: { status: string; _count: { id: number } }) => {
      acc[r.status] = (acc[r.status] || 0) + r._count.id
      return acc
    },
    {},
  )
  const taskStatusChartData = taskStatusAgg
    ? Object.entries(taskStatusAgg).map(([status, count]) => ({ status, count }))
    : []

  const tickStyle = { fontSize: 10, fill: '#6B7280' }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-base font-semibold text-op-text">Reports</h1>

      {/* Tabs */}
      <div className="op-tabs bg-white border border-op-border rounded overflow-hidden">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`op-tab ${tab === t ? 'op-tab-active' : ''}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Date filters */}
      {(tab === 'Time by User' || tab === 'Time by Project') && (
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="label">From</label>
            <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">To</label>
            <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      )}

      <div className="op-panel p-5">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <>
            {/* Time by User */}
            {tab === 'Time by User' && timeByUser && (
              <div className="space-y-5">
                <p className="op-panel-title">Hours logged per user</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={timeByUser.map((r: { user?: { name?: string }; _sum?: { hours?: number } }) => ({
                      name: r.user?.name || 'Unknown',
                      hours: +(r._sum?.hours || 0).toFixed(1),
                    }))}
                    barSize={32}
                  >
                    <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4, border: '1px solid #DDDDDD' }} cursor={{ fill: '#F5F9FD' }} />
                    <Bar dataKey="hours" fill="#1A67A3" name="Hours" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <table className="op-table">
                  <thead><tr><th>User</th><th className="text-right">Total hours</th><th className="text-right">Entries</th></tr></thead>
                  <tbody>
                    {timeByUser.map((r: { user?: { name?: string }; _sum?: { hours?: number }; _count?: { id?: number } }, i: number) => (
                      <tr key={i}>
                        <td className="font-medium">{r.user?.name || 'Unknown'}</td>
                        <td className="text-right font-semibold tabular-nums">{(r._sum?.hours || 0).toFixed(1)}h</td>
                        <td className="text-right text-op-muted tabular-nums">{r._count?.id || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Time by Project */}
            {tab === 'Time by Project' && timeByProject && (
              <div className="space-y-5">
                <p className="op-panel-title">Hours logged per project</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={timeByProject.map((r: { projectName?: string; hours?: number }) => ({
                      name: r.projectName || 'Unknown',
                      hours: +(r.hours || 0).toFixed(1),
                    }))}
                    barSize={32}
                  >
                    <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4, border: '1px solid #DDDDDD' }} cursor={{ fill: '#F5F9FD' }} />
                    <Bar dataKey="hours" fill="#22c55e" name="Hours" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Task Status */}
            {tab === 'Task Status' && taskStatusChartData.length > 0 && (
              <div className="space-y-5">
                <p className="op-panel-title">Task status distribution</p>
                <div className="flex flex-col lg:flex-row gap-6 items-center">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={taskStatusChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="count"
                        nameKey="status"
                        label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {taskStatusChartData.map((_: unknown, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4, border: '1px solid #DDDDDD' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Project Progress */}
            {tab === 'Project Progress' && projectProgress && (
              <div className="space-y-4">
                <p className="op-panel-title">Project completion</p>
                {projectProgress.map((p: {
                  id: number; name: string; progressPercent: number;
                  totalTasks: number; closedTasks: number; totalHours: number
                }) => (
                  <div key={p.id} className="flex items-center gap-4">
                    <div className="w-44 truncate text-xs font-medium text-op-text">{p.name}</div>
                    <div className="flex-1"><ProgressBar value={p.progressPercent} /></div>
                    <div className="text-[10px] text-op-muted w-40 text-right tabular-nums">
                      {p.closedTasks}/{p.totalTasks} tasks · {p.totalHours.toFixed(1)}h
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
