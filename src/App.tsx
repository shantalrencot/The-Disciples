import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext, useAuthProvider } from './hooks/useAuth'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { missingEnvVars } from './lib/supabase'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminTracks from './pages/admin/Tracks'
import AdminTrackDetail from './pages/admin/TrackDetail'
import AdminCohorts from './pages/admin/Cohorts'
import AdminCohortDetail from './pages/admin/CohortDetail'
import AdminReports from './pages/admin/Reports'
import AdminStudents from './pages/admin/Students'

// Discipler pages
import DisciplerDashboard from './pages/discipler/Dashboard'
import DisciplerGroups from './pages/discipler/Groups'
import DisciplerSessions from './pages/discipler/Sessions'
import DisciplerAttendance from './pages/discipler/Attendance'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import StudentProgress from './pages/student/Progress'
import StudentSessions from './pages/student/Sessions'

// Shared
import Calendar from './pages/Calendar'

function RoleRedirect() {
  return <Navigate to="/login" replace />
}

export default function App() {
  if (missingEnvVars) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', fontFamily: 'sans-serif' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 40, maxWidth: 480, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ color: '#111827', marginBottom: 8 }}>Missing Configuration</h1>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Supabase environment variables are not set. Please add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your deployment environment variables.</p>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>In Vercel: Project Settings → Environment Variables</p>
        </div>
      </div>
    )
  }

  const auth = useAuthProvider()

  const homeRedirect = auth.profile
    ? auth.profile.role === 'admin' ? '/admin/dashboard'
    : auth.profile.role === 'discipler' ? '/discipler/dashboard'
    : '/student/dashboard'
    : '/login'

  return (
    <AuthContext.Provider value={auth}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to={homeRedirect} replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="tracks" element={<AdminTracks />} />
                  <Route path="tracks/:id" element={<AdminTrackDetail />} />
                  <Route path="cohorts" element={<AdminCohorts />} />
                  <Route path="cohorts/:id" element={<AdminCohortDetail />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="students" element={<AdminStudents />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Discipler routes */}
          <Route path="/discipler/*" element={
            <ProtectedRoute allowedRoles={['discipler']}>
              <AppLayout>
                <Routes>
                  <Route path="dashboard" element={<DisciplerDashboard />} />
                  <Route path="groups" element={<DisciplerGroups />} />
                  <Route path="sessions" element={<DisciplerSessions />} />
                  <Route path="attendance/:sessionId" element={<DisciplerAttendance />} />
                  <Route path="*" element={<Navigate to="/discipler/dashboard" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Student routes */}
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppLayout>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="progress" element={<StudentProgress />} />
                  <Route path="sessions" element={<StudentSessions />} />
                  <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Shared calendar */}
          <Route path="/calendar" element={
            <ProtectedRoute>
              <AppLayout>
                <Calendar />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<RoleRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
