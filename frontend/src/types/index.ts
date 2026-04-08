export interface User {
  id: number
  name: string
  email: string
  role: 'Admin' | 'Manager' | 'User'
  department?: string
  designation?: string
  phone?: string
  avatarUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: number
  name: string
  description?: string
  startDate?: string
  endDate?: string
  status: string
  priority: string
  managerId: number
  createdAt: string
  updatedAt: string
  progress?: number
  manager?: { id: number; name: string; avatarUrl?: string }
  members?: ProjectMember[]
  _count?: { tasks: number }
}

export interface ProjectMember {
  id: number
  projectId: number
  userId: number
  user: { id: number; name: string; email?: string; avatarUrl?: string; role: string }
}

export interface Task {
  id: number
  projectId: number
  title: string
  description?: string
  type: string
  status: string
  priority: string
  assigneeId?: number
  reporterId: number
  reviewerId?: number
  progressPercent: number
  estimatedHours?: number
  timeSpentHours: number
  startDate?: string
  dueDate?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
  project?: { id: number; name: string }
  assignee?: { id: number; name: string; avatarUrl?: string; department?: string }
  reporter?: { id: number; name: string; avatarUrl?: string }
  reviewer?: { id: number; name: string; avatarUrl?: string }
  comments?: Comment[]
  attachments?: Attachment[]
  timeLogs?: TimeLog[]
  activities?: Activity[]
}

export interface Comment {
  id: number
  taskId: number
  authorId: number
  body: string
  isEdited: boolean
  createdAt: string
  updatedAt: string
  author?: { id: number; name: string; avatarUrl?: string }
}

export interface TimeLog {
  id: number
  taskId: number
  userId: number
  hours: number
  category: string
  description?: string
  logDate: string
  createdAt: string
  user?: { id: number; name: string }
  task?: { id: number; title: string }
}

export interface Attachment {
  id: number
  filename: string
  originalName: string
  mimeType: string
  sizeBytes: number
  storagePath: string
  uploaderId: number
  taskId?: number
  projectId?: number
  createdAt: string
  uploader?: { id: number; name: string }
}

export interface Activity {
  id: number
  entityType: string
  entityId: number
  action: string
  actorId: number
  oldValue?: string
  newValue?: string
  fieldName?: string
  description?: string
  createdAt: string
  actor?: { id: number; name: string; avatarUrl?: string }
}

export interface Notification {
  id: number
  recipientId: number
  triggeredBy?: number
  type: string
  title: string
  body: string
  taskId?: number
  isRead: boolean
  createdAt: string
  trigger?: { id: number; name: string; avatarUrl?: string }
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}
