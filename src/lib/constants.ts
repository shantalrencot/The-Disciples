export const APP_NAME = 'DiscipleTrack'
export const MAX_GROUP_SIZE = 8
export const DEFAULT_SESSION_DURATION_HOURS = 1.5

export const ROLES = {
  ADMIN: 'admin',
  DISCIPLER: 'discipler',
  STUDENT: 'student',
} as const

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  EXCUSED: 'excused',
} as const

export const SESSION_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    TRACKS: '/admin/tracks',
    TRACK_DETAIL: '/admin/tracks/:id',
    COHORTS: '/admin/cohorts',
    COHORT_DETAIL: '/admin/cohorts/:id',
    REPORTS: '/admin/reports',
    STUDENTS: '/admin/students',
  },
  DISCIPLER: {
    DASHBOARD: '/discipler/dashboard',
    MY_GROUPS: '/discipler/groups',
    ATTENDANCE: '/discipler/attendance/:sessionId',
    SESSIONS: '/discipler/sessions',
  },
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    PROGRESS: '/student/progress',
    SESSIONS: '/student/sessions',
  },
  CALENDAR: '/calendar',
} as const
