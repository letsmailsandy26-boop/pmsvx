import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../../api/notifications.api'
import { Spinner } from '../../components/ui/Spinner'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatRelative } from '../../utils/formatDate'
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
import { Notification } from '../../types'
import { cn } from '../../utils/cn'

export function NotificationsPage() {
  const qc = useQueryClient()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list({ limit: 50 }),
  })

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      setDeleteId(null)
    },
  })

  const unreadCount = data?.data?.filter((n: Notification) => !n.isRead).length ?? 0

  return (
    <div className="p-6 max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-op-text">Notifications</h1>
          {unreadCount > 0 && (
            <span className="badge-status bg-blue-50 text-blue-700 border-blue-300">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            className="btn-secondary btn-sm"
            disabled={markAllMutation.isPending}
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      <div className="op-panel overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : data?.data?.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="h-8 w-8 text-op-border mx-auto mb-2" />
            <p className="text-sm text-op-muted">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-op-border-light">
            {data?.data?.map((n: Notification) => (
              <div
                key={n.id}
                className={cn(
                  'flex items-start gap-3 px-5 py-3.5 hover:bg-op-hover transition-colors',
                  !n.isRead && 'bg-blue-50/40',
                )}
              >
                <div className={cn(
                  'mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                  n.isRead ? 'bg-op-table-head' : 'bg-blue-100',
                )}>
                  <Bell className={cn('h-3 w-3', n.isRead ? 'text-op-muted' : 'text-blue-600')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs', !n.isRead ? 'font-semibold text-op-text' : 'text-op-text')}>
                    {n.title}
                  </p>
                  <p className="text-xs text-op-muted mt-0.5">{n.body}</p>
                  <p className="text-[10px] text-op-muted mt-1">{formatRelative(n.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => markReadMutation.mutate(n.id)}
                      className="btn-ghost btn-sm text-op-primary"
                      title="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteId(n.id)}
                    className="btn-ghost btn-sm text-op-muted hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId !== null && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
        message="Delete this notification?"
      />
    </div>
  )
}
