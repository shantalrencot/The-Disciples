export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'discipler' | 'student'
export type AttendanceStatus = 'present' | 'absent' | 'excused'
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: UserRole
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: UserRole
          phone?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      tracks: {
        Row: {
          id: string
          name: string
          description: string | null
          duration_weeks: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          duration_weeks: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          duration_weeks?: number
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          track_id: string
          title: string
          description: string | null
          order_index: number
          content_url: string | null
          video_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          track_id: string
          title: string
          description?: string | null
          order_index: number
          content_url?: string | null
          video_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          track_id?: string
          title?: string
          description?: string | null
          order_index?: number
          content_url?: string | null
          video_url?: string | null
        }
      }
      cohorts: {
        Row: {
          id: string
          track_id: string
          name: string
          start_date: string
          end_date: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          track_id: string
          name: string
          start_date: string
          end_date?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          track_id?: string
          name?: string
          start_date?: string
          end_date?: string | null
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          cohort_id: string
          name: string
          discipler_id: string | null
          max_students: number
          created_at: string
        }
        Insert: {
          id?: string
          cohort_id: string
          name: string
          discipler_id?: string | null
          max_students?: number
          created_at?: string
        }
        Update: {
          id?: string
          cohort_id?: string
          name?: string
          discipler_id?: string | null
          max_students?: number
        }
      }
      enrollments: {
        Row: {
          id: string
          group_id: string
          student_id: string
          enrolled_at: string
          status: 'active' | 'completed' | 'dropped'
        }
        Insert: {
          id?: string
          group_id: string
          student_id: string
          enrolled_at?: string
          status?: 'active' | 'completed' | 'dropped'
        }
        Update: {
          id?: string
          group_id?: string
          student_id?: string
          status?: 'active' | 'completed' | 'dropped'
        }
      }
      sessions: {
        Row: {
          id: string
          group_id: string
          module_id: string | null
          title: string
          scheduled_date: string
          status: SessionStatus
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          module_id?: string | null
          title: string
          scheduled_date: string
          status?: SessionStatus
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          module_id?: string | null
          title?: string
          scheduled_date?: string
          status?: SessionStatus
          notes?: string | null
        }
      }
      attendance: {
        Row: {
          id: string
          session_id: string
          student_id: string
          status: AttendanceStatus
          notes: string | null
          marked_by: string
          marked_at: string
        }
        Insert: {
          id?: string
          session_id: string
          student_id: string
          status: AttendanceStatus
          notes?: string | null
          marked_by: string
          marked_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          student_id?: string
          status?: AttendanceStatus
          notes?: string | null
          marked_by?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
