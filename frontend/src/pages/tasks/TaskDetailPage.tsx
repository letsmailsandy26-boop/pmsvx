import { useState, FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../../api/tasks.api'
import { Spinner } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatDate, formatRelative } from '../../utils/formatDate'
import {
  ChevronRight, Pencil, Trash2, MessageSquare, Clock,
  Paperclip, Activity, Upload, Download, X, Plus,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Comment, TimeLog, Attachment, Activity as ActivityType } from '../../types'
import { TASK_STATUS_LABELS, TASK_STATUSES } from '../../constants/enums'
import { TimeLogModal } from '../../components/timelogs/TimeLogModal'
import { TaskFormModal } from '../../components/tasks/TaskFormModal'

type TabKey = 'comments' | 'timelogs' | 'attachments' | 'activity'

const S: Record<string, React.CSSProperties> = {
  page:        { display:'flex', flexDirection:'column', height:'100%', background:'#fff', overflow:'hidden' },
  crumb:       { padding:'6px 20px', borderBottom:'1px solid #E0E0E0', display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#555', flexShrink:0, background:'#F7F8FA' },
  crumbLink:   { color:'#1A67A3', textDecoration:'none', fontWeight:500 },
  titleBar:    { padding:'14px 20px 12px', borderBottom:'1px solid #E0E0E0', background:'#fff', flexShrink:0 },
  titleMeta:   { display:'flex', alignItems:'center', gap:6, marginBottom:6 },
  titleText:   { fontSize:20, fontWeight:700, color:'#1A1A2E', margin:0, lineHeight:1.25 },
  body:        { display:'flex', flex:1, overflow:'hidden' },
  main:        { flex:1, overflow:'auto', minWidth:0 },
  mainInner:   { padding:'20px 24px' },
  descLabel:   { fontSize:11, fontWeight:700, color:'#1A67A3', textTransform:'uppercase' as const, letterSpacing:'0.08em', marginBottom:8 },
  descText:    { fontSize:13, color:'#222', lineHeight:1.7, margin:0, whiteSpace:'pre-wrap' as const },
  descEmpty:   { fontSize:13, color:'#999', fontStyle:'italic' as const, margin:0 },
  divider:     { border:'none', borderTop:'1px solid #EBEBEB', margin:'18px 0' },
  // tabs
  tabBar:      { display:'flex', borderBottom:'1px solid #E0E0E0', marginBottom:0 },
  tab:         { display:'flex', alignItems:'center', gap:5, padding:'10px 16px', fontSize:12, fontWeight:500, cursor:'pointer', background:'none', border:'none', borderBottom:'2px solid transparent', color:'#444', transition:'color 0.1s', whiteSpace:'nowrap' as const },
  tabActive:   { color:'#1A67A3', borderBottomColor:'#1A67A3' },
  tabCount:    { fontSize:10, background:'#E8EEF4', color:'#1A67A3', borderRadius:9999, padding:'0 5px', lineHeight:'16px', fontWeight:600 },
  // comments
  commentList: { maxHeight:340, overflowY:'auto' as const },
  commentItem: { display:'flex', gap:10, padding:'12px 20px', borderBottom:'1px solid #F0F0F0' },
  commentMeta: { display:'flex', alignItems:'baseline', gap:8, marginBottom:3 },
  commentName: { fontSize:12, fontWeight:700, color:'#1A1A2E' },
  commentTime: { fontSize:11, color:'#666' },
  commentBody: { fontSize:13, color:'#333', margin:0, lineHeight:1.6 },
  commentForm: { padding:'12px 20px', borderTop:'1px solid #EBEBEB', background:'#F9FAFB', display:'flex', gap:10, alignItems:'flex-start' },
  // right panel
  panel:       { width:270, flexShrink:0, borderLeft:'1px solid #E0E0E0', background:'#FAFBFC', overflowY:'auto' as const, display:'flex', flexDirection:'column' as const },
  panelStatus: { padding:'14px 16px', borderBottom:'1px solid #E8E8E8' },
  panelLabel:  { fontSize:10, fontWeight:700, color:'#1A67A3', textTransform:'uppercase' as const, letterSpacing:'0.1em', marginBottom:8 },
  attrList:    { padding:'4px 16px 12px' },
  attrRow:     { display:'flex', alignItems:'center', padding:'7px 0', borderBottom:'1px solid #F0F0F0' },
  attrRowLast: { display:'flex', alignItems:'center', padding:'7px 0' },
  attrKey:     { width:90, flexShrink:0, fontSize:12, color:'#888', fontWeight:500 },
  attrVal:     { flex:1, fontSize:13, color:'#333' },
  logBtn:      { padding:'12px 16px', borderTop:'1px solid #EBEBEB', marginTop:'auto' },
}

export function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const qc = useQueryClient()
  const taskId = parseInt(id!)

  const [activeTab, setActiveTab] = useState<TabKey>('comments')
  const [comment, setComment] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [showTimeLog, setShowTimeLog] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null)
  const [deleteLogId, setDeleteLogId] = useState<number | null>(null)
  const [deleteAttachId, setDeleteAttachId] = useState<number | null>(null)

  const { data: task, isLoading } = useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => tasksApi.getById(taskId),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['tasks', taskId] })

  const statusMutation  = useMutation({ mutationFn: (s: string) => tasksApi.changeStatus(taskId, s), onSuccess: invalidate })
  const commentMutation = useMutation({ mutationFn: (b: string) => tasksApi.addComment(taskId, b), onSuccess: () => { invalidate(); setComment('') } })
  const deleteMutation  = useMutation({ mutationFn: () => tasksApi.delete(taskId), onSuccess: () => navigate(-1) })
  const delCommentMut   = useMutation({ mutationFn: (cid: number) => tasksApi.deleteComment(taskId, cid), onSuccess: invalidate })
  const delAttachMut    = useMutation({ mutationFn: (aid: number) => tasksApi.deleteAttachment(aid), onSuccess: invalidate })
  const uploadMut       = useMutation({ mutationFn: (f: File) => tasksApi.uploadFile(taskId, f), onSuccess: invalidate })
  const delLogMut       = useMutation({ mutationFn: (lid: number) => tasksApi.deleteTimeLog(taskId, lid), onSuccess: invalidate })

  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', padding:64 }}><Spinner /></div>
  if (!task)    return <div style={{ padding:24, color:'#555' }}>Work package not found.</div>

  const isManagerOrAdmin = true
  const canEdit = true
  const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Closed'

  const tabs: { key: TabKey; icon: typeof MessageSquare; label: string; count?: number }[] = [
    { key:'comments',    icon:MessageSquare, label:'Comments',  count:task.comments?.length },
    { key:'timelogs',    icon:Clock,         label:'Time Logs', count:task.timeLogs?.length },
    { key:'attachments', icon:Paperclip,     label:'Files',     count:task.attachments?.length },
    { key:'activity',    icon:Activity,      label:'Activity',  count:task.activities?.length },
  ]

  return (
    <div style={S.page}>

      {/* Breadcrumb */}
      <div style={S.crumb}>
        <Link to="/projects" style={S.crumbLink}>Projects</Link>
        <ChevronRight size={11} />
        {task.project && <>
          <Link to={`/projects/${task.projectId}`} style={S.crumbLink}>{task.project.name}</Link>
          <ChevronRight size={11} />
        </>}
        <span style={{ color:'#555' }}>VX-{task.id}</span>
      </div>

      {/* Title bar */}
      <div style={S.titleBar}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={S.titleMeta}>
              <Badge value={task.type} />
              <span style={{ color:'#777', fontSize:12 }}>VX-{task.id}</span>
              <Badge value={task.priority} />
            </div>
            <h1 style={S.titleText}>{task.title}</h1>
          </div>
          <div style={{ display:'flex', gap:6, flexShrink:0, paddingTop:2 }}>
            {canEdit && (
              <button className="btn-secondary btn-sm" onClick={() => setShowEdit(true)}>
                <Pencil size={12} /> Edit
              </button>
            )}
            {isManagerOrAdmin && (
              <button className="btn-ghost btn-sm" onClick={() => setDeleteOpen(true)}
                style={{ color:'#999' }}
                onMouseOver={e => (e.currentTarget.style.color = '#dc2626')}
                onMouseOut={e => (e.currentTarget.style.color = '#999')}>
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={S.body}>

        {/* ── Main ──────────────────────────────────── */}
        <div style={S.main}>
          <div style={S.mainInner}>

            {/* Description */}
            <p style={S.descLabel}>Description</p>
            {task.description
              ? <p style={S.descText}>{task.description}</p>
              : <p style={S.descEmpty}>No description provided.</p>
            }

            <hr style={S.divider} />

            {/* Tab bar */}
            <div style={S.tabBar}>
              {tabs.map(({ key, icon:Icon, label, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{ ...S.tab, ...(activeTab === key ? S.tabActive : {}) }}
                >
                  <Icon size={13} />
                  {label}
                  {count != null && count > 0 && <span style={S.tabCount}>{count}</span>}
                </button>
              ))}
            </div>

            {/* ── Comments ── */}
            {activeTab === 'comments' && (
              <div style={{ border:'1px solid #EBEBEB', borderRadius:3, marginTop:12, overflow:'hidden' }}>
                <div style={S.commentList}>
                  {task.comments?.length === 0 && (
                    <p style={{ padding:'28px 20px', textAlign:'center', color:'#888', fontSize:12, margin:0 }}>
                      No comments yet.
                    </p>
                  )}
                  {task.comments?.map((c: Comment) => (
                    <div key={c.id} style={S.commentItem}>
                      <Avatar name={c.author?.name} src={c.author?.avatarUrl} size="sm" />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={S.commentMeta}>
                          <span style={S.commentName}>{c.author?.name}</span>
                          <span style={S.commentTime}>{formatRelative(c.createdAt)}</span>
                          {c.isEdited && <span style={S.commentTime}>(edited)</span>}
                        </div>
                        <p style={S.commentBody}>{c.body}</p>
                      </div>
                      <button onClick={() => setDeleteCommentId(c.id)}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'#BBBBBB', padding:'0 2px', lineHeight:1 }}
                        onMouseOver={e => (e.currentTarget.style.color = '#dc2626')}
                        onMouseOut={e => (e.currentTarget.style.color = '#BBBBBB')}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={(e: FormEvent) => { e.preventDefault(); if (comment.trim()) commentMutation.mutate(comment) }}
                  style={S.commentForm}
                >
                  <Avatar name={user?.name} size="sm" />
                  <div style={{ flex:1 }}>
                    <textarea
                      style={{
                        width:'100%', border:'1px solid #DDD', borderRadius:3,
                        padding:'8px 10px', fontSize:13, color:'#333', lineHeight:1.5,
                        resize:'vertical', fontFamily:'inherit', minHeight:60, outline:'none',
                        boxSizing:'border-box', background:'#fff',
                      }}
                      placeholder="Add a comment…"
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      onFocus={e => (e.currentTarget.style.borderColor = '#1A67A3')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#BBBBBB')}
                    />
                    <button
                      type="submit"
                      disabled={!comment.trim() || commentMutation.isPending}
                      style={{
                        marginTop:6, padding:'5px 14px', fontSize:12, fontWeight:500,
                        background: comment.trim() ? '#1A67A3' : '#C5D8EA',
                        color:'#fff', border:'none', borderRadius:3, cursor: comment.trim() ? 'pointer' : 'default',
                        transition:'background 0.15s',
                      }}
                    >
                      {commentMutation.isPending ? 'Posting…' : 'Add comment'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Time Logs ── */}
            {activeTab === 'timelogs' && (
              <div style={{ border:'1px solid #EBEBEB', borderRadius:3, marginTop:12, overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', background:'#FAFAFA', borderBottom:'1px solid #EBEBEB' }}>
                  <span style={{ fontSize:12, color:'#888' }}>
                    Total: <strong style={{ color:'#333' }}>{task.timeSpentHours}h</strong>
                    {task.estimatedHours && <> / {task.estimatedHours}h estimated</>}
                  </span>
                  <button className="btn-primary btn-sm" onClick={() => setShowTimeLog(true)}>
                    <Clock size={12} /> Log time
                  </button>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead>
                    <tr style={{ background:'#F7F7F7', borderBottom:'1px solid #EBEBEB' }}>
                      {['User','Hours','Category','Date','Note',''].map(h => (
                        <th key={h} style={{ padding:'7px 14px', textAlign:'left', fontWeight:600, color:'#888', fontSize:11 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {task.timeLogs?.length === 0 && (
                      <tr><td colSpan={6} style={{ padding:'24px 14px', textAlign:'center', color:'#888' }}>No time logged yet.</td></tr>
                    )}
                    {task.timeLogs?.map((log: TimeLog) => (
                      <tr key={log.id} style={{ borderBottom:'1px solid #F5F5F5' }}>
                        <td style={{ padding:'8px 14px' }}>{log.user?.name}</td>
                        <td style={{ padding:'8px 14px', fontWeight:600 }}>{log.hours}h</td>
                        <td style={{ padding:'8px 14px' }}><Badge value={log.category} /></td>
                        <td style={{ padding:'8px 14px', color:'#888' }}>{formatDate(log.logDate)}</td>
                        <td style={{ padding:'8px 14px', color:'#888', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.description || '—'}</td>
                        <td style={{ padding:'8px 14px' }}>
                          <button onClick={() => setDeleteLogId(log.id)}
                            style={{ background:'none', border:'none', cursor:'pointer', color:'#BBBBBB' }}
                            onMouseOver={e => (e.currentTarget.style.color='#dc2626')}
                            onMouseOut={e => (e.currentTarget.style.color='#BBBBBB')}>
                            <X size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Files ── */}
            {activeTab === 'attachments' && (
              <div style={{ border:'1px solid #EBEBEB', borderRadius:3, marginTop:12, overflow:'hidden' }}>
                <div style={{ padding:'10px 16px', background:'#FAFAFA', borderBottom:'1px solid #EBEBEB' }}>
                  <label className="btn-primary btn-sm" style={{ cursor:'pointer' }}>
                    <Upload size={12} /> Upload file
                    <input type="file" style={{ display:'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadMut.mutate(f) }} />
                  </label>
                </div>
                {task.attachments?.length === 0 && (
                  <p style={{ padding:'28px 20px', textAlign:'center', color:'#888', fontSize:12, margin:0 }}>No attachments.</p>
                )}
                {task.attachments?.map((a: Attachment) => (
                  <div key={a.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderBottom:'1px solid #F5F5F5' }}>
                    <Paperclip size={13} style={{ color:'#888', flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:500, color:'#333', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.originalName}</p>
                      <p style={{ fontSize:11, color:'#666', margin:'2px 0 0' }}>{(a.sizeBytes/1024).toFixed(1)} KB · {a.uploader?.name}</p>
                    </div>
                    <button
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
                      style={{ padding:'4px 8px', fontSize:12, color:'#888', background:'none', border:'1px solid #E0E0E0', borderRadius:3, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                      <Download size={13} />
                    </button>
                    <button onClick={() => setDeleteAttachId(a.id)}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'#BBBBBB', padding:'4px' }}
                      onMouseOver={e => (e.currentTarget.style.color='#dc2626')}
                      onMouseOut={e => (e.currentTarget.style.color='#BBBBBB')}>
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Activity ── */}
            {activeTab === 'activity' && (
              <div style={{ border:'1px solid #EBEBEB', borderRadius:3, marginTop:12, overflow:'hidden' }}>
                {task.activities?.length === 0 && (
                  <p style={{ padding:'28px 20px', textAlign:'center', color:'#888', fontSize:12, margin:0 }}>No activity yet.</p>
                )}
                {task.activities?.map((a: ActivityType) => (
                  <div key={a.id} style={{ display:'flex', gap:10, padding:'12px 16px', borderBottom:'1px solid #F5F5F5' }}>
                    <Avatar name={a.actor?.name} src={a.actor?.avatarUrl} size="sm" />
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:12, color:'#444', margin:0 }}>
                        <strong>{a.actor?.name}</strong> {a.description || a.action}
                      </p>
                      {a.oldValue && a.newValue && (
                        <p style={{ fontSize:11, color:'#666', margin:'3px 0 0' }}>
                          <span style={{ textDecoration:'line-through' }}>{a.oldValue}</span>
                          {' → '}
                          <strong style={{ color:'#555' }}>{a.newValue}</strong>
                        </p>
                      )}
                      <p style={{ fontSize:11, color:'#666', margin:'3px 0 0' }}>{formatRelative(a.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* ── Right panel ───────────────────────────── */}
        <div style={S.panel}>

          {/* Status */}
          <div style={S.panelStatus}>
            <p style={S.panelLabel}>Status</p>
            {canEdit ? (
              <select
                value={task.status}
                onChange={e => statusMutation.mutate(e.target.value)}
                disabled={statusMutation.isPending}
                style={{
                  width:'100%', border:'1px solid #DDD', borderRadius:3,
                  padding:'6px 10px', fontSize:13, color:'#333', background:'#fff',
                  cursor:'pointer', outline:'none',
                }}
                onFocus={e => (e.currentTarget.style.borderColor='#1A67A3')}
                onBlur={e => (e.currentTarget.style.borderColor='#BBBBBB')}
              >
                {TASK_STATUSES.map(s => <option key={s} value={s}>{TASK_STATUS_LABELS[s] ?? s}</option>)}
              </select>
            ) : (
              <Badge value={task.status} />
            )}
          </div>

          {/* Attributes */}
          <div style={S.attrList}>

            <AttrRow label="Priority">
              <Badge value={task.priority} />
            </AttrRow>

            <AttrRow label="Assignee">
              {task.assignee
                ? <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <Avatar name={task.assignee.name} src={task.assignee.avatarUrl} size="sm" />
                    <span style={{ fontSize:13 }}>{task.assignee.name}</span>
                  </span>
                : <span style={{ color:'#777', fontSize:13 }}>Unassigned</span>
              }
            </AttrRow>

            <AttrRow label="Reporter">
              <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                <Avatar name={task.reporter?.name} src={task.reporter?.avatarUrl} size="sm" />
                <span style={{ fontSize:13, color:'#222' }}>{task.reporter?.name}</span>
              </span>
            </AttrRow>

            {task.reviewer && (
              <AttrRow label="Reviewer">
                <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <Avatar name={task.reviewer.name} src={task.reviewer.avatarUrl} size="sm" />
                  <span style={{ fontSize:13, color:'#222' }}>{task.reviewer.name}</span>
                </span>
              </AttrRow>
            )}

            <AttrRow label="Start date">
              <span style={{ fontSize:13, color:'#222' }}>
                {task.startDate ? formatDate(task.startDate) : <span style={{ color:'#999' }}>—</span>}
              </span>
            </AttrRow>

            <AttrRow label="Due date">
              <span style={{ fontSize:13, fontWeight: overdue ? 600 : 400, color: overdue ? '#dc2626' : '#222' }}>
                {task.dueDate
                  ? <>{formatDate(task.dueDate)}{overdue && <span style={{ fontSize:11, color:'#dc2626', fontWeight:400, marginLeft:4 }}>(overdue)</span>}</>
                  : <span style={{ color:'#999' }}>—</span>
                }
              </span>
            </AttrRow>

            <AttrRow label="Estimated">
              <span style={{ fontSize:13, color:'#222' }}>
                {task.estimatedHours ? `${task.estimatedHours}h` : <span style={{ color:'#999' }}>—</span>}
              </span>
            </AttrRow>

            <AttrRow label="Time spent">
              <span style={{ fontSize:13, fontWeight:700, color:'#1A67A3' }}>{task.timeSpentHours}h</span>
            </AttrRow>

            <AttrRow label="Progress" last>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ flex:1, height:7, background:'#E8E8E8', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ width:`${task.progressPercent}%`, height:'100%', background:'#1A67A3', borderRadius:4 }} />
                </div>
                <span style={{ fontSize:12, color:'#333', fontWeight:600, minWidth:30, textAlign:'right' }}>
                  {task.progressPercent}%
                </span>
              </div>
            </AttrRow>

          </div>

          {/* Log time */}
          <div style={S.logBtn}>
            <button
              onClick={() => setShowTimeLog(true)}
              style={{
                width:'100%', padding:'7px', fontSize:12, fontWeight:500,
                background:'#fff', color:'#555', border:'1px solid #DDD',
                borderRadius:3, cursor:'pointer', display:'flex', alignItems:'center',
                justifyContent:'center', gap:5, transition:'background 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.background='#F5F5F5'; e.currentTarget.style.borderColor='#888' }}
              onMouseOut={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='#BBBBBB' }}
            >
              <Plus size={13} /> Log time
            </button>
          </div>
        </div>
      </div>

      {showTimeLog && <TimeLogModal taskId={taskId} onClose={() => { setShowTimeLog(false); invalidate() }} />}
      {showEdit    && <TaskFormModal taskId={taskId} onClose={() => { setShowEdit(false); invalidate() }} />}
      <ConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()} isLoading={deleteMutation.isPending}
        message="Delete this work package permanently?" />
      <ConfirmDialog isOpen={!!deleteCommentId} onClose={() => setDeleteCommentId(null)}
        onConfirm={() => { if (deleteCommentId) delCommentMut.mutate(deleteCommentId); setDeleteCommentId(null) }}
        isLoading={delCommentMut.isPending} message="Delete this comment?" />
      <ConfirmDialog isOpen={!!deleteLogId} onClose={() => setDeleteLogId(null)}
        onConfirm={() => { if (deleteLogId) delLogMut.mutate(deleteLogId); setDeleteLogId(null) }}
        isLoading={delLogMut.isPending} message="Delete this time log?" />
      <ConfirmDialog isOpen={!!deleteAttachId} onClose={() => setDeleteAttachId(null)}
        onConfirm={() => { if (deleteAttachId) delAttachMut.mutate(deleteAttachId); setDeleteAttachId(null) }}
        isLoading={delAttachMut.isPending} message="Delete this attachment?" />
    </div>
  )
}

// Small helper so the attr rows stay DRY
function AttrRow({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', padding:'8px 0',
      borderBottom: last ? 'none' : '1px solid #F5F5F5',
    }}>
      <span style={{ width:86, flexShrink:0, fontSize:12, color:'#555', fontWeight:600 }}>{label}</span>
      <div style={{ flex:1 }}>{children}</div>
    </div>
  )
}
