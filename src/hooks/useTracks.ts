import { useState, useEffect, useCallback } from 'react'
import type { Track } from '../lib/types'
import { getTracks, getTrack } from '../services/trackService'

export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getTracks()
      setTracks(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load tracks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { tracks, loading, error, refresh: load }
}

export function useTrack(id: string) {
  const [track, setTrack] = useState<Track | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getTrack(id)
      setTrack(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load track')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  return { track, loading, error, refresh: load }
}
