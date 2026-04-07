import client from './client'

export const notificationsApi = {
  list: (params?: Record<string, unknown>) =>
    client.get('/notifications', { params }).then((r) => r.data),
  unreadCount: () =>
    client.get('/notifications/unread-count').then((r) => r.data.data.count as number),
  markRead: (id: number) => client.patch(`/notifications/${id}/read`),
  markAllRead: () => client.patch('/notifications/read-all'),
  delete: (id: number) => client.delete(`/notifications/${id}`),
}
