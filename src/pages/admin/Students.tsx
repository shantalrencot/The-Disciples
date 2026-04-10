import { useState, useEffect } from 'react'
import { GraduationCap, Search, Mail, Phone } from 'lucide-react'
import { updateUserRole, getAllUsers } from '../../services/authService'
import type { Profile, UserRole } from '../../lib/types'
import { getInitials } from '../../lib/utils'

export default function AdminStudents() {
  const [users, setUsers] = useState<Profile[]>([])
  const [filtered, setFiltered] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')

  async function load() {
    const allUsers = await getAllUsers()
    setUsers(allUsers)
    setFiltered(allUsers)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    let result = users
    if (search) {
      result = result.filter(u =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter)
    }
    setFiltered(result)
  }, [search, roleFilter, users])

  const handleRoleChange = async (userId: string, role: UserRole) => {
    await updateUserRole(userId, role)
    load()
  }

  const roleBadge = (role: UserRole) => {
    const styles = {
      admin: 'bg-red-100 text-red-700',
      discipler: 'bg-blue-100 text-blue-700',
      student: 'bg-green-100 text-green-700',
    }
    return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[role]}`}>
        {role}
      </span>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm">Manage all users and roles</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search by name or email..."
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as 'all' | UserRole)}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="discipler">Discipler</option>
          <option value="student">Student</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(user => (
            <div key={user.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-700">{getInitials(user.full_name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-900">{user.full_name}</p>
                  {roleBadge(user.role)}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Mail className="w-3 h-3" />{user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone className="w-3 h-3" />{user.phone}
                    </span>
                  )}
                </div>
              </div>
              <select
                value={user.role}
                onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-0"
              >
                <option value="student">Student</option>
                <option value="discipler">Discipler</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
