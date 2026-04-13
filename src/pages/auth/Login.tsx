import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BookOpen, Mail, Lock, AlertCircle, GraduationCap, Users, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import type { UserRole } from '../../lib/types'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

const ROLES: { value: UserRole; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'student',
    label: 'Student',
    icon: <GraduationCap className="w-5 h-5" />,
    description: 'View progress & sessions',
  },
  {
    value: 'discipler',
    label: 'Discipler',
    icon: <Users className="w-5 h-5" />,
    description: 'Manage groups & sessions',
  },
  {
    value: 'admin',
    label: 'Admin',
    icon: <ShieldCheck className="w-5 h-5" />,
    description: 'Full system access',
  },
]

const ROLE_REDIRECTS: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  discipler: '/discipler/dashboard',
  student: '/student/dashboard',
}

export default function Login() {
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setServerError('')
    const { error, profile: signedInProfile } = await signIn(data.email, data.password)
    if (error) {
      setServerError(error)
      setIsLoading(false)
      return
    }
    // Validate that the account role matches what was selected
    if (signedInProfile && signedInProfile.role !== selectedRole) {
      const roleLabels: Record<UserRole, string> = { admin: 'Admin', discipler: 'Discipler', student: 'Student' }
      setServerError(`This account is registered as a ${roleLabels[signedInProfile.role]}, not a ${roleLabels[selectedRole]}.`)
      setIsLoading(false)
      return
    }
    setIsLoading(false)
  }

  // If already logged in, redirect to correct dashboard
  if (profile) {
    navigate(ROLE_REDIRECTS[profile.role], { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">DiscipleTrack</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Role selector */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">I am signing in as a...</p>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(role => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => { setSelectedRole(role.value); setServerError('') }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all ${
                    selectedRole === role.value
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {role.icon}
                  <span className="text-xs font-semibold">{role.label}</span>
                  <span className="text-xs leading-tight hidden sm:block">{role.description}</span>
                </button>
              ))}
            </div>
          </div>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isLoading ? 'Signing in...' : `Sign In as ${ROLES.find(r => r.value === selectedRole)?.label}`}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
