import { useState, useEffect, useCallback } from 'react'
import { Megaphone, Trash2, Pencil, Check, X } from 'lucide-react'
import { getAnnouncements, deleteAnnouncement, updateAnnouncement, type Announcement } from '../services/announcementService'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../lib/utils'

export function AnnouncementsFeed() {
  const { profile } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await getAnnouncements()
      setAnnouncements(data.slice(0, 5))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    await deleteAnnouncement(id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  const startEdit = (a: Announcement) => {
    setEditingId(a.id)
    setEditTitle(a.title)
    setEditContent(a.content)
  }

  const saveEdit = async (id: string) => {
    setEditSaving(true)
    try {
      await updateAnnouncement(id, { title: editTitle, content: editContent })
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, title: editTitle, content: editContent } : a))
      setEditingId(null)
    } finally {
      setEditSaving(false)
    }
  }

  if (loading) return null
  if (announcements.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Megaphone className="w-4 h-4 text-amber-500" />
        <h2 className="font-semibold text-gray-900 text-sm">Announcements</h2>
      </div>
      <div className="space-y-3">
        {announcements.map(a => (
          <div key={a.id} className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            {editingId === a.id ? (
              <div className="space-y-2">
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-0"
                />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(a.id)} disabled={editSaving} className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 disabled:opacity-50">
                    <Check className="w-3 h-3" />{editSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                    <X className="w-3 h-3" />Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{a.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{a.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-amber-700 font-medium">{a.cohort ? `For: ${a.cohort.name}` : 'All Church'}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">{formatDate(a.created_at)}</span>
                  </div>
                </div>
                {profile?.role === 'admin' && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(a)} className="p-1 text-gray-400 hover:text-primary-600 rounded min-h-0">
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="p-1 text-gray-400 hover:text-red-600 rounded min-h-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
