import { useState, useEffect, useCallback } from 'react'
import { PlusCircle, Megaphone, Trash2, Pencil, Check, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCohorts } from '../../hooks/useEnrollments'
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
  type Announcement,
} from '../../services/announcementService'
import { formatDate } from '../../lib/utils'

export default function AdminAnnouncements() {
  const { profile } = useAuth()
  const { cohorts } = useCohorts()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  // Create form
  const [showCreate, setShowCreate] = useState(false)
  const [createTitle, setCreateTitle] = useState('')
  const [createContent, setCreateContent] = useState('')
  const [createCohortId, setCreateCohortId] = useState<string>('')
  const [creating, setCreating] = useState(false)

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editCohortId, setEditCohortId] = useState<string>('')
  const [editSaving, setEditSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await getAnnouncements()
      setAnnouncements(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setCreating(true)
    try {
      await createAnnouncement({
        title: createTitle,
        content: createContent,
        cohort_id: createCohortId || null,
        created_by: profile.id,
      })
      setCreateTitle('')
      setCreateContent('')
      setCreateCohortId('')
      setShowCreate(false)
      await load()
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    await deleteAnnouncement(id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  const startEdit = (a: Announcement) => {
    setEditingId(a.id)
    setEditTitle(a.title)
    setEditContent(a.content)
    setEditCohortId(a.cohort_id ?? '')
  }

  const saveEdit = async (id: string) => {
    setEditSaving(true)
    try {
      await updateAnnouncement(id, {
        title: editTitle,
        content: editContent,
        cohort_id: editCohortId || null,
      })
      setAnnouncements(prev =>
        prev.map(a =>
          a.id === id
            ? {
                ...a,
                title: editTitle,
                content: editContent,
                cohort_id: editCohortId || null,
                cohort: editCohortId
                  ? cohorts.find(c => c.id === editCohortId) ? { name: cohorts.find(c => c.id === editCohortId)!.name } : a.cohort
                  : null,
              }
            : a
        )
      )
      setEditingId(null)
    } finally {
      setEditSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 text-sm">Broadcast messages to the whole church or a specific cohort</p>
        </div>
        <button
          onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 space-y-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-500" />
            Create Announcement
          </h2>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
            <input
              required
              value={createTitle}
              onChange={e => setCreateTitle(e.target.value)}
              placeholder="Announcement title"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Content *</label>
            <textarea
              required
              value={createContent}
              onChange={e => setCreateContent(e.target.value)}
              placeholder="Announcement content..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cohort (optional)</label>
            <select
              value={createCohortId}
              onChange={e => setCreateCohortId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">All Church</option>
              {cohorts.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />{creating ? 'Posting...' : 'Post Announcement'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200"
            >
              <X className="w-4 h-4" />Cancel
            </button>
          </div>
        </form>
      )}

      {/* Announcements list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No announcements yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              {editingId === a.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cohort</label>
                    <select
                      value={editCohortId}
                      onChange={e => setEditCohortId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                      <option value="">All Church</option>
                      {cohorts.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(a.id)}
                      disabled={editSaving}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 disabled:opacity-50"
                    >
                      <Check className="w-3 h-3" />{editSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold"
                    >
                      <X className="w-3 h-3" />Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{a.title}</p>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        {a.cohort ? `For: ${a.cohort.name}` : 'All Church'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{a.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(a.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(a)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors min-h-0"
                      title="Edit announcement"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-0"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
