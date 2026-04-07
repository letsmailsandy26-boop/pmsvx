import client from './client'

export const dashboardApi = {
  user: () => client.get('/dashboard/user').then((r) => r.data.data),
  manager: () => client.get('/dashboard/manager').then((r) => r.data.data),
  admin: () => client.get('/dashboard/admin').then((r) => r.data.data),
}
