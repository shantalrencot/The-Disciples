import { useState, useEffect } from 'react'
import { BookOpen, Video, Link as LinkIcon, BookMarked } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useStudentEnrollment } from '../../hooks/useEnrollments'
import { supabase } from '../../lib/supabase'

interface Module {
  id: string
  title: string
  description: string | null
  order_index: number
  content_url: string | null
  video_url: string | null
}

export default function StudentTrack() {
  const { profile } = useAuth()
  const { enrollment, loading: enrollLoading } = useStudentEnrollment(profile?.id ?? '')
  const [modules, setModules] = useState<Module[]>([])
  const [loadingModules, setLoadingModules] = useState(true)

  const group = enrollment?.group as { cohort?: { track?: { id?: string; name?: string; description?: string; duration_weeks?: number }; name?: string } } | undefined
  const track = group?.cohort?.track

  useEffect(() => {
    if (!track?.id) { setLoadingModules(false); return }
    supabase
      .from('modules')
      .select('*')
      .eq('track_id', track.id)
      .order('order_index')
      .then(({ data }) => {
        setModules((data ?? []) as Module[])
        setLoadingModules(false)
      })
  }, [track?.id])

  if (enrollLoading || loadingModules) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}
      </div>
    )
  }

  if (!enrollment || !track) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Track</h1>
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <BookMarked className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">You are not enrolled in a track yet.</p>
          <p className="text-sm text-gray-400 mt-1">Contact your admin to be enrolled.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{track.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{group?.cohort?.name} · {track.duration_weeks} weeks · {modules.length} modules</p>
        {track.description && <p className="text-sm text-gray-600 mt-2">{track.description}</p>}
      </div>

      {modules.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No modules added yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((mod, i) => (
            <div key={mod.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary-600">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{mod.title}</p>
                {mod.description && <p className="text-xs text-gray-500 mt-0.5">{mod.description}</p>}
                <div className="flex items-center gap-3 mt-2">
                  {mod.video_url && (
                    <a
                      href={mod.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <Video className="w-3 h-3" /> Watch Video
                    </a>
                  )}
                  {mod.content_url && (
                    <a
                      href={mod.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-purple-600 hover:underline"
                    >
                      <LinkIcon className="w-3 h-3" /> View Content
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
