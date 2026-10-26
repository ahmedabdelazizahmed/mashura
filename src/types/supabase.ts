// Generated types mirror the tables in supabase/migrations/0001_init.sql.
// Regenerate later with:
//   npx supabase gen types typescript --project-id <your-project-ref> > src/types/supabase.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'client' | 'owner' | 'admin' | 'reception' | 'viewer'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'
export type PaymentMethod = 'card' | 'wallet' | 'cash'
export type Mode = 'video' | 'audio' | 'in-person'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'closed'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          name: string
          email: string
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      experts: {
        Row: {
          id: string
          name: string
          title: string
          bio: string | null
          years: number | null
          sessions: number
          rating: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          title: string
          bio?: string | null
          years?: number | null
          sessions?: number
          rating?: number
        }
        Update: Partial<Database['public']['Tables']['experts']['Insert']>
        Relationships: []
      }
      consultation_types: {
        Row: {
          id: string
          slug: string
          title: string
          category: string
          blurb: string | null
          modes: Mode[]
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          category: string
          blurb?: string | null
          modes: Mode[]
          is_active?: boolean
          sort_order?: number
        }
        Update: Partial<Database['public']['Tables']['consultation_types']['Insert']>
        Relationships: []
      }
      duration_options: {
        Row: {
          id: string
          type_id: string
          minutes: number
          prices: Partial<Record<Mode, number>>
          sort_order: number
        }
        Insert: {
          id?: string
          type_id: string
          minutes: number
          prices: Partial<Record<Mode, number>>
          sort_order?: number
        }
        Update: Partial<Database['public']['Tables']['duration_options']['Insert']>
        Relationships: []
      }
      availability_rules: {
        Row: {
          id: string
          expert_id: string | null
          weekday: number
          start_time: string
          end_time: string
          is_active: boolean
        }
        Insert: {
          id?: string
          expert_id?: string | null
          weekday: number
          start_time: string
          end_time: string
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['availability_rules']['Insert']>
        Relationships: []
      }
      availability_slots: {
        Row: {
          id: string
          expert_id: string | null
          starts_at: string
          duration_minutes: number
          is_blocked: boolean
          is_booked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          expert_id?: string | null
          starts_at: string
          duration_minutes?: number
          is_blocked?: boolean
          is_booked?: boolean
        }
        Update: Partial<Database['public']['Tables']['availability_slots']['Insert']>
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          ref: string
          client_id: string
          expert_id: string | null
          type_id: string
          duration_option_id: string | null
          mode: Mode
          starts_at: string
          minutes: number
          price_amount: number
          currency: string
          status: BookingStatus
          topic: string | null
          meeting_url: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ref?: string
          client_id: string
          expert_id?: string | null
          type_id: string
          duration_option_id?: string | null
          mode: Mode
          starts_at: string
          minutes: number
          price_amount: number
          currency?: string
          status?: BookingStatus
          topic?: string | null
          meeting_url?: string | null
          location?: string | null
        }
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          invoice_no: string
          booking_id: string
          amount: number
          currency: string
          method: PaymentMethod
          status: PaymentStatus
          provider: string | null
          provider_ref: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_no?: string
          booking_id: string
          amount: number
          currency?: string
          method: PaymentMethod
          status?: PaymentStatus
          provider?: string | null
          provider_ref?: string | null
          paid_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          type: string
          title: string
          message: string
          data: Json | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          read_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          source: string | null
          interest: string | null
          status: LeadStatus
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          source?: string | null
          interest?: string | null
          status?: LeadStatus
          note?: string | null
        }
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
        Relationships: []
      }
    }
    Views: {}
    Enums: {}
    CompositeTypes: {}
    Functions: {
      is_staff: { Args: Record<string, never>; Returns: boolean }
      is_admin: { Args: Record<string, never>; Returns: boolean }
    }
  }
}
