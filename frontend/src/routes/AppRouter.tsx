import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { AppShell } from '../components/layout/AppShell'
import { LoginPage } from '../pages/auth/LoginPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { UsersPage } from '../pages/users/UsersPage'
import { UserFormPage } from '../pages/users/UserFormPage'
import { ProfilePage } from '../pages/users/ProfilePage'
import { ProjectsPage } from '../pages/projects/ProjectsPage'
import { ProjectFormPage } from '../pages/projects/ProjectFormPage'
import { ProjectDetailPage } from '../pages/projects/ProjectDetailPage'
import { TasksPage } from '../pages/tasks/TasksPage'
import { MyTasksPage } from '../pages/tasks/MyTasksPage'
import { TaskDetailPage } from '../pages/tasks/TaskDetailPage'
import { TimeLogsPage } from '../pages/timelogs/TimeLogsPage'
import { ReportsPage } from '../pages/reports/ReportsPage'
import { NotificationsPage } from '../pages/notifications/NotificationsPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-tasks" element={<MyTasksPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<ProjectFormPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/projects/:id/edit" element={<ProjectFormPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route path="/timelogs" element={<TimeLogsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route element={<RoleRoute roles={['Admin', 'Manager']} />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/new" element={<UserFormPage />} />
              <Route path="/users/:id/edit" element={<UserFormPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
