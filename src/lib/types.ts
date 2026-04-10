import type { UserRole, AttendanceStatus, SessionStatus } from './database.types'

export type { UserRole, AttendanceStatus, SessionStatus }

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Track {
  id: string
  name: string
  description: string | null
  duration_weeks: number
  created_by: string
  created_at: string
  updated_at: string
  modules?: Module[]
}

export interface Module {
  id: string
  track_id: string
  title: string
  description: string | null
  order_index: number
  content_url: string | null
  video_url: string | null
  created_at: string
}

export interface Cohort {
  id: string
  track_id: string
  name: string
  start_date: string
  end_date: string | null
  created_by: string
  created_at: string
  updated_at: string
  track?: Track
  groups?: Group[]
}

export interface Group {
  id: string
  cohort_id: string
  name: string
  discipler_id: string | null
  max_students: number
  created_at: string
  discipler?: Profile
  enrollments?: Enrollment[]
}

export interface Enrollment {
  id: string
  group_id: string
  student_id: string
  enrolled_at: string
  status: 'active' | 'completed' | 'dropped'
  student?: Profile
  group?: Group
}

export interface Session {
  id: string
  group_id: string
  module_id: string | null
  title: string
  scheduled_date: string
  status: SessionStatus
  notes: string | null
  created_at: string
  group?: Group
  module?: Module
}

export interface Attendance {
  id: string
  session_id: string
  student_id: string
  status: AttendanceStatus
  notes: string | null
  marked_by: string
  marked_at: string
  student?: Profile
  session?: Partial<Session>
}

export interface AttendanceRecord {
  student_id: string
  status: AttendanceStatus
  notes?: string
}

export interface DashboardStats {
  totalStudents: number
  totalCohorts: number
  totalGroups: number
  completionRate: number
  activeEnrollments: number
}

export interface ProgressData {
  totalSessions: number
  attendedSessions: number
  completionPercentage: number
  modulesCompleted: number
  totalModules: number
}
