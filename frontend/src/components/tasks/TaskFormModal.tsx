import { useState, useEffect, FormEvent } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Modal } from '../ui/Modal'
import { tasksApi } from '../../api/tasks.api'
import { projectsApi } from '../../api/projects.api'
import { usersApi } from '../../api/users.api'
import { Project, User } from '../../types'
import { TASK_TYPES, PRIORITIES, TASK_STATUSES, TASK_STATUS_LABELS } from '../../constants/enums'

interface TaskFormModalProps {
  taskId?: number
  onClose: () => void
}

export function TaskFormModal({ taskId, onClose }: TaskFormModalProps) {
  const isEdit = !!taskId

  const { data: task } = useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => tasksApi.getById(taskId!),
    enabled: isEdit,
  })

  const { data: projectsData } = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: () => projectsApi.list({ limit: 100 }),
  })

  const { data: usersData } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => usersApi.list({ limit: 100, isActive: 'true' }),
  })

  const [form, setForm] = useState({
    projectId: '',
    title: '',
    description: '',
    type: 'Task',
    status: 'New',
    priority: 'Medium',
    assigneeId: '',
    reviewerId: '',
    estimatedHours: '',
    startDate: '',
    dueDate: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (task) {
      setForm({
        projectId: String(task.projectId),
        title: task.title,
        description: task.description || '',
        type: task.type,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId ? String(task.assigneeId) : '',
        reviewerId: task.reviewerId ? String(task.reviewerId) : '',
        estimatedHours: task.estimatedHours ? String(task.estimatedHours) : '',
        startDate: task.startDate ? task.startDate.split('T')[0] : '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      })
    }
  }, [task])

  const mutation = useMutation({
    mutationFn: (data: typeof form) => {
      const payload = {
        ...data,
        projectId: parseInt(data.projectId),
        assigneeId: data.assigneeId ? parseInt(data.assigneeId) : undefined,
        reviewerId: data.reviewerId ? parseInt(data.reviewerId) : undefined,
        estimatedHours: data.estimatedHours ? parseFloat(data.estimatedHours) : undefined,
      }
      return isEdit ? tasksApi.update(taskId!, payload) : tasksApi.create(payload)
    },
    onSuccess: onClose,
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'An error occurred')
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.projectId || !form.title) {
      setError('Project and title are required')
      return
    }
    setError('')
    mutation.mutate(form)
  }

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? 'Edit Task' : 'New Task'} size="xl">
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Task Title *</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Project *</label>
            <select
              className="input"
              value={form.projectId}
              onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
              required
            >
              <option value="">Select project</option>
              {projectsData?.data?.map((p: Project) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Type</label>
            <select
              className="input"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              {TASK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
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
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {TASK_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Assignee</label>
            <select
              className="input"
              value={form.assigneeId}
              onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
            >
              <option value="">Unassigned</option>
              {usersData?.data?.map((u: User) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Reviewer</label>
            <select
              className="input"
              value={form.reviewerId}
              onChange={(e) => setForm((f) => ({ ...f, reviewerId: e.target.value }))}
            >
              <option value="">No reviewer</option>
              {usersData?.data?.map((u: User) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Estimated Hours</label>
            <input
              className="input"
              type="number"
              step="0.5"
              min="0"
              value={form.estimatedHours}
              onChange={(e) => setForm((f) => ({ ...f, estimatedHours: e.target.value }))}
            />
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
            <label className="label">Due Date</label>
            <input
              className="input"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
          </div>
          <div className="col-span-2">
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">{error}</p>
        )}
        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save work package'}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}
