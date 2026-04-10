import { useState, useEffect, useCallback } from 'react'
import type { Group, Cohort } from '../lib/types'
import { getGroupsByDiscipler, getStudentEnrollment, getCohorts } from '../services/cohortService'
import type { Enrollment } from '../lib/types'

export function useDisciplerGroups(disciplerId: string) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!disciplerId) return
    try {
      setLoading(true)
      const data = await getGroupsByDiscipler(disciplerId)
      setGroups(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }, [disciplerId])

  useEffect(() => { load() }, [load])

  return { groups, loading, error, refresh: load }
}

export function useStudentEnrollment(studentId: string) {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return
    getStudentEnrollment(studentId)
      .then(setEnrollment)
      .finally(() => setLoading(false))
  }, [studentId])

  return { enrollment, loading }
}

export function useCohorts() {
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getCohorts()
      setCohorts(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load cohorts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { cohorts, loading, error, refresh: load }
}
