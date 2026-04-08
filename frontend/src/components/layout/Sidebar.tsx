import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare,
  Clock, BarChart2, Users, Bell, ChevronDown, LogOut,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../utils/cn'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { projectsApi } from '../../api/projects.api'
import { Project } from '../../types'

// Blue sidebar palette — hardcoded so Tailwind config cache doesn't matter
const BG       = '#1B3C6E'   // dark navy blue
const BG_HOVER = '#163264'   // deeper navy on hover
const BG_ACTIVE= '#2563EB'   // bright blue for active item
const TEXT     = '#D0E3F7'   // light blue-white text
const MUTED    = 'rgba(208,227,247,0.45)'  // dimmed version
const BORDER   = 'rgba(255,255,255,0.08)'  // subtle divider

const mainNav = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Overview',           roles: ['Admin','Manager','User'] },
  { to: '/my-tasks',      icon: CheckSquare,     label: 'My Work Packages',   roles: ['Admin','Manager','User'] },
  { to: '/tasks',         icon: CheckSquare,     label: 'All Work Packages',  roles: ['Admin','Manager','User'] },
  { to: '/timelogs',      icon: Clock,           label: 'Time Logs',          roles: ['Admin','Manager','User'] },
  { to: '/reports',       icon: BarChart2,       label: 'Reports',            roles: ['Admin','Manager','User'] },
  { to: '/users',         icon: Users,           label: 'Users',              roles: ['Admin','Manager','User'] },
  { to: '/notifications', icon: Bell,            label: 'Notifications',      roles: ['Admin','Manager','User'] },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const [projectsOpen, setProjectsOpen] = useState(true)
  const filtered = mainNav.filter(item => user && item.roles.includes(user.role))

  const { data: projectsData } = useQuery({
    queryKey: ['projects', 'sidebar'],
    queryFn: () => projectsApi.list({ limit: 8 }),
    staleTime: 0,
  })

  return (
    <aside style={{
      width: 220, background: BG, display: 'flex', flexDirection: 'column',
      height: '100%', flexShrink: 0, userSelect: 'none',
    }}>

      {/* Logo */}
      <div style={{
        padding: '12px 14px', borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, background: '#2563EB', borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 800, lineHeight: 1 }}>P</span>
        </div>
        <div>
          <p style={{ color: '#fff', fontSize: 13, fontWeight: 700, margin: 0, lineHeight: 1 }}>Vibexio</p>
          <p style={{ color: MUTED, fontSize: 10, margin: '2px 0 0' }}>Project Management</p>
        </div>
      </div>

      {/* Projects */}
      <div style={{ padding: '10px 8px 4px' }}>
        <button
          onClick={() => setProjectsOpen(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer',
            color: MUTED, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          }}
        >
          <span>Projects</span>
          <ChevronDown size={12} style={{ transform: projectsOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
        </button>

        {projectsOpen && (
          <div style={{ marginTop: 2 }}>
            {projectsData?.data?.slice(0, 6).map((p: Project) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                style={{
                  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 8px', borderRadius: 4, color: TEXT, fontSize: 12,
                  overflow: 'hidden',
                }}
                onMouseOver={e => (e.currentTarget.style.background = BG_HOVER)}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              </Link>
            ))}
            <Link
              to="/projects"
              style={{ textDecoration: 'none', display: 'block', padding: '5px 8px', fontSize: 11, color: MUTED, borderRadius: 4 }}
              onMouseOver={e => (e.currentTarget.style.color = TEXT)}
              onMouseOut={e => (e.currentTarget.style.color = MUTED)}
            >
              + All projects
            </Link>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ margin: '4px 10px', borderTop: `1px solid ${BORDER}` }} />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '4px 8px', overflowY: 'auto' }}>
        <p style={{
          padding: '4px 8px 6px', fontSize: 9, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em', color: MUTED,
        }}>
          Navigation
        </p>
        {filtered.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '7px 10px', borderRadius: 4, marginBottom: 1,
                  background: isActive ? BG_ACTIVE : 'transparent',
                  color: isActive ? '#fff' : TEXT,
                  fontSize: 12, fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseOver={e => { if (!isActive) e.currentTarget.style.background = BG_HOVER }}
                onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={14} style={{ flexShrink: 0 }} />
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '8px' }}>
        <NavLink to="/profile" style={{ textDecoration: 'none' }}>
          {({ isActive }) => (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 4,
                background: isActive ? BG_ACTIVE : 'transparent',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseOver={e => { if (!isActive) e.currentTarget.style.background = BG_HOVER }}
              onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%', background: '#2563EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name}
                </p>
                <p style={{ fontSize: 10, color: MUTED, margin: 0 }}>{user?.role}</p>
              </div>
            </div>
          )}
        </NavLink>
        <button
          onClick={logout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', marginTop: 2, borderRadius: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            color: MUTED, fontSize: 11, transition: 'color 0.15s',
          }}
          onMouseOver={e => (e.currentTarget.style.color = '#FCA5A5')}
          onMouseOut={e => (e.currentTarget.style.color = MUTED)}
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
