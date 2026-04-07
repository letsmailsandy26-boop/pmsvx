import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '../../api/projects.api'
import { usersApi } from '../../api/users.api'
import { Spinner } from '../../components/ui/Spinner'
import { ArrowLeft } from 'lucide-react'
import { User } from '../../types'
import { PROJECT_STATUSES, PRIORITIES } from '../../constants/enums'

export function ProjectFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = !!id

  const { data: project, isLoading } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(parseInt(id!)),
    enabled: isEdit,
  })

  const { data: usersData } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => usersApi.list({ limit: 100 }),
  })

  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Planning',
    priority: 'Medium',
    managerId: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name,
        description: project.description || '',
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        status: project.status,
        priority: project.priority,
        managerId: String(project.managerId),
      })
    }
  }, [project])

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      isEdit ? projectsApi.update(parseInt(id!), data) : projectsApi.create(data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['projects', 'sidebar'] })
      navigate(`/projects/${data.id}`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'An error occurred')
    },
  })

  if (isEdit && isLoading) return <Spinner className="mt-20" />

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="btn-ghost btn-sm">
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <h1 className="text-base font-semibold text-op-text">
          {isEdit ? 'Edit project' : 'New project'}
        </h1>
      </div>
      <div className="op-panel">
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            setError('')
            mutation.mutate(form)
          }}
          className="px-5 py-4 space-y-4"
        >
          <div>
            <label className="label">Project Name *</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Manager</label>
              <select
                className="input"
                value={form.managerId}
                onChange={(e) => setForm((f) => ({ ...f, managerId: e.target.value }))}
              >
                <option value="">Select manager</option>
                {usersData?.data?.map((u: User) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Start Date</label>
              <input
                className="input"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">End Date</label>
              <input
                className="input"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">{error}</p>
          )}
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save project'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
