import { format, formatDistanceToNow, parseISO, addWeeks } from 'date-fns'
import type { AttendanceStatus } from './types'

export function formatDate(dateStr: string, fmt = 'MMM d, yyyy'): string {
  return format(parseISO(dateStr), fmt)
}

export function formatDateRelative(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy h:mm a')
}

export function calculateEndDate(startDate: string, durationWeeks: number): string {
  return addWeeks(parseISO(startDate), durationWeeks).toISOString()
}

export function getAttendanceColor(status: AttendanceStatus): string {
  switch (status) {
    case 'present': return 'text-green-600 bg-green-100'
    case 'absent': return 'text-red-600 bg-red-100'
    case 'excused': return 'text-yellow-600 bg-yellow-100'
  }
}

export function getAttendanceBadgeColor(status: AttendanceStatus): string {
  switch (status) {
    case 'present': return 'bg-green-500'
    case 'absent': return 'bg-red-500'
    case 'excused': return 'bg-yellow-500'
  }
}

export function calculateCompletionRate(attended: number, total: number): number {
  if (total === 0) return 0
  return Math.round((attended / total) * 100)
}

export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function generateSessionDates(startDate: string, durationWeeks: number): string[] {
  const dates: string[] = []
  let current = parseISO(startDate)
  for (let i = 0; i < durationWeeks; i++) {
    dates.push(addWeeks(current, i).toISOString())
  }
  return dates
}

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const rows = data.map(row =>
    headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
