import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '../../api/projects.api'
import { usersApi } from '../../api/users.api'
import { tasksApi } from '../../api/tasks.api'
import { Spinner } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatDate, formatRelative } from '../../utils/formatDate'
import { Pencil, Trash2, ChevronRight, UserPlus, X, Upload, Download, Paperclip } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Task, Activity, Attachment, User, ProjectMember } from '../../types'

const TABS = ['Overview', 'Tasks', 'Members', 'Files', 'Activity']

export function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState('Overview')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [removeMemberId, setRemoveMemberId] = useState<number | null>(null)
  const [deleteAttachId, setDeleteAttachId] = useState<number | null>(null)
  const [addMemberId, setAddMemberId] = useState('')

  const projectId = parseInt(id!)

  const { data: project, isLoading } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectsApi.getById(projectId),
  })

  const [showClosed, setShowClosed] = useState(false)

  const { data: tasks } = useQuery({
    queryKey: ['tasks', { projectId, showClosed }],
    queryFn: () => tasksApi.list({
      projectId,
      limit: 100,
      ...(showClosed ? {} : { excludeStatus: 'Closed' }),
    }),
    enabled: tab === 'Tasks',
  })

  const { data: activities } = useQuery({
    queryKey: ['projects', projectId, 'activities'],
    queryFn: () => projectsApi.activities(projectId),
    enabled: tab === 'Activity',
  })

  const { data: attachments, refetch: refetchAttachments } = useQuery({
    queryKey: ['projects', projectId, 'attachments'],
    queryFn: () => projectsApi.attachments(projectId),
    enabled: tab === 'Files',
  })

  const { data: usersData } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => usersApi.list({ limit: 100 }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => projectsApi.delete(projectId),
    onSuccess: () => navigate('/projects'),
  })

  const addMemberMutation = useMutation({
    mutationFn: (userId: number) => projectsApi.addMember(projectId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', projectId] })
      setAddMemberId('')
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (userId: number) => projectsApi.removeMember(projectId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', projectId] })
      setRemoveMemberId(null)
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => projectsApi.uploadFile(projectId, file),
    onSuccess: () => refetchAttachments(),
  })

  const deleteAttachmentMutation = useMutation({
    mutationFn: (attachmentId: number) => projectsApi.deleteAttachment(attachmentId),
    onSuccess: () => {
      refetchAttachments()
      setDeleteAttachId(null)
    },
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-64"><Spinner /></div>
  )
  if (!project) return (
    <div className="p-6 text-op-muted text-sm">Project not found.</div>
  )

  const canManageProject = user?.role === 'Admin' || user?.role === 'Manager'

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="px-6 py-2 border-b border-op-border bg-white flex items-center gap-1 text-[11px] text-op-muted flex-shrink-0">
        <Link to="/projects" className="hover:text-op-primary transition-colors">Projects</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-op-text font-medium">{project.name}</span>
      </div>

      {/* Title bar */}
      <div className="px-6 py-4 bg-white border-b border-op-border flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-op-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {project.name[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-base font-semibold text-op-text">{project.name}</h1>
            </div>
            <Badge value={project.status} />
            {project.priority && <Badge value={project.priority} />}
          </div>
          <div className="flex items-center gap-1.5">
            <Link to={`/projects/${id}/edit`} className="btn-secondary btn-sm">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
            {canManageProject && (
              <button
                onClick={() => setDeleteOpen(true)}
                className="btn-ghost btn-sm text-op-muted hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="op-tabs bg-white border-b border-op-border flex-shrink-0 px-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`op-tab ${tab === t ? 'op-tab-active' : ''}`}
          >
            {t}
            {t === 'Tasks' && project._count?.tasks ? (
              <span className="ml-1 text-[10px] bg-op-border text-op-muted px-1 rounded-full">
                {project._count.tasks}
              </span>
            ) : null}
            {t === 'Members' && project.members?.length ? (
              <span className="ml-1 text-[10px] bg-op-border text-op-muted px-1 rounded-full">
                {project.members.length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* Overview */}
        {tab === 'Overview' && (
          <div className="flex gap-5">
            <div className="flex-1 min-w-0 space-y-4">
              <div className="op-panel">
                <div className="op-panel-header">
                  <span className="op-panel-title">Description</span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs text-op-text leading-relaxed whitespace-pre-wrap">
                    {project.description || <span className="text-op-muted italic">No description provided.</span>}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="op-panel">
                <div className="op-panel-header">
                  <span className="op-panel-title">Progress</span>
                </div>
                <div className="px-4 py-3">
                  <ProgressBar value={project.progress ?? 0} />
                </div>
              </div>
            </div>

            {/* Attributes panel */}
            <div className="w-60 flex-shrink-0">
              <div className="op-panel">
                <div className="op-panel-header">
                  <span className="op-panel-title">Details</span>
                </div>
                <div className="px-4 py-2">
                  <div className="attr-row">
                    <span className="attr-label">Status</span>
                    <div className="attr-value"><Badge value={project.status} /></div>
                  </div>
                  <div className="attr-row">
                    <span className="attr-label">Priority</span>
                    <div className="attr-value">
                      {project.priority
                        ? <Badge value={project.priority} />
                        : <span className="text-op-muted text-xs">—</span>}
                    </div>
                  </div>
                  <div className="attr-row">
                    <span className="attr-label">Manager</span>
                    <span className="attr-value text-xs">{project.manager?.name || '—'}</span>
                  </div>
                  <div className="attr-row">
                    <span className="attr-label">Start date</span>
                    <span className="attr-value text-xs">{formatDate(project.startDate) || '—'}</span>
                  </div>
                  <div className="attr-row">
                    <span className="attr-label">End date</span>
                    <span className="attr-value text-xs">{formatDate(project.endDate) || '—'}</span>
                  </div>
                  <div className="attr-row">
                    <span className="attr-label">Tasks</span>
                    <span className="attr-value text-xs font-semibold">
                      {project._count?.tasks || 0}
                    </span>
                  </div>
                  <div className="attr-row">
                    <span className="attr-label">Members</span>
                    <span className="attr-value text-xs font-semibold">
                      {project.members?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks */}
        {tab === 'Tasks' && (() => {
          const allTasks: Task[] = tasks?.data || []
          // Group by assignee department
          const groups: Record<string, Task[]> = {}
          allTasks.forEach((t) => {
            const dept = t.assignee?.department || 'Unassigned'
            if (!groups[dept]) groups[dept] = []
            groups[dept].push(t)
          })
          const deptOrder = Object.keys(groups).sort((a, b) =>
            a === 'Unassigned' ? 1 : b === 'Unassigned' ? -1 : a.localeCompare(b)
          )
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-op-muted font-medium">
                  {tasks?.pagination?.total || 0} work packages
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-op-muted select-none">
                    <input
                      type="checkbox"
                      checked={showClosed}
                      onChange={(e) => setShowClosed(e.target.checked)}
                      className="rounded"
                    />
                    Show closed
                  </label>
                  <Link to={`/tasks?projectId=${id}`} className="btn-secondary btn-sm">
                    View all
                  </Link>
                </div>
              </div>
              {allTasks.length === 0 && (
                <div className="op-panel py-12 text-center text-op-muted text-sm">No tasks yet.</div>
              )}
              {deptOrder.map((dept) => (
                <div key={dept} className="op-panel overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-op-bg border-b border-op-border">
                    <span className="w-2 h-2 rounded-full bg-op-primary flex-shrink-0" />
                    <span className="text-xs font-semibold text-op-text">{dept}</span>
                    <span className="text-[10px] bg-op-border text-op-muted px-1.5 rounded-full font-medium">
                      {groups[dept].length}
                    </span>
                  </div>
                  <table className="op-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Subject</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Assignee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups[dept].map((t) => (
                        <tr key={t.id}>
                          <td className="text-op-muted text-[10px]">VX-{t.id}</td>
                          <td>
                            <Link to={`/tasks/${t.id}`} className="text-op-primary hover:underline font-medium">
                              {t.title}
                            </Link>
                          </td>
                          <td><Badge value={t.type} /></td>
                          <td><Badge value={t.status} /></td>
                          <td><Badge value={t.priority} /></td>
                          <td>
                            {t.assignee ? (
                              <div className="flex items-center gap-1.5">
                                <Avatar name={t.assignee.name} src={t.assignee.avatarUrl} size="sm" />
                                <span className="text-[11px]">{t.assignee.name}</span>
                              </div>
                            ) : (
                              <span className="text-op-muted text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )
        })()}

        {/* Members */}
        {tab === 'Members' && (
          <div className="op-panel overflow-hidden">
            {canManageProject && (
              <div className="op-panel-header">
                <div className="flex items-center gap-2">
                  <select
                    className="input w-56"
                    value={addMemberId}
                    onChange={(e) => setAddMemberId(e.target.value)}
                  >
                    <option value="">Add member...</option>
                    {usersData?.data
                      ?.filter((u: User) => !project.members?.some((m: ProjectMember) => m.userId === u.id))
                      .map((u: User) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                  </select>
                  <button
                    className="btn-primary"
                    disabled={!addMemberId}
                    onClick={() => addMemberId && addMemberMutation.mutate(parseInt(addMemberId))}
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
              </div>
            )}
            <table className="op-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  {canManageProject && <th />}
                </tr>
              </thead>
              <tbody>
                {project.members?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-op-muted">No members yet.</td>
                  </tr>
                )}
                {project.members?.map((m: ProjectMember) => (
                  <tr key={m.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={m.user.name} src={m.user.avatarUrl} size="sm" />
                        <span className="font-medium">{m.user.name}</span>
                      </div>
                    </td>
                    <td><Badge value={m.user.role} /></td>
                    <td className="text-op-muted">{m.user.email}</td>
                    {canManageProject && (
                      <td>
                        <button
                          onClick={() => setRemoveMemberId(m.userId)}
                          className="text-op-muted/40 hover:text-red-500 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Files */}
        {tab === 'Files' && (
          <div className="op-panel overflow-hidden">
            <div className="op-panel-header">
              <span className="op-panel-title">Files</span>
              <label className="btn-primary btn-sm cursor-pointer">
                <Upload className="h-3.5 w-3.5" /> Upload
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) uploadMutation.mutate(f)
                  }}
                />
              </label>
            </div>
            <div className="divide-y divide-op-border-light">
              {(attachments as Attachment[])?.length === 0 && (
                <p className="px-5 py-8 text-center text-op-muted text-xs">No files uploaded.</p>
              )}
              {(attachments as Attachment[])?.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <Paperclip className="h-3.5 w-3.5 text-op-muted flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-op-text truncate">{a.originalName}</p>
                    <p className="text-[10px] text-op-muted">
                      {(a.sizeBytes / 1024).toFixed(1)} KB · {a.uploader?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="btn-ghost btn-sm"
                      onClick={() => {
                        const apiUrl = import.meta.env.VITE_API_URL || '/api'
                        const token = localStorage.getItem('token')
                        fetch(`${apiUrl}/attachments/${a.id}/download`, {
                          headers: { Authorization: `Bearer ${token}` },
                        }).then(r => r.blob()).then(blob => {
                          const url = URL.createObjectURL(blob)
                          const link = document.createElement('a')
                          link.href = url
                          link.download = a.originalName
                          link.click()
                          URL.revokeObjectURL(url)
                        })
                      }}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    {canManageProject && (
                      <button
                        className="btn-ghost btn-sm text-op-muted hover:text-red-500"
                        onClick={() => setDeleteAttachId(a.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity */}
        {tab === 'Activity' && (
          <div className="op-panel overflow-hidden">
            <div className="op-panel-header">
              <span className="op-panel-title">Activity log</span>
            </div>
            <div className="divide-y divide-op-border-light max-h-[600px] overflow-y-auto">
              {(activities as { data: Activity[] })?.data?.length === 0 && (
                <p className="px-5 py-8 text-center text-op-muted text-xs">No activity yet.</p>
              )}
              {(activities as { data: Activity[] })?.data?.map((a: Activity) => (
                <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                  <Avatar name={a.actor?.name} src={a.actor?.avatarUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-op-text">
                      <span className="font-semibold">{a.actor?.name}</span>{' '}
                      {a.description || a.action}
                    </p>
                    {a.oldValue && a.newValue && (
                      <p className="text-[10px] text-op-muted mt-0.5">
                        <span className="line-through">{a.oldValue}</span>
                        {' → '}
                        <span className="font-medium text-op-text">{a.newValue}</span>
                      </p>
                    )}
                    <p className="text-[10px] text-op-muted mt-0.5">{formatRelative(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        message="Delete this project and all its tasks permanently? This cannot be undone."
      />
      <ConfirmDialog
        isOpen={removeMemberId !== null}
        onClose={() => setRemoveMemberId(null)}
        onConfirm={() => removeMemberId !== null && removeMemberMutation.mutate(removeMemberId)}
        isLoading={removeMemberMutation.isPending}
        message="Remove this member from the project?"
      />
      <ConfirmDialog
        isOpen={deleteAttachId !== null}
        onClose={() => setDeleteAttachId(null)}
        onConfirm={() => deleteAttachId !== null && deleteAttachmentMutation.mutate(deleteAttachId)}
        isLoading={deleteAttachmentMutation.isPending}
        message="Delete this file permanently?"
      />
    </div>
  )
}
