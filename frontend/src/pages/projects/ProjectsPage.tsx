import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Search, Calendar, Users } from 'lucide-react'
import { projectsApi } from '../../api/projects.api'
import { Spinner } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { Pagination } from '../../components/ui/Pagination'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { formatDate } from '../../utils/formatDate'
import { Project } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { PROJECT_STATUSES } from '../../constants/enums'

export function ProjectsPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['projects', page, search, status],
    queryFn: () => projectsApi.list({ page, search, status: status || undefined, limit: 20 }),
  })

  return (
    <div className="p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-base font-semibold text-op-text">Projects</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-op-muted" />
            <input
              className="input pl-8 w-52"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select
            className="input w-36"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          >
            <option value="">All statuses</option>
            {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {true && (
            <Link to="/projects/new" className="btn-primary">
              <Plus className="h-3.5 w-3.5" /> New project
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="op-panel overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : data?.data?.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-op-muted mb-3">No projects found.</p>
            {true && (
              <Link to="/projects/new" className="btn-primary">
                <Plus className="h-3.5 w-3.5" /> New project
              </Link>
            )}
          </div>
        ) : (
          <table className="op-table">
            <thead>
              <tr>
                <th className="w-8">#</th>
                <th>Name</th>
                <th>Status</th>
                <th>Progress</th>
                <th><Calendar className="h-3 w-3 inline mr-1" />End date</th>
                <th><Users className="h-3 w-3 inline mr-1" />Members</th>
                <th>Tasks</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((project: Project) => (
                <tr key={project.id}>
                  <td className="text-op-muted text-[10px]">{project.id}</td>
                  <td>
                    <Link
                      to={`/projects/${project.id}`}
                      className="font-medium text-op-primary hover:underline"
                    >
                      {project.name}
                    </Link>
                    {project.description && (
                      <p className="text-[10px] text-op-muted truncate max-w-xs mt-0.5">
                        {project.description}
                      </p>
                    )}
                  </td>
                  <td><Badge value={project.status} /></td>
                  <td className="w-36">
                    <ProgressBar value={project.progress ?? 0} />
                  </td>
                  <td className="text-op-muted whitespace-nowrap">{formatDate(project.endDate)}</td>
                  <td className="text-op-muted">{project.members?.length || 0}</td>
                  <td className="text-op-muted">{project._count?.tasks || 0}</td>
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
