import { supabase } from '../lib/supabase'
import type { Cohort, Group, Enrollment } from '../lib/types'

export async function getCohorts(): Promise<Cohort[]> {
  const { data, error } = await supabase
    .from('cohorts')
    .select('*, track:tracks(*), groups(*, enrollments(count))')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Cohort[]
}

export async function getCohort(id: string): Promise<Cohort> {
  const { data, error } = await supabase
    .from('cohorts')
    .select(`
      *,
      track:tracks(*),
      groups(
        *,
        discipler:profiles!groups_discipler_id_fkey(*),
        enrollments(*, student:profiles(*))
      )
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Cohort
}

export async function createCohort(
  cohort: Omit<Cohort, 'id' | 'created_at' | 'updated_at'>
): Promise<Cohort> {
  const { data, error } = await supabase
    .from('cohorts')
    .insert(cohort)
    .select()
    .single()
  if (error) throw error
  return data as Cohort
}

export async function updateCohort(id: string, updates: Partial<Cohort>): Promise<void> {
  const { error } = await supabase
    .from('cohorts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteCohort(id: string): Promise<void> {
  const { error } = await supabase.from('cohorts').delete().eq('id', id)
  if (error) throw error
}

export async function createGroup(group: Omit<Group, 'id' | 'created_at'>): Promise<Group> {
  const { data, error } = await supabase
    .from('groups')
    .insert(group)
    .select()
    .single()
  if (error) throw error
  return data as Group
}

export async function updateGroup(id: string, updates: Partial<Group>): Promise<void> {
  const { error } = await supabase.from('groups').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteGroup(id: string): Promise<void> {
  const { error } = await supabase.from('groups').delete().eq('id', id)
  if (error) throw error
}

export async function enrollStudent(groupId: string, studentId: string): Promise<Enrollment> {
  const { data, error } = await supabase
    .from('enrollments')
    .insert({ group_id: groupId, student_id: studentId, status: 'active' })
    .select()
    .single()
  if (error) throw error
  return data as Enrollment
}

export async function unenrollStudent(enrollmentId: string): Promise<void> {
  const { error } = await supabase.from('enrollments').delete().eq('id', enrollmentId)
  if (error) throw error
}

export async function getGroupsByDiscipler(disciplerId: string): Promise<Group[]> {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      cohort:cohorts(*, track:tracks(*, modules(*))),
      enrollments(*, student:profiles(*))
    `)
    .eq('discipler_id', disciplerId)
  if (error) throw error
  return data as Group[]
}

export async function getStudentEnrollment(studentId: string): Promise<Enrollment | null> {
  const { data } = await supabase
    .from('enrollments')
    .select(`
      *,
      group:groups(*, cohort:cohorts(*, track:tracks(*)))
    `)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .maybeSingle()
  return data as Enrollment | null
}
