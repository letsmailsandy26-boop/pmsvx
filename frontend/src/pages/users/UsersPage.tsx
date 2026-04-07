import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { usersApi } from '../../api/users.api'
import { Spinner } from '../../components/ui/Spinner'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Pagination } from '../../components/ui/Pagination'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatDate } from '../../utils/formatDate'
import { User } from '../../types'
import { cn } from '../../utils/cn'

export function UsersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => usersApi.list({ page, search, limit: 20 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      setDeleteId(null)
    },
  })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-base font-semibold text-op-text">Users</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-op-muted" />
            <input
              className="input pl-8 w-52"
              placeholder="Search users..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <Link to="/users/new" className="btn-primary">
            <Plus className="h-3.5 w-3.5" /> Add user
          </Link>
        </div>
      </div>

      <div className="op-panel overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <table className="op-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Joined</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((user: User) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                      <div>
                        <p className="font-medium text-op-text">{user.name}</p>
                        <p className="text-[10px] text-op-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><Badge value={user.role} /></td>
                  <td className="text-op-muted">{user.department || '—'}</td>
                  <td>
                    <span className={cn(
                      'badge-status',
                      user.isActive
                        ? 'bg-green-50 text-green-700 border-green-300'
                        : 'bg-red-50 text-red-600 border-red-300',
                    )}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-op-muted">{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <Link to={`/users/${user.id}/edit`} className="btn-ghost btn-sm">
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(user.id)}
                        className="btn-ghost btn-sm text-op-muted hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="px-4 py-3 border-t border-op-border">
          <Pagination
            page={page}
            totalPages={data?.pagination?.totalPages || 1}
            onPage={setPage}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
        message="This will deactivate the user account."
      />
    </div>
  )
}
