import { CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useStudentProgress } from '../../hooks/useAttendance'
import { formatDate, getAttendanceColor, cn } from '../../lib/utils'

export default function StudentProgress() {
  const { profile } = useAuth()
  const { attendance, loading, completionRate, present, total } = useStudentProgress(profile?.id ?? '')

  const statusIcon = (status: string) => {
    if (status === 'present') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (status === 'absent') return <XCircle className="w-4 h-4 text-red-500" />
    return <AlertCircle className="w-4 h-4 text-yellow-500" />
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Progress</h1>
        <p className="text-gray-500 text-sm">Track your discipleship journey</p>
      </div>

      {/* Progress summary */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-5 mb-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-3xl font-bold">{completionRate}%</p>
            <p className="text-primary-100 text-sm">Attendance Rate</p>
          </div>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-primary-200">{present} attended · {total - present} missed</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{attendance.filter(a => a.status === 'present').length}</p>
          <p className="text-xs text-green-700">Present</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{attendance.filter(a => a.status === 'absent').length}</p>
          <p className="text-xs text-red-700">Absent</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{attendance.filter(a => a.status === 'excused').length}</p>
          <p className="text-xs text-yellow-700">Excused</p>
        </div>
      </div>

      {/* Attendance history */}
      <h2 className="font-semibold text-gray-900 mb-3">Attendance History</h2>
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-xl h-14 animate-pulse" />)}
        </div>
      ) : attendance.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">No attendance records yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attendance.map(record => {
            const session = record.session as { title?: string; scheduled_date?: string } | undefined
            return (
              <div key={record.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                {statusIcon(record.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session?.title ?? 'Session'}
                  </p>
                  {session?.scheduled_date && (
                    <p className="text-xs text-gray-500">{formatDate(session.scheduled_date)}</p>
                  )}
                </div>
                <span className={cn('text-xs font-semibold px-2 py-1 rounded-lg capitalize', getAttendanceColor(record.status))}>
                  {record.status}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
