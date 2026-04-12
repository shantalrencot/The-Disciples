import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, PlusCircle, Trash2, BookOpen, Video, Link as LinkIcon, Pencil, Check, X, ChevronUp, ChevronDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTrack } from '../../hooks/useTracks'
import { createModule, deleteModule, updateModule, reorderModules } from '../../services/trackService'

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  video_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  content_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

interface ModuleEditState {
  title: string
  description: string
  content_url: string
}

export default function AdminTrackDetail() {
  const { id } = useParams<{ id: string }>()
  const { track, loading, refresh } = useTrack(id!)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [moduleEditState, setModuleEditState] = useState<ModuleEditState>({ title: '', description: '', content_url: '' })
  const [moduleEditSaving, setModuleEditSaving] = useState(false)

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

  const startEditModule = (module: { id: string; title: string; description: string | null; content_url: string | null }) => {
    setEditingModuleId(module.id)
    setModuleEditState({
      title: module.title,
      description: module.description ?? '',
      content_url: module.content_url ?? '',
    })
  }

  const cancelEditModule = () => {
    setEditingModuleId(null)
  }

  const saveEditModule = async (moduleId: string) => {
    setModuleEditSaving(true)
    try {
      await updateModule(moduleId, {
        title: moduleEditState.title,
        description: moduleEditState.description || null,
        content_url: moduleEditState.content_url || null,
      })
      setEditingModuleId(null)
      refresh()
    } finally {
      setModuleEditSaving(false)
    }
  }

  const handleMoveUp = async (index: number) => {
    if (!track?.modules || index === 0) return
    const modules = [...track.modules].sort((a, b) => a.order_index - b.order_index)
    const newOrder = modules.map(m => m.id)
    // Swap with previous
    const tmp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = tmp
    await reorderModules(track.id, newOrder)
    refresh()
  }

  const handleMoveDown = async (index: number) => {
    if (!track?.modules || index >= track.modules.length - 1) return
    const modules = [...track.modules].sort((a, b) => a.order_index - b.order_index)
    const newOrder = modules.map(m => m.id)
    // Swap with next
    const tmp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = tmp
    await reorderModules(track.id, newOrder)
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

  const sortedModules = [...(track.modules ?? [])].sort((a, b) => a.order_index - b.order_index)

  return (
    <div>
      <Link to="/tracks" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 text-sm">
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
      {sortedModules.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No modules yet. Add your first module!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedModules.map((module, i) => (
            <div key={module.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-4">
              {/* Up/Down reorder buttons */}
              <div className="flex flex-col gap-0.5 flex-shrink-0 pt-1">
                <button
                  onClick={() => handleMoveUp(i)}
                  disabled={i === 0}
                  className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed rounded transition-colors min-h-0"
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMoveDown(i)}
                  disabled={i === sortedModules.length - 1}
                  className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed rounded transition-colors min-h-0"
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-gray-500">{i + 1}</span>
              </div>

              <div className="flex-1 min-w-0">
                {editingModuleId === module.id ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                      <input
                        value={moduleEditState.title}
                        onChange={e => setModuleEditState(s => ({ ...s, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                      <textarea
                        value={moduleEditState.description}
                        onChange={e => setModuleEditState(s => ({ ...s, description: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Content URL</label>
                      <input
                        type="url"
                        value={moduleEditState.content_url}
                        onChange={e => setModuleEditState(s => ({ ...s, content_url: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEditModule(module.id)}
                        disabled={moduleEditSaving}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        {moduleEditSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEditModule}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {editingModuleId !== module.id && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEditModule(module)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors min-h-0"
                    title="Edit module"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(module.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
