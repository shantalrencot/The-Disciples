import { Link } from 'react-router-dom'
import { TrendingUp, Calendar, Users, BookOpen } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useStudentEnrollment } from '../../hooks/useEnrollments'
import { useStudentProgress } from '../../hooks/useAttendance'
import { AnnouncementsFeed } from '../../components/AnnouncementsFeed'

export default function StudentDashboard() {
  const { profile } = useAuth()
  const { enrollment, loading: enrollLoading } = useStudentEnrollment(profile?.id ?? '')
  const { completionRate, present, total, loading: progLoading } = useStudentProgress(profile?.id ?? '')

  const group = enrollment?.group as { name?: string; cohort?: { track?: { name?: string; description?: string; duration_weeks?: number }; name?: string } } | undefined
  const track = group?.cohort?.track

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Hi, {profile?.full_name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm">Your discipleship journey</p>
      </div>

      <AnnouncementsFeed />

      {enrollLoading ? (
        <div className="bg-white rounded-2xl h-32 animate-pulse mb-6" />
      ) : !enrollment ? (
        <div className="bg-blue-50 rounded-2xl p-6 mb-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-blue-900">Not yet enrolled</p>
            <p className="text-sm text-blue-700 mt-1">
              Contact your church admin to be enrolled in a discipleship track.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-5 mb-6 text-white">
          <p className="text-xs font-semibold text-primary-200 uppercase tracking-wide mb-1">Current Track</p>
          <h2 className="text-lg font-bold mb-1">{track?.name ?? 'Track'}</h2>
          <p className="text-sm text-primary-100 mb-4">{group?.name} · {group?.cohort?.name}</p>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Attendance</span>
              <span className="font-bold">{completionRate}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-primary-200 mt-1">{present} of {total} sessions attended</p>
          </div>
        </div>
      )}

      {/* Stats */}
      {!progLoading && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{completionRate}%</p>
                <p className="text-xs text-gray-500">Attendance Rate</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{total}</p>
                <p className="text-xs text-gray-500">Total Sessions</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/student/progress"
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">My Progress</p>
            <p className="text-xs text-gray-500">View full history</p>
          </div>
        </Link>
        <Link
          to="/student/sessions"
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <div className="w-9 h-9 bg-secondary-50 rounded-xl flex items-center justify-center">
            <Calendar className="w-4 h-4 text-secondary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Sessions</p>
            <p className="text-xs text-gray-500">Upcoming schedule</p>
          </div>
        </Link>
        <Link
          to="/calendar"
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
            <Users className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Calendar</p>
            <p className="text-xs text-gray-500">Monthly view</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
