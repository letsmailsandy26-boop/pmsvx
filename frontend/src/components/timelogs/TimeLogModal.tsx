import { useState, FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Modal } from '../ui/Modal'
import { tasksApi } from '../../api/tasks.api'
import { LOG_CATEGORIES } from '../../constants/enums'

interface TimeLogModalProps {
  taskId: number
  onClose: () => void
}

export function TimeLogModal({ taskId, onClose }: TimeLogModalProps) {
  const [form, setForm] = useState({
    hours: '',
    category: 'Development',
    description: '',
    logDate: new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      tasksApi.logTime(taskId, { ...form, hours: parseFloat(form.hours) }),
    onSuccess: onClose,
    onError: () => setError('Failed to log time. Please try again.'),
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const h = parseFloat(form.hours)
    if (!h || h <= 0) {
      setError('Please enter valid hours (> 0)')
      return
    }
    setError('')
    mutation.mutate()
  }

  return (
    <Modal isOpen onClose={onClose} title="Log Time" size="sm">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="label">Hours *</label>
          <input
            className="input"
            type="number"
            step="0.25"
            min="0.25"
            max="24"
            value={form.hours}
            onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
            required
            placeholder="e.g. 2.5"
            autoFocus
          />
        </div>
        <div>
          <label className="label">Category</label>
          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {LOG_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input
            className="input"
            type="date"
            value={form.logDate}
            onChange={(e) => setForm((f) => ({ ...f, logDate: e.target.value }))}
          />
        </div>
        <div>
          <label className="label">Description</label>
          <input
            className="input"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="What did you work on?"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Logging...' : 'Log Time'}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}
