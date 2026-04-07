export const TASK_STATUS_LABELS: Record<string, string> = {
  New: 'New',
  InProgress: 'In Progress',
  ReviewPending: 'Review Pending',
  Testing: 'Testing',
  TestingDone: 'Testing Done',
  ReadyForProduction: 'Ready for Production',
  Closed: 'Closed',
}

export const TASK_STATUSES = Object.keys(TASK_STATUS_LABELS)
export const TASK_TYPES = ['Task', 'Bug', 'Feature']
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
export const ROLES = ['Admin', 'Manager', 'User']
export const LOG_CATEGORIES = ['Development', 'Testing', 'Meeting', 'Support']
export const PROJECT_STATUSES = ['Planning', 'Active', 'OnHold', 'Completed', 'Cancelled']
