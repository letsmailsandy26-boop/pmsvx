import { useState, FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../../api/users.api'
import { authApi } from '../../api/auth.api'
import { useAuth } from '../../contexts/AuthContext'
import { Spinner } from '../../components/ui/Spinner'
import { Avatar } from '../../components/ui/Avatar'
import { Camera } from 'lucide-react'

export function ProfilePage() {
  const { user: authUser } = useAuth()
  const qc = useQueryClient()
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')

  const { data: user, isLoading } = useQuery({
    queryKey: ['users', authUser?.id],
    queryFn: () => usersApi.getById(authUser!.id),
    enabled: !!authUser,
  })

  const avatarMutation = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(authUser!.id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', authUser?.id] }),
  })

  const pwMutation = useMutation({
    mutationFn: () => authApi.changePassword(pwForm.currentPassword, pwForm.newPassword),
    onSuccess: () => {
      setPwMsg('Password changed successfully.')
      setPwError('')
      setPwForm({ currentPassword: '', newPassword: '' })
    },
    onError: () => {
      setPwError('Failed to change password. Check your current password.')
      setPwMsg('')
    },
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-64"><Spinner /></div>
  )

  return (
    <div className="p-6 max-w-2xl space-y-4">
      <h1 className="text-base font-semibold text-op-text">My profile</h1>

      {/* Profile card */}
      <div className="op-panel">
        <div className="op-panel-header">
          <span className="op-panel-title">Personal information</span>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <Avatar name={user?.name} src={user?.avatarUrl} size="lg" />
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-op cursor-pointer border border-op-border hover:bg-op-hover transition-colors">
                <Camera className="h-3 w-3 text-op-muted" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) avatarMutation.mutate(f)
                  }}
                />
              </label>
            </div>
            <div>
              <p className="text-sm font-semibold text-op-text">{user?.name}</p>
              <p className="text-xs text-op-muted">{user?.email}</p>
            </div>
          </div>

          <div className="divide-y divide-op-border-light">
            <div className="attr-row">
              <span className="attr-label">Role</span>
              <span className="attr-value text-xs">{user?.role}</span>
            </div>
            <div className="attr-row">
              <span className="attr-label">Department</span>
              <span className="attr-value text-xs">{user?.department || <span className="text-op-muted">—</span>}</span>
            </div>
            <div className="attr-row">
              <span className="attr-label">Designation</span>
              <span className="attr-value text-xs">{user?.designation || <span className="text-op-muted">—</span>}</span>
            </div>
            <div className="attr-row">
              <span className="attr-label">Phone</span>
              <span className="attr-value text-xs">{user?.phone || <span className="text-op-muted">—</span>}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="op-panel">
        <div className="op-panel-header">
          <span className="op-panel-title">Change password</span>
        </div>
        <form
          onSubmit={(e: FormEvent) => { e.preventDefault(); pwMutation.mutate() }}
          className="px-5 py-4 space-y-3 max-w-sm"
        >
          <div>
            <label className="label">Current password</label>
            <input
              className="input"
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              className="input"
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
              required
              minLength={6}
            />
          </div>
          {pwMsg && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
              {pwMsg}
            </p>
          )}
          {pwError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
              {pwError}
            </p>
          )}
          <button type="submit" className="btn-primary" disabled={pwMutation.isPending}>
            {pwMutation.isPending ? 'Updating...' : 'Change password'}
          </button>
        </form>
      </div>
    </div>
  )
}
