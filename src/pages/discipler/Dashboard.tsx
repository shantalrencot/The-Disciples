import { Link } from 'react-router-dom'
import { Users, ClipboardList, Calendar, CheckCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useDisciplerGroups } from '../../hooks/useEnrollments'
import { AnnouncementsFeed } from '../../components/AnnouncementsFeed'

export default function DisciplerDashboard() {
  const { profile } = useAuth()
  const { groups, loading } = useDisciplerGroups(profile?.id ?? '')

  const totalStudents = groups.reduce((sum, g) => sum + (g.enrollments?.length ?? 0), 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile?.full_name?.split(' ')[0]}</h1>
        <p className="text-gray-500 text-sm">Your discipleship groups overview</p>
      </div>

      <AnnouncementsFeed />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{groups.length}</p>
              <p className="text-xs text-gray-500">My Groups</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{totalStudents}</p>
              <p className="text-xs text-gray-500">Total Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Link
          to="/discipler/sessions"
          className="bg-primary-600 text-white rounded-2xl p-5 flex items-center gap-4 hover:bg-primary-700 transition-colors"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold">Mark Attendance</p>
            <p className="text-xs text-primary-200">For upcoming sessions</p>
          </div>
        </Link>
        <Link
          to="/calendar"
          className="bg-secondary-600 text-white rounded-2xl p-5 flex items-center gap-4 hover:bg-secondary-700 transition-colors"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold">View Calendar</p>
            <p className="text-xs text-secondary-200">All scheduled sessions</p>
          </div>
        </Link>
      </div>

      {/* My groups */}
      <h2 className="font-semibold text-gray-900 mb-3">My Groups</h2>
      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No groups assigned yet. Contact your admin.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(group => (
            <div key={group.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{group.name}</p>
                  <p className="text-xs text-gray-500">
                    {(group as { cohort?: { name?: string; track?: { name?: string } } }).cohort?.name} · {(group as { cohort?: { track?: { name?: string } } }).cohort?.track?.name}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {group.enrollments?.length ?? 0}/{group.max_students}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.enrollments?.slice(0, 4).map(e => (
                  <span key={e.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                    {e.student?.full_name}
                  </span>
                ))}
                {(group.enrollments?.length ?? 0) > 4 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                    +{(group.enrollments?.length ?? 0) - 4} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
