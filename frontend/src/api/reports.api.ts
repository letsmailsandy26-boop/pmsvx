import client from './client'

export const reportsApi = {
  timeByUser: (params?: Record<string, unknown>) =>
    client.get('/reports/time-by-user', { params }).then((r) => r.data.data),
  timeByProject: (params?: Record<string, unknown>) =>
    client.get('/reports/time-by-project', { params }).then((r) => r.data.data),
  timeByTask: (params?: Record<string, unknown>) =>
    client.get('/reports/time-by-task', { params }).then((r) => r.data.data),
  taskStatusSummary: (params?: Record<string, unknown>) =>
    client.get('/reports/task-status-summary', { params }).then((r) => r.data.data),
  projectProgress: () =>
    client.get('/reports/project-progress').then((r) => r.data.data),
  myTimeSummary: (params?: Record<string, unknown>) =>
    client.get('/reports/my-time-summary', { params }).then((r) => r.data.data),
}
