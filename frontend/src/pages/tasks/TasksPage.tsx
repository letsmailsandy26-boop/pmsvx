import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { tasksApi } from '../../api/tasks.api'
import { projectsApi } from '../../api/projects.api'
import { Spinner } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Pagination } from '../../components/ui/Pagination'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { formatDate } from '../../utils/formatDate'
import { Task, Project } from '../../types'
import { TASK_STATUSES, TASK_TYPES, PRIORITIES, TASK_STATUS_LABELS } from '../../constants/enums'
import { TaskFormModal } from '../../components/tasks/TaskFormModal'

export function TasksPage() {
  const [searchParams] = useSearchParams()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('open')
  const [type, setType] = useState('')
  const [priority, setPriority] = useState('')
  const [projectId, setProjectId] = useState(searchParams.get('projectId') || '')
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', page, search, status, type, priority, projectId],
    queryFn: () =>
      tasksApi.list({
        page,
        search: search || undefined,
        status: status === 'open' ? undefined : status || undefined,
        excludeStatus: status === 'open' ? 'Closed' : undefined,
        type: type || undefined,
        priority: priority || undefined,
        projectId: projectId || undefined,
        limit: 25,
      }),
  })

  const { data: projectsData } = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: () => projectsApi.list({ limit: 100 }),
  })

  return (
    <div className="p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-base font-semibold text-op-text">All Work Packages</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5" /> New work package
        </button>
      </div>

      {/* Filters */}
      <div className="op-panel p-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-44">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-op-muted" />
            <input
              className="input pl-8"
              placeholder="Search work packages..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select className="input w-36" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
            <option value="open">Open (excl. Closed)</option>
            <option value="">All statuses</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select className="input w-28" value={type} onChange={(e) => { setType(e.target.value); setPage(1) }}>
            <option value="">All types</option>
            {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="input w-28" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1) }}>
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="input w-40" value={projectId} onChange={(e) => { setProjectId(e.target.value); setPage(1) }}>
            <option value="">All projects</option>
            {projectsData?.data?.map((p: Project) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="op-panel overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : data?.data?.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-op-muted mb-3">No work packages found.</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus className="h-3.5 w-3.5" /> New work package
            </button>
          </div>
        ) : (
          <table className="op-table">
            <thead>
              <tr>
                <th className="w-8">#</th>
                <th>Subject</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th className="w-32">Progress</th>
                <th>Due date</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((task: Task) => (
                <tr key={task.id}>
                  <td className="text-op-muted text-[10px]">VX-{task.id}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Badge value={task.type} />
                      <Link
                        to={`/tasks/${task.id}`}
                        className="font-medium text-op-primary hover:underline max-w-xs truncate"
                      >
                        {task.title}
                      </Link>
                    </div>
                  </td>
                  <td className="text-op-muted whitespace-nowrap">{task.project?.name}</td>
                  <td><Badge value={task.status} /></td>
                  <td><Badge value={task.priority} /></td>
                  <td>
                    {task.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar name={task.assignee.name} src={task.assignee.avatarUrl} size="sm" />
                        <span className="text-[11px] text-op-text">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-op-muted text-xs">—</span>
                    )}
                  </td>
                  <td><ProgressBar value={task.progressPercent} /></td>
                  <td className="text-op-muted whitespace-nowrap">{formatDate(task.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="px-4 py-3 border-t border-op-border">
          <Pagination page={page} totalPages={data?.pagination?.totalPages || 1} onPage={setPage} />
        </div>
      </div>

      {showForm && (
        <TaskFormModal
          onClose={() => {
            setShowForm(false)
            qc.invalidateQueries({ queryKey: ['tasks'] })
          }}
        />
      )}
    </div>
  )
}
