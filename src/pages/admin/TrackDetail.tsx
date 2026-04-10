import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, PlusCircle, GripVertical, Trash2, BookOpen, Video, Link as LinkIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTrack } from '../../hooks/useTracks'
import { createModule, deleteModule } from '../../services/trackService'

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  video_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  content_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

export default function AdminTrackDetail() {
  const { id } = useParams<{ id: string }>()
  const { track, loading, refresh } = useTrack(id!)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (!track) return
    setSaving(true)
    try {
      await createModule({
        track_id: track.id,
        title: data.title,
        description: data.description ?? null,
        order_index: (track.modules?.length ?? 0),
        video_url: data.video_url || null,
        content_url: data.content_url || null,
      })
      reset()
      setShowForm(false)
      refresh()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (moduleId: string) => {
    if (!confirm('Delete this module?')) return
    await deleteModule(moduleId)
    refresh()
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-32 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  if (!track) return <div>Track not found</div>

  return (
    <div>
      <Link to="/admin/tracks" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back to Tracks
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{track.name}</h1>
          {track.description && <p className="text-gray-500 text-sm mt-1">{track.description}</p>}
          <p className="text-xs text-gray-400 mt-1">{track.duration_weeks} weeks · {track.modules?.length ?? 0} modules</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Module
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Add Module</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module Title</label>
              <input
                {...register('title')}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Introduction to Prayer"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                {...register('description')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-0"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (optional)</label>
                <input
                  {...register('video_url')}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://youtube.com/..."
                />
                {errors.video_url && <p className="text-red-500 text-xs mt-1">{errors.video_url.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content URL (optional)</label>
                <input
                  {...register('content_url')}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://docs.google.com/..."
                />
                {errors.content_url && <p className="text-red-500 text-xs mt-1">{errors.content_url.message}</p>}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Adding...' : 'Add Module'}
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

      {/* Modules list */}
      {!track.modules || track.modules.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No modules yet. Add your first module!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {track.modules.map((module, i) => (
            <div key={module.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <GripVertical className="w-4 h-4 text-gray-300 cursor-grab flex-shrink-0" />
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-gray-500">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{module.title}</p>
                {module.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{module.description}</p>}
                <div className="flex items-center gap-3 mt-1">
                  {module.video_url && (
                    <span className="flex items-center gap-1 text-xs text-blue-500">
                      <Video className="w-3 h-3" /> Video
                    </span>
                  )}
                  {module.content_url && (
                    <span className="flex items-center gap-1 text-xs text-purple-500">
                      <LinkIcon className="w-3 h-3" /> Content
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(module.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
