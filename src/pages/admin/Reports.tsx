import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Download, TrendingUp, Users, UserCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { exportToCSV } from '../../lib/utils'


interface AttendanceData {
  name: string
  present: number
  absent: number
  excused: number
}

interface CohortCompletion {
  name: string
  rate: number
}

export default function AdminReports() {
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([])
  const [cohortData, setCohortData] = useState<CohortCompletion[]>([])
  const [pieData, setPieData] = useState([
    { name: 'Present', value: 0 },
    { name: 'Absent', value: 0 },
    { name: 'Excused', value: 0 },
  ])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ total: 0, present: 0, rate: 0 })

  useEffect(() => {
    async function load() {
      // Get attendance data grouped by month
      const { data: att } = await supabase
        .from('attendance')
        .select('status, marked_at')
        .order('marked_at')

      if (att) {
        // Group by month
        const byMonth: Record<string, { present: number; absent: number; excused: number }> = {}
        for (const a of att as { marked_at: string; status: string }[]) {
          const month = new Date(a.marked_at).toLocaleString('default', { month: 'short' })
          if (!byMonth[month]) byMonth[month] = { present: 0, absent: 0, excused: 0 }
          byMonth[month][a.status as 'present' | 'absent' | 'excused']++
        }
        setAttendanceData(
          Object.entries(byMonth).map(([name, v]) => ({ name, ...v }))
        )

        const typedAtt = att as { status: string }[]
        const present = typedAtt.filter(a => a.status === 'present').length
        const absent = typedAtt.filter(a => a.status === 'absent').length
        const excused = typedAtt.filter(a => a.status === 'excused').length
        const total = typedAtt.length
        setPieData([
          { name: 'Present', value: present },
          { name: 'Absent', value: absent },
          { name: 'Excused', value: excused },
        ])
        setSummary({ total, present, rate: total > 0 ? Math.round((present / total) * 100) : 0 })
      }

      // Get cohort completion rates
      const { data: cohorts } = await supabase
        .from('cohorts')
        .select('name, id')
        .limit(6)

      if (cohorts) {
        const rates = await Promise.all((cohorts as { id: string; name: string }[]).map(async (c) => {
          const { data: groups } = await supabase.from('groups').select('id').eq('cohort_id', c.id)
          const groupIds = groups?.map((g: { id: string }) => g.id) ?? []
          if (groupIds.length === 0) return { name: c.name, rate: 0 }
          const { data: sessions } = await supabase.from('sessions').select('id').in('group_id', groupIds)
          const sessionIds = sessions?.map((s: { id: string }) => s.id) ?? []
          if (sessionIds.length === 0) return { name: c.name, rate: 0 }
          const { data: att } = await supabase.from('attendance').select('status').in('session_id', sessionIds)
          const total = att?.length ?? 0
          const pres = att?.filter((a: { status: string }) => a.status === 'present').length ?? 0
          return { name: c.name, rate: total > 0 ? Math.round((pres / total) * 100) : 0 }
        }))
        setCohortData(rates)
      }

      setLoading(false)
    }
    load()
  }, [])

  const handleExport = async () => {
    const { data } = await supabase
      .from('attendance')
      .select('*, student:profiles(full_name, email), session:sessions(title, scheduled_date)')
    if (data) {
      exportToCSV(
        data.map((a: Record<string, unknown>) => ({
          student: (a.student as { full_name: string })?.full_name,
          email: (a.student as { email: string })?.email,
          session: (a.session as { title: string })?.title,
          date: (a.session as { scheduled_date: string })?.scheduled_date,
          status: a.status,
        })),
        'discipletrack-attendance.csv'
      )
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm">Attendance & completion analytics</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{summary.total}</p>
              <p className="text-xs text-gray-500">Total Records</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{summary.present}</p>
              <p className="text-xs text-gray-500">Present</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{summary.rate}%</p>
              <p className="text-xs text-gray-500">Attendance Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Attendance over time */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Attendance by Month</h2>
          {attendanceData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No attendance data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="present" fill="#22c55e" name="Present" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                <Bar dataKey="excused" fill="#eab308" name="Excused" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Attendance breakdown pie */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Attendance Breakdown</h2>
          {summary.total === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={false}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={['#22c55e', '#ef4444', '#eab308'][index]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Cohort completion */}
      {cohortData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Cohort Attendance Rate</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cohortData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={v => `${v}%`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
              <Tooltip formatter={(v) => [`${v}%`, 'Rate']} />
              <Bar dataKey="rate" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
