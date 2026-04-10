import { Link } from 'react-router-dom'
import { Users, ArrowRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useDisciplerGroups } from '../../hooks/useEnrollments'
import { getInitials } from '../../lib/utils'

export default function DisciplerGroups() {
  const { profile } = useAuth()
  const { groups, loading } = useDisciplerGroups(profile?.id ?? '')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Groups</h1>
        <p className="text-gray-500 text-sm">Students under your discipleship</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No groups assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(group => (
            <div key={group.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{group.name}</h3>
                  <p className="text-sm text-gray-500">
                    {(group as { cohort?: { name?: string; track?: { name?: string } } }).cohort?.track?.name} · {(group as { cohort?: { name?: string } }).cohort?.name}
                  </p>
                </div>
                <Link
                  to="/discipler/sessions"
                  className="flex items-center gap-1 text-sm text-primary-600 font-semibold hover:underline"
                >
                  Sessions <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  STUDENTS ({group.enrollments?.length ?? 0}/{group.max_students})
                </p>
                <div className="space-y-2">
                  {group.enrollments?.map(enrollment => (
                    <div key={enrollment.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary-700">
                          {enrollment.student ? getInitials(enrollment.student.full_name) : '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{enrollment.student?.full_name}</p>
                        <p className="text-xs text-gray-500">{enrollment.student?.email}</p>
                      </div>
                    </div>
                  ))}
                  {(!group.enrollments || group.enrollments.length === 0) && (
                    <p className="text-sm text-gray-400 text-center py-2">No students enrolled</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
