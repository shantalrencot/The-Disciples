import { supabase } from '../lib/supabase'
import type { Attendance, Session, AttendanceRecord } from '../lib/types'

export async function getSessions(groupId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, module:modules(*)')
    .eq('group_id', groupId)
    .order('scheduled_date')
  if (error) throw error
  return data as Session[]
}

export async function getAllSessionsForDiscipler(disciplerId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      module:modules(*),
      group:groups!inner(*, cohort:cohorts(*, track:tracks(*)))
    `)
    .eq('groups.discipler_id', disciplerId)
    .order('scheduled_date')
  if (error) throw error
  return data as Session[]
}

export async function getSession(sessionId: string): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, module:modules(*), group:groups(*, cohort:cohorts(*))')
    .eq('id', sessionId)
    .single()
  if (error) throw error
  return data as Session
}

export async function createSession(session: Omit<Session, 'id' | 'created_at'>): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .insert(session)
    .select()
    .single()
  if (error) throw error
  return data as Session
}

export async function updateSession(id: string, updates: Partial<Session>): Promise<void> {
  const { error } = await supabase.from('sessions').update(updates).eq('id', id)
  if (error) throw error
}

export async function getAttendance(sessionId: string): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, student:profiles(*)')
    .eq('session_id', sessionId)
  if (error) throw error
  return data as Attendance[]
}

export async function saveAttendance(
  sessionId: string,
  records: AttendanceRecord[],
  markedBy: string
): Promise<void> {
  // Delete existing attendance for this session first
  await supabase.from('attendance').delete().eq('session_id', sessionId)

  if (records.length === 0) return

  const { error } = await supabase.from('attendance').insert(
    records.map(r => ({
      session_id: sessionId,
      student_id: r.student_id,
      status: r.status,
      notes: r.notes,
      marked_by: markedBy,
      marked_at: new Date().toISOString(),
    }))
  )
  if (error) throw error
}

export async function getStudentAttendance(studentId: string): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, session:sessions(*, group:groups(*))')
    .eq('student_id', studentId)
    .order('marked_at', { ascending: false })
  if (error) throw error
  return data as Attendance[]
}

export async function createBulkSessions(
  groupId: string,
  dates: string[],
  trackName: string
): Promise<void> {
  const sessions = dates.map((date, i) => ({
    group_id: groupId,
    title: `${trackName} - Session ${i + 1}`,
    scheduled_date: date,
    status: 'scheduled' as const,
  }))
  const { error } = await supabase.from('sessions').insert(sessions)
  if (error) throw error
}
