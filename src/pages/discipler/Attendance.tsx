import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Save } from 'lucide-react'
import { getSession } from '../../services/attendanceService'
import { saveAttendance } from '../../services/attendanceService'
import { useAuth } from '../../hooks/useAuth'
import type { Session, AttendanceRecord, AttendanceStatus } from '../../lib/types'
import type { Enrollment } from '../../lib/types'
import { getInitials, getAttendanceBadgeColor, formatDate } from '../../lib/utils'
import { supabase } from '../../lib/supabase'

export default function DisciplerAttendance() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    async function load() {
      const s = await getSession(sessionId!)
      setSession(s)

      // Load students in this group
      const { data: enr } = await supabase
        .from('enrollments')
        .select('*, student:profiles(*)')
        .eq('group_id', s.group_id)
        .eq('status', 'active')
      setEnrollments((enr ?? []) as Enrollment[])

      // Load existing attendance
      const { data: att } = await supabase
        .from('attendance')
        .select('*')
        .eq('session_id', sessionId!)
      const existing: Record<string, AttendanceStatus> = {}
      for (const a of (att ?? []) as { student_id: string; status: AttendanceStatus }[]) {
        existing[a.student_id] = a.status
      }
      setRecords(existing)
      setLoading(false)
    }
    load()
  }, [sessionId])

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev => ({ ...prev, [studentId]: status }))
  }

  const handleSave = async () => {
    if (!session || !user) return
    if (enrollments.length === 0) return
    setSaving(true)
    try {
      const attRecords: AttendanceRecord[] = enrollments.map(e => ({
        student_id: e.student_id,
        status: records[e.student_id] ?? 'absent',
      }))
      await saveAttendance(session.id, attRecords, user.id)
      // Mark session as completed
      await supabase.from('sessions').update({ status: 'completed' }).eq('id', session.id)
      setSaved(true)
      setTimeout(() => navigate('/discipler/sessions'), 1500)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/2" />
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-2xl" />)}
    </div>
  )

  if (!session) return <div>Session not found</div>

  const presentCount = enrollments.filter(e => records[e.student_id] === 'present').length

  return (
    <div>
      <Link to="/discipler/sessions" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back to Sessions
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{session.title}</h1>
        <p className="text-gray-500 text-sm">{formatDate(session.scheduled_date)}</p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Present</span>
          <span className="text-sm font-bold text-gray-900">{presentCount}/{enrollments.length}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: enrollments.length > 0 ? `${(presentCount / enrollments.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Student cards */}
      <div className="space-y-3 mb-6">
        {enrollments.map(enrollment => {
          const status = records[enrollment.student_id]
          return (
            <div key={enrollment.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center relative">
                  <span className="text-sm font-bold text-primary-700">
                    {enrollment.student ? getInitials(enrollment.student.full_name) : '?'}
                  </span>
                  {status && (
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getAttendanceBadgeColor(status)}`} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{enrollment.student?.full_name}</p>
                  <p className="text-xs text-gray-500">{enrollment.student?.email}</p>
                </div>
              </div>

              {/* Status buttons — large touch targets */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setStatus(enrollment.student_id, 'present')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    status === 'present'
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Present
                </button>
                <button
                  onClick={() => setStatus(enrollment.student_id, 'absent')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    status === 'absent'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Absent
                </button>
                <button
                  onClick={() => setStatus(enrollment.student_id, 'excused')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    status === 'excused'
                      ? 'bg-yellow-500 text-white shadow-sm'
                      : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  Excused
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || saved}
        className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
          saved
            ? 'bg-green-500 text-white'
            : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50'
        }`}
      >
        {saved ? (
          <><CheckCircle className="w-5 h-5" /> Saved! Redirecting...</>
        ) : saving ? (
          'Saving...'
        ) : (
          <><Save className="w-5 h-5" /> Save Attendance</>
        )}
      </button>
    </div>
  )
}
