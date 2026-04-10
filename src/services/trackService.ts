import { supabase } from '../lib/supabase'
import type { Track, Module } from '../lib/types'

export async function getTracks(): Promise<Track[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*, modules(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Track[]
}

export async function getTrack(id: string): Promise<Track> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*, modules(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  // Sort modules by order_index
  if (data.modules) {
    data.modules.sort((a: Module, b: Module) => a.order_index - b.order_index)
  }
  return data as Track
}

export async function createTrack(
  track: Omit<Track, 'id' | 'created_at' | 'updated_at'> & { created_by: string }
): Promise<Track> {
  const { data, error } = await supabase
    .from('tracks')
    .insert(track)
    .select()
    .single()
  if (error) throw error
  return data as Track
}

export async function updateTrack(id: string, updates: Partial<Track>): Promise<void> {
  const { error } = await supabase
    .from('tracks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteTrack(id: string): Promise<void> {
  const { error } = await supabase.from('tracks').delete().eq('id', id)
  if (error) throw error
}

export async function createModule(module: Omit<Module, 'id' | 'created_at'>): Promise<Module> {
  const { data, error } = await supabase
    .from('modules')
    .insert(module)
    .select()
    .single()
  if (error) throw error
  return data as Module
}

export async function updateModule(id: string, updates: Partial<Module>): Promise<void> {
  const { error } = await supabase.from('modules').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteModule(id: string): Promise<void> {
  const { error } = await supabase.from('modules').delete().eq('id', id)
  if (error) throw error
}

export async function reorderModules(_trackId: string, moduleIds: string[]): Promise<void> {
  const updates = moduleIds.map((id, index) => ({ id, order_index: index }))
  for (const u of updates) {
    await supabase.from('modules').update({ order_index: u.order_index }).eq('id', u.id)
  }
}
