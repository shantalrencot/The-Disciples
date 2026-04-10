import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, BookMarked, TrendingUp, PlusCircle, BarChart2, UserCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { DashboardStats } from '../../lib/types'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  color: string
  link?: string
}

function StatCard({ icon, label, value, color, link }: StatCardProps) {
  const content = (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 ${link ? 'hover:shadow-md transition-shadow' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
  return link ? <Link to={link}>{content}</Link> : <div>{content}</div>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCohorts: 0,
    totalGroups: 0,
    completionRate: 0,
    activeEnrollments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [studentsRes, cohortsRes, groupsRes, enrollRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
        supabase.from('cohorts').select('id', { count: 'exact' }),
        supabase.from('groups').select('id', { count: 'exact' }),
        supabase.from('enrollments').select('id', { count: 'exact' }).eq('status', 'active'),
      ])

      // Completion rate: attended / total sessions
      const attRes = await supabase.from('attendance').select('status')
      const all = attRes.data ?? []
      const present = all.filter((a: { status: string }) => a.status === 'present').length
      const rate = all.length > 0 ? Math.round((present / all.length) * 100) : 0

      setStats({
        totalStudents: studentsRes.count ?? 0,
        totalCohorts: cohortsRes.count ?? 0,
        totalGroups: groupsRes.count ?? 0,
        completionRate: rate,
        activeEnrollments: enrollRes.count ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Church discipleship overview</p>
        </div>
        <Link
          to="/admin/tracks"
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Track
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6 text-blue-600" />}
            label="Total Students"
            value={stats.totalStudents}
            color="bg-blue-50"
            link="/admin/students"
          />
          <StatCard
            icon={<BookMarked className="w-6 h-6 text-purple-600" />}
            label="Active Cohorts"
            value={stats.totalCohorts}
            color="bg-purple-50"
            link="/admin/cohorts"
          />
          <StatCard
            icon={<UserCheck className="w-6 h-6 text-green-600" />}
            label="Active Enrollments"
            value={stats.activeEnrollments}
            color="bg-green-50"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
            label="Attendance Rate"
            value={`${stats.completionRate}%`}
            color="bg-orange-50"
            link="/admin/reports"
          />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/tracks"
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
        >
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <BookMarked className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Manage Tracks</p>
            <p className="text-sm text-gray-500">Create and edit discipleship tracks</p>
          </div>
        </Link>

        <Link
          to="/admin/cohorts"
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
        >
          <div className="w-10 h-10 bg-secondary-50 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-secondary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Manage Cohorts</p>
            <p className="text-sm text-gray-500">Groups, disciplers & students</p>
          </div>
        </Link>

        <Link
          to="/admin/reports"
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
        >
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">View Reports</p>
            <p className="text-sm text-gray-500">Analytics & attendance trends</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
