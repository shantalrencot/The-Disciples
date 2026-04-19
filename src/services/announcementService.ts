import { supabase } from '../lib/supabase'

export interface Announcement {
  id: string
  title: string
  content: string
  cohort_id: string | null
  created_by: string
  created_at: string
  updated_at: string
  cohort?: { name: string } | null
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*, cohort:cohorts(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Announcement[]
}

export async function createAnnouncement(data: {
  title: string
  content: string
  cohort_id: string | null
  created_by: string
}): Promise<void> {
  const { error } = await supabase.from('announcements').insert(data)
  if (error) throw error
}

export async function updateAnnouncement(
  id: string,
  updates: { title?: string; content?: string; cohort_id?: string | null }
): Promise<void> {
  const { error } = await supabase.from('announcements').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) throw error
}
