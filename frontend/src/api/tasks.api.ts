import client from './client'

export const tasksApi = {
  list: (params?: Record<string, unknown>) =>
    client.get('/tasks', { params }).then((r) => r.data),
  getById: (id: number) => client.get(`/tasks/${id}`).then((r) => r.data.data),
  create: (data: Record<string, unknown>) =>
    client.post('/tasks', data).then((r) => r.data.data),
  update: (id: number, data: Record<string, unknown>) =>
    client.patch(`/tasks/${id}`, data).then((r) => r.data.data),
  delete: (id: number) => client.delete(`/tasks/${id}`),
  changeStatus: (id: number, status: string) =>
    client.patch(`/tasks/${id}/status`, { status }).then((r) => r.data.data),
  updateProgress: (id: number, progressPercent: number) =>
    client.patch(`/tasks/${id}/progress`, { progressPercent }).then((r) => r.data.data),
  assign: (id: number, data: Record<string, unknown>) =>
    client.patch(`/tasks/${id}/assign`, data).then((r) => r.data.data),
  // Comments
  addComment: (id: number, body: string) =>
    client.post(`/tasks/${id}/comments`, { body }).then((r) => r.data.data),
  deleteComment: (taskId: number, commentId: number) =>
    client.delete(`/tasks/${taskId}/comments/${commentId}`),
  // Time logs
  logTime: (id: number, data: Record<string, unknown>) =>
    client.post(`/tasks/${id}/timelogs`, data).then((r) => r.data.data),
  deleteTimeLog: (taskId: number, logId: number) =>
    client.delete(`/tasks/${taskId}/timelogs/${logId}`),
  // Attachments
  uploadFile: (id: number, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return client
      .post(`/tasks/${id}/attachments`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data)
  },
  deleteAttachment: (attachmentId: number) =>
    client.delete(`/attachments/${attachmentId}`),
}
