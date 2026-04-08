import client from './client'

export const usersApi = {
  list: (params?: Record<string, unknown>) =>
    client.get('/users', { params }).then((r) => r.data),
  getById: (id: number) => client.get(`/users/${id}`).then((r) => r.data.data),
  create: (data: Record<string, unknown>) =>
    client.post('/users', data).then((r) => r.data.data),
  update: (id: number, data: Record<string, unknown>) =>
    client.patch(`/users/${id}`, data).then((r) => r.data.data),
  delete: (id: number) => client.delete(`/users/${id}`),
  uploadAvatar: (id: number, file: File) => {
    const fd = new FormData()
    fd.append('avatar', file)
    return client
      .post(`/users/${id}/avatar`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data)
  },
  myTasks: () => client.get('/users/me/tasks').then((r) => r.data.data),
  myTimeLogs: (params?: Record<string, unknown>) =>
    client.get('/users/me/timelogs', { params }).then((r) => r.data),
  allTimeLogs: (params?: Record<string, unknown>) =>
    client.get('/timelogs', { params }).then((r) => r.data),
}
