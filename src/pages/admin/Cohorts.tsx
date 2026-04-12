import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Users, Calendar, ChevronRight, Trash2, Pencil, Check, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCohorts } from '../../hooks/useEnrollments'
import { useTracks } from '../../hooks/useTracks'
import { createCohort, deleteCohort, updateCohort } from '../../services/cohortService'
import { useAuth } from '../../hooks/useAuth'
import { formatDate, calculateEndDate } from '../../lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  track_id: z.string().min(1, 'Select a track'),
  start_date: z.string().min(1, 'Start date required'),
})
type FormData = z.infer<typeof schema>

interface EditState {
  name: string
  start_date: string
}

export default function AdminCohorts() {
  const { cohorts, loading, refresh } = useCohorts()
  const { tracks } = useTracks()
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ name: '', start_date: '' })
  const [editSaving, setEditSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (!user) return
    setSaving(true)
    try {
      await createCohort({ ...data, end_date: null, created_by: user.id })
      reset()
      setShowForm(false)
      refresh()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cohort and all its groups?')) return
    await deleteCohort(id)
    refresh()
  }

  const startEdit = (cohort: { id: string; name: string; start_date: string }) => {
    setEditingId(cohort.id)
    setEditState({
      name: cohort.name,
      start_date: cohort.start_date.slice(0, 10),
    })
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = async (id: string) => {
    setEditSaving(true)
    try {
      await updateCohort(id, { name: editState.name, start_date: editState.start_date })
      setEditingId(null)
      refresh()
    } finally {
      setEditSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cohorts</h1>
          <p className="text-gray-500 text-sm">Manage discipleship cohorts and groups</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Cohort
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Create New Cohort</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cohort Name</label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Spring 2024 Cohort"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Track</label>
              <select
                {...register('track_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">Select a track...</option>
                {tracks.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {errors.track_id && <p className="text-red-500 text-xs mt-1">{errors.track_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                {...register('start_date')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Creating...' : 'Create Cohort'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}
        </div>
      ) : cohorts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No cohorts yet. Create your first cohort!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cohorts.map(cohort => {
            const endDate = calculateEndDate(cohort.start_date, cohort.track?.duration_weeks ?? 8)
            return (
              <div key={cohort.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                {editingId === cohort.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                      <input
                        value={editState.name}
                        onChange={e => setEditState(s => ({ ...s, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={editState.start_date}
                        onChange={e => setEditState(s => ({ ...s, start_date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(cohort.id)}
                        disabled={editSaving}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        {editSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{cohort.name}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500">{cohort.track?.name}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(cohort.start_date)}
                        </span>
                        <span className="text-xs text-gray-400">
                          Ends: {formatDate(endDate)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {cohort.groups?.length ?? 0} groups
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(cohort)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors min-h-0"
                        title="Edit cohort"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cohort.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/admin/cohorts/${cohort.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
