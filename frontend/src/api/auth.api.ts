import client from './client'

export const authApi = {
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }).then((r) => r.data.data),
  me: () => client.get('/auth/me').then((r) => r.data.data),
  logout: () => client.post('/auth/logout'),
  changePassword: (currentPassword: string, newPassword: string) =>
    client.patch('/auth/change-password', { currentPassword, newPassword }),
}
