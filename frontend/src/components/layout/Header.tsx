import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { notificationsApi } from '../../api/notifications.api'

export function Header() {
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 30000,
  })

  return (
    <header style={{
      height: 36, background: '#1B3C6E',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      padding: '0 14px', flexShrink: 0,
    }}>
      <Link
        to="/notifications"
        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: 4, color: 'rgba(208,227,247,0.6)',
          textDecoration: 'none', transition: 'background 0.15s',
        }}
        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(208,227,247,0.6)' }}
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            width: 14, height: 14, borderRadius: '50%',
            background: '#EF4444', color: '#fff',
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    </header>
  )
}
