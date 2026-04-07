import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface RoleRouteProps {
  roles: string[]
}

export function RoleRoute({ roles }: RoleRouteProps) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
