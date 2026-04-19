import { NavLink, useNavigate } from 'react-router-dom'
import {
  BookOpen, LayoutDashboard, Users, BookMarked,
  Calendar, BarChart2, LogOut, UserCheck, ClipboardList,
  GraduationCap, Menu, X, Megaphone,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { cn, getInitials } from '../../lib/utils'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const adminNav: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/tracks', label: 'Tracks', icon: <BookMarked className="w-5 h-5" /> },
  { to: '/admin/cohorts', label: 'Cohorts', icon: <Users className="w-5 h-5" /> },
  { to: '/admin/students', label: 'Students', icon: <GraduationCap className="w-5 h-5" /> },
  { to: '/admin/reports', label: 'Reports', icon: <BarChart2 className="w-5 h-5" /> },
  { to: '/admin/announcements', label: 'Announcements', icon: <Megaphone className="w-5 h-5" /> },
  { to: '/calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
]

const disciplerNav: NavItem[] = [
  { to: '/discipler/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/tracks', label: 'Tracks', icon: <BookMarked className="w-5 h-5" /> },
  { to: '/discipler/groups', label: 'My Groups', icon: <Users className="w-5 h-5" /> },
  { to: '/discipler/sessions', label: 'Sessions', icon: <ClipboardList className="w-5 h-5" /> },
  { to: '/calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
]

const studentNav: NavItem[] = [
  { to: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/student/progress', label: 'My Progress', icon: <UserCheck className="w-5 h-5" /> },
  { to: '/student/sessions', label: 'Sessions', icon: <ClipboardList className="w-5 h-5" /> },
  { to: '/student/track', label: 'My Track', icon: <BookMarked className="w-5 h-5" /> },
  { to: '/calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
]

export function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems =
    profile?.role === 'admin' ? adminNav :
    profile?.role === 'discipler' ? disciplerNav :
    studentNav

  const roleLabel =
    profile?.role === 'admin' ? 'Administrator' :
    profile?.role === 'discipler' ? 'Discipler' : 'Student'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const NavLinks = () => (
    <nav className="flex-1 py-4 overflow-y-auto">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg mx-2 mb-1',
              isActive
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 flex items-center px-4 h-14">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 min-h-0"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2 ml-3">
          <BookOpen className="w-5 h-5 text-primary-600" />
          <span className="font-bold text-gray-900">DiscipleTrack</span>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300',
        'md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-200">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">DiscipleTrack</span>
        </div>

        <NavLinks />

        {/* User info + sign out */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 text-xs font-bold">
                {profile ? getInitials(profile.full_name) : '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name}</p>
              <p className="text-xs text-gray-500">{roleLabel}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors min-h-0"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
