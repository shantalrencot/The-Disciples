import { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle, Archive } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useStudentEnrollment } from '../../hooks/useEnrollments'
import { getSessions } from '../../services/attendanceService'
import type { Session } from '../../lib/types'
import { formatDate, formatDateRelative, cn } from '../../lib/utils'

export default function StudentSessions() {
  const { profile } = useAuth()
  const { enrollment, loading: enrollLoading } = useStudentEnrollment(profile?.id ?? '')
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!enrollment) { setLoading(false); return }
    const groupId = (enrollment.group as { id?: string })?.id
    if (!groupId) { setLoading(false); return }
    getSessions(groupId).then(s => {
      setSessions(s)
      setLoading(false)
    })
  }, [enrollment])

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled')
  const completedSessions = sessions.filter(s => s.status === 'completed')
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled')

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return (
      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full capitalize', styles[status] ?? 'bg-gray-100 text-gray-700')}>
        {status}
      </span>
    )
  }

  if (enrollLoading || loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
        <p className="text-gray-500 text-sm">Scheduled and past sessions</p>
      </div>

      {!enrollment ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">You're not enrolled in any track yet.</p>
        </div>
      ) : (
        <>
          {upcomingSessions.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="bg-white rounded-2xl p-4 shadow-sm border border-l-4 border-primary-400">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{session.title}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(session.scheduled_date)} · {formatDateRelative(session.scheduled_date)}
                          </p>
                        </div>
                      </div>
                      {statusBadge(session.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedSessions.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Archive className="w-4 h-4 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Archived</h2>
                <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">Attendance Recorded</span>
              </div>
              <div className="space-y-2">
                {completedSessions.map(session => (
                  <div key={session.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-3 opacity-80">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600 truncate">{session.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(session.scheduled_date)}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Completed</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cancelledSessions.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Cancelled</h2>
              <div className="space-y-2">
                {cancelledSessions.map(session => (
                  <div key={session.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500 truncate">{session.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(session.scheduled_date)}</p>
                    </div>
                    {statusBadge(session.status)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingSessions.length === 0 && completedSessions.length === 0 && cancelledSessions.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No sessions scheduled yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
