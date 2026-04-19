import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, CheckCircle, Clock, XCircle, Trash2, Archive, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useDisciplerGroups } from '../../hooks/useEnrollments'
import { getSessions, createBulkSessions, updateSession, deleteSession } from '../../services/attendanceService'
import type { Session, Group } from '../../lib/types'
import { formatDate, cn, generateSessionDates } from '../../lib/utils'

export default function DisciplerSessions() {
  const { profile } = useAuth()
  const { groups, loading: groupsLoading } = useDisciplerGroups(profile?.id ?? '')
  const [sessions, setSessions] = useState<(Session & { group: Group })[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<string>('all')

  const loadSessions = async (groupList: Group[]) => {
    if (groupList.length === 0) { setLoading(false); return }
    Promise.all(
      groupList.map(async g => {
        const s = await getSessions(g.id)
        return s.map(session => ({ ...session, group: g }))
      })
    ).then(results => {
      const all = results.flat().sort(
        (a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
      )
      setSessions(all as (Session & { group: Group })[])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => {
    if (groupsLoading) return
    loadSessions(groups)
  }, [groups, groupsLoading])

  const handleGenerateSessions = async (group: Group) => {
    const cohortGroup = group as unknown as { cohort?: { track?: { name?: string; duration_weeks?: number; modules?: { id: string; order_index: number }[] }; start_date?: string } }
    if (!cohortGroup.cohort?.track) return
    const dates = generateSessionDates(
      cohortGroup.cohort.start_date ?? new Date().toISOString(),
      cohortGroup.cohort.track.duration_weeks ?? 8
    )
    // Sort modules by order_index, pass their IDs
    const modules = [...(cohortGroup.cohort?.track?.modules ?? [])].sort((a, b) => a.order_index - b.order_index)
    const moduleIds = modules.map(m => m.id)
    await createBulkSessions(group.id, dates, cohortGroup.cohort?.track?.name ?? 'Session', moduleIds)
    // Reload
    const s = await getSessions(group.id)
    setSessions(prev => [
      ...prev.filter(p => p.group_id !== group.id),
      ...s.map(session => ({ ...session, group })) as (Session & { group: Group })[]
    ])
  }

  const handleCancel = async (sessionId: string) => {
    await updateSession(sessionId, { status: 'cancelled' })
    setSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, status: 'cancelled' as const } : s)
    )
  }

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Delete this session permanently?')) return
    await deleteSession(sessionId)
    setSessions(prev => prev.filter(s => s.id !== sessionId))
  }

  const [showArchived, setShowArchived] = useState(false)

  const allFiltered = selectedGroup === 'all'
    ? sessions
    : sessions.filter(s => s.group_id === selectedGroup)

  const filtered = allFiltered.filter(s => s.status !== 'completed')
  const archived = allFiltered.filter(s => s.status === 'completed')

  const statusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (status === 'cancelled') return <XCircle className="w-4 h-4 text-red-500" />
    return <Clock className="w-4 h-4 text-blue-500" />
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <p className="text-gray-500 text-sm">All your scheduled sessions</p>
      </div>

      {/* Generate sessions for groups without any */}
      {groups.map(group => {
        const hasSession = sessions.some(s => s.group_id === group.id)
        if (hasSession) return null
        return (
          <div key={group.id} className="bg-blue-50 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">No sessions for "{group.name}"</p>
              <p className="text-xs text-blue-600">Generate weekly sessions automatically</p>
            </div>
            <button
              onClick={() => handleGenerateSessions(group)}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate
            </button>
          </div>
        )
      })}

      {/* Filter */}
      {groups.length > 1 && (
        <div className="mb-4">
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">All Groups</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No sessions found.</p>
        </div>
      ) : (
        <>
          {/* Active sessions */}
          <div className="space-y-3">
            {filtered.length === 0 && archived.length > 0 && (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">All sessions have been completed and archived.</p>
              </div>
            )}
            {filtered.map(session => (
              <div key={session.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  session.status === 'cancelled' ? 'bg-red-50' : 'bg-blue-50'
                )}>
                  {statusIcon(session.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{session.title}</p>
                  <p className="text-xs text-gray-500">{session.group?.name} · {formatDate(session.scheduled_date)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {session.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => handleCancel(session.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-0"
                        title="Cancel session"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/discipler/attendance/${session.id}`}
                        className="flex-shrink-0 text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Mark Attendance
                      </Link>
                    </>
                  )}
                  {session.status === 'cancelled' && (
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-0"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Archived (completed) sessions */}
          {archived.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowArchived(v => !v)}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 mb-3 transition-colors"
              >
                <Archive className="w-4 h-4" />
                {showArchived ? 'Hide' : 'Show'} Archived ({archived.length})
                {showArchived ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showArchived && (
                <div className="space-y-2">
                  {archived.map(session => (
                    <div key={session.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-4 opacity-75">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-600 truncate">{session.title}</p>
                        <p className="text-xs text-gray-400">{session.group?.name} · {formatDate(session.scheduled_date)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-1 rounded-lg">Attendance Recorded</span>
                        <Link
                          to={`/discipler/attendance/${session.id}`}
                          className="text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-lg hover:bg-white transition-colors"
                        >
                          View Record
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
