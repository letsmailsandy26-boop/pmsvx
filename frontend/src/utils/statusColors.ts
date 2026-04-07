export const statusColors: Record<string, string> = {
  // Task status — badge-status style (border included via .badge-status class)
  New:                  'bg-gray-100 text-gray-600 border-gray-300',
  InProgress:           'bg-blue-50 text-blue-700 border-blue-300',
  ReviewPending:        'bg-purple-50 text-purple-700 border-purple-300',
  Testing:              'bg-amber-50 text-amber-700 border-amber-300',
  TestingDone:          'bg-orange-50 text-orange-700 border-orange-300',
  ReadyForProduction:   'bg-teal-50 text-teal-700 border-teal-300',
  Closed:               'bg-green-50 text-green-700 border-green-300',
  // Priority
  Low:                  'bg-gray-100 text-gray-500 border-gray-300',
  Medium:               'bg-blue-50 text-blue-600 border-blue-300',
  High:                 'bg-orange-50 text-orange-700 border-orange-300',
  Critical:             'bg-red-50 text-red-700 border-red-300',
  // Task type
  Task:                 'bg-blue-50 text-blue-700 border-blue-300',
  Bug:                  'bg-red-50 text-red-700 border-red-300',
  Feature:              'bg-purple-50 text-purple-700 border-purple-300',
  Milestone:            'bg-indigo-50 text-indigo-700 border-indigo-300',
  // Project status
  Planning:             'bg-gray-100 text-gray-600 border-gray-300',
  Active:               'bg-green-50 text-green-700 border-green-300',
  OnHold:               'bg-amber-50 text-amber-700 border-amber-300',
  Completed:            'bg-blue-50 text-blue-700 border-blue-300',
  Cancelled:            'bg-red-50 text-red-600 border-red-300',
  // Role
  Admin:                'bg-red-50 text-red-700 border-red-300',
  Manager:              'bg-purple-50 text-purple-700 border-purple-300',
  User:                 'bg-gray-100 text-gray-600 border-gray-300',
  // Log category
  Development:          'bg-blue-50 text-blue-700 border-blue-300',
  Testing2:             'bg-amber-50 text-amber-700 border-amber-300',
  Meeting:              'bg-yellow-50 text-yellow-700 border-yellow-300',
  Support:              'bg-orange-50 text-orange-700 border-orange-300',
}
