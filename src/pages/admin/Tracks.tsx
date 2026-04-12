import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, BookMarked, Trash2, ChevronRight, Clock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTracks } from '../../hooks/useTracks'
import { createTrack, deleteTrack } from '../../services/trackService'
import { useAuth } from '../../hooks/useAuth'
import { formatDate } from '../../lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  duration_weeks: z.number().min(1).max(52),
})
type FormData = z.infer<typeof schema>

export default function AdminTracks() {
  const { tracks, loading, refresh } = useTracks()
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { duration_weeks: 8 },
  })

  const onSubmit = async (data: FormData) => {
    if (!user) return
    setSaving(true)
    try {
      await createTrack({ ...data, created_by: user.id, description: data.description ?? null })
      reset()
      setShowForm(false)
      refresh()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this track and all its modules?')) return
    setDeletingId(id)
    try {
      await deleteTrack(id)
      refresh()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tracks</h1>
          <p className="text-gray-500 text-sm">Discipleship curriculum tracks</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Track
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Create New Track</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Track Name</label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Foundations of Faith"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-0"
                placeholder="Brief description of this track..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
              <input
                {...register('duration_weeks', { valueAsNumber: true })}
                type="number"
                min={1}
                max={52}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.duration_weeks && <p className="text-red-500 text-xs mt-1">{errors.duration_weeks.message}</p>}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Creating...' : 'Create Track'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tracks list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <BookMarked className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tracks yet. Create your first track!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map(track => (
            <div key={track.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookMarked className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{track.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {track.duration_weeks} weeks
                  </span>
                  <span className="text-xs text-gray-500">
                    {track.modules?.length ?? 0} modules
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(track.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(track.id)}
                  disabled={deletingId === track.id}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-0"
                  title="Delete track"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link
                  to={`/tracks/${track.id}`}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
