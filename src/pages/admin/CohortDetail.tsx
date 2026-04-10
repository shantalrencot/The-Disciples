import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, PlusCircle, Users, UserPlus, Trash2, UserCheck } from 'lucide-react'
import { getCohort, createGroup, enrollStudent, unenrollStudent } from '../../services/cohortService'
import { getUsersByRole } from '../../services/authService'
import type { Cohort, Profile } from '../../lib/types'
import { getInitials } from '../../lib/utils'

export default function AdminCohortDetail() {
  const { id } = useParams<{ id: string }>()
  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [disciplers, setDisciplers] = useState<Profile[]>([])
  const [students, setStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedDiscipler, setSelectedDiscipler] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!id) return
    const [c, d, s] = await Promise.all([
      getCohort(id),
      getUsersByRole('discipler'),
      getUsersByRole('student'),
    ])
    setCohort(c)
    setDisciplers(d)
    setStudents(s)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const handleCreateGroup = async () => {
    if (!cohort || !groupName) return
    setSaving(true)
    try {
      await createGroup({
        cohort_id: cohort.id,
        name: groupName,
        discipler_id: selectedDiscipler || null,
        max_students: 8,
      })
      setGroupName('')
      setSelectedDiscipler('')
      setShowGroupForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleEnroll = async (groupId: string, studentId: string) => {
    await enrollStudent(groupId, studentId)
    load()
  }

  const handleUnenroll = async (enrollmentId: string) => {
    await unenrollStudent(enrollmentId)
    load()
  }

  // Students not yet enrolled in this cohort
  const enrolledStudentIds = new Set(
    cohort?.groups?.flatMap(g => g.enrollments?.map(e => e.student_id) ?? []) ?? []
  )
  const availableStudents = students.filter(s => !enrolledStudentIds.has(s.id))

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
    </div>
  )

  if (!cohort) return <div>Cohort not found</div>

  return (
    <div>
      <Link to="/admin/cohorts" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back to Cohorts
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{cohort.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Track: {cohort.track?.name}</p>
        </div>
        <button
          onClick={() => setShowGroupForm(!showGroupForm)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Group
        </button>
      </div>

      {showGroupForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Create Group</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
              <input
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Group A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Discipler</label>
              <select
                value={selectedDiscipler}
                onChange={e => setSelectedDiscipler(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">No discipler (assign later)</option>
                {disciplers.map(d => (
                  <option key={d.id} value={d.id}>{d.full_name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateGroup}
                disabled={saving || !groupName}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Creating...' : 'Create Group'}
              </button>
              <button
                onClick={() => setShowGroupForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups */}
      {!cohort.groups || cohort.groups.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No groups yet. Add a group to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cohort.groups.map(group => (
            <div key={group.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-xs text-gray-500">
                    Discipler: {group.discipler?.full_name ?? 'Unassigned'} ·{' '}
                    {group.enrollments?.length ?? 0}/{group.max_students} students
                  </p>
                </div>
                <UserCheck className="w-5 h-5 text-gray-400" />
              </div>

              {/* Enrolled students */}
              <div className="space-y-2 mb-4">
                {group.enrollments?.map(enrollment => (
                  <div key={enrollment.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-700">
                          {enrollment.student ? getInitials(enrollment.student.full_name) : '?'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700">{enrollment.student?.full_name}</span>
                    </div>
                    <button
                      onClick={() => handleUnenroll(enrollment.id)}
                      className="p-1 text-red-400 hover:text-red-600 rounded min-h-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add student */}
              {(group.enrollments?.length ?? 0) < group.max_students && availableStudents.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    defaultValue=""
                    onChange={e => {
                      if (e.target.value) {
                        handleEnroll(group.id, e.target.value)
                        e.target.value = ''
                      }
                    }}
                  >
                    <option value="">+ Enroll a student...</option>
                    {availableStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                  </select>
                  <UserPlus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
