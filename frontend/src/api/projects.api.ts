import client from './client'

export const projectsApi = {
  list: (params?: Record<string, unknown>) =>
    client.get('/projects', { params }).then((r) => r.data),
  getById: (id: number) => client.get(`/projects/${id}`).then((r) => r.data.data),
  create: (data: Record<string, unknown>) => {
    const payload = { ...data, managerId: data.managerId ? parseInt(String(data.managerId)) : undefined }
    return client.post('/projects', payload).then((r) => r.data.data)
  },
  update: (id: number, data: Record<string, unknown>) => {
    const payload = { ...data, managerId: data.managerId ? parseInt(String(data.managerId)) : undefined }
    return client.patch(`/projects/${id}`, payload).then((r) => r.data.data)
  },
  delete: (id: number) => client.delete(`/projects/${id}`),
  addMember: (projectId: number, userId: number) =>
    client.post(`/projects/${projectId}/members`, { userId }).then((r) => r.data.data),
  removeMember: (projectId: number, userId: number) =>
    client.delete(`/projects/${projectId}/members/${userId}`),
  activities: (id: number, params?: Record<string, unknown>) =>
    client.get(`/projects/${id}/activities`, { params }).then((r) => r.data),
  attachments: (id: number) =>
    client.get(`/projects/${id}/attachments`).then((r) => r.data.data),
  deleteAttachment: (attachmentId: number) =>
    client.delete(`/attachments/${attachmentId}`),
  uploadFile: (id: number, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return client
      .post(`/projects/${id}/attachments`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data)
  },
}
