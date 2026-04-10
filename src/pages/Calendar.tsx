import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, addMonths, subMonths
} from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Session } from '../lib/types'
import { cn } from '../lib/utils'

export default function Calendar() {
  const { profile } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  useEffect(() => {
    async function loadSessions() {
      if (!profile) return
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd')

      let query = supabase
        .from('sessions')
        .select('*, group:groups(*, cohort:cohorts(*))')
        .gte('scheduled_date', start)
        .lte('scheduled_date', end)

      // Filter by role
      if (profile.role === 'discipler') {
        const { data: groups } = await supabase
          .from('groups')
          .select('id')
          .eq('discipler_id', profile.id)
        const groupIds = groups?.map((g: { id: string }) => g.id) ?? []
        if (groupIds.length > 0) {
          query = query.in('group_id', groupIds)
        }
      } else if (profile.role === 'student') {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('group_id')
          .eq('student_id', profile.id)
          .single()
        if (enrollment) {
          query = query.eq('group_id', (enrollment as { group_id: string }).group_id)
        }
      }

      const { data } = await query.order('scheduled_date')
      setSessions((data ?? []) as Session[])
    }
    loadSessions()
  }, [currentMonth, profile])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const getSessionsForDay = (day: Date) =>
    sessions.filter(s => isSameDay(parseISO(s.scheduled_date), day))

  const selectedDaySessions = selectedDay ? getSessionsForDay(selectedDay) : []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 text-sm">Session schedule</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 min-h-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 min-h-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const daySessions = getSessionsForDay(day)
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(-1)) ? null : day)}
                className={cn(
                  'relative p-2 min-h-[60px] text-left border-b border-r border-gray-50 hover:bg-gray-50 transition-colors min-h-0',
                  !isSameMonth(day, currentMonth) && 'opacity-30',
                  isSelected && 'bg-primary-50',
                )}
              >
                <span className={cn(
                  'text-sm w-6 h-6 flex items-center justify-center rounded-full font-medium',
                  isToday(day) ? 'bg-primary-600 text-white' : 'text-gray-700'
                )}>
                  {format(day, 'd')}
                </span>
                {daySessions.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {daySessions.slice(0, 2).map(s => (
                      <div
                        key={s.id}
                        className={cn(
                          'text-xs px-1 rounded truncate',
                          s.status === 'completed' ? 'bg-green-100 text-green-700' :
                          s.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-primary-100 text-primary-700'
                        )}
                      >
                        {s.title}
                      </div>
                    ))}
                    {daySessions.length > 2 && (
                      <div className="text-xs text-gray-400 px-1">+{daySessions.length - 2}</div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">
            {format(selectedDay, 'EEEE, MMMM d')}
          </h3>
          {selectedDaySessions.length === 0 ? (
            <div className="text-center py-6">
              <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No sessions this day</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDaySessions.map(session => (
                <div key={session.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={cn(
                    'w-2 h-8 rounded-full flex-shrink-0',
                    session.status === 'completed' ? 'bg-green-500' :
                    session.status === 'cancelled' ? 'bg-red-500' : 'bg-primary-500'
                  )} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{session.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
