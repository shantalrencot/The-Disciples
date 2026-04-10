import { useState, useEffect, useCallback } from 'react'
import type { Session, Attendance } from '../lib/types'
import { getSessions, getAttendance, getStudentAttendance } from '../services/attendanceService'
import { calculateCompletionRate } from '../lib/utils'

export function useGroupSessions(groupId: string) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!groupId) return
    try {
      const data = await getSessions(groupId)
      setSessions(data)
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => { load() }, [load])

  return { sessions, loading, refresh: load }
}

export function useSessionAttendance(sessionId: string) {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!sessionId) return
    try {
      const data = await getAttendance(sessionId)
      setAttendance(data)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => { load() }, [load])

  return { attendance, loading, refresh: load }
}

export function useStudentProgress(studentId: string) {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return
    getStudentAttendance(studentId)
      .then(setAttendance)
      .finally(() => setLoading(false))
  }, [studentId])

  const total = attendance.length
  const present = attendance.filter(a => a.status === 'present').length
  const completionRate = calculateCompletionRate(present, total)

  return { attendance, loading, total, present, completionRate }
}
