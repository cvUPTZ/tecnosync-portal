export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          recorded_by: string | null
          session_date: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          recorded_by?: string | null
          session_date?: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          recorded_by?: string | null
          session_date?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          additional_notes: string | null
          address: string
          application_date: string
          created_at: string
          date_of_birth: string
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          full_name: string
          how_did_you_hear: string | null
          id: string
          medical_conditions: string | null
          nationality: string
          parent_email: string | null
          parent_id_number: string | null
          parent_name: string | null
          parent_phone: string | null
          parent_profession: string | null
          phone: string
          position: string | null
          preferred_foot: string | null
          previous_experience: string | null
          program_preference: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          address: string
          application_date?: string
          created_at?: string
          date_of_birth: string
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          full_name: string
          how_did_you_hear?: string | null
          id?: string
          medical_conditions?: string | null
          nationality: string
          parent_email?: string | null
          parent_id_number?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_profession?: string | null
          phone: string
          position?: string | null
          preferred_foot?: string | null
          previous_experience?: string | null
          program_preference?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          address?: string
          application_date?: string
          created_at?: string
          date_of_birth?: string
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          full_name?: string
          how_did_you_hear?: string | null
          id?: string
          medical_conditions?: string | null
          nationality?: string
          parent_email?: string | null
          parent_id_number?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_profession?: string | null
          phone?: string
          position?: string | null
          preferred_foot?: string | null
          previous_experience?: string | null
          program_preference?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_enrollments: {
        Row: {
          created_at: string
          end_date: string | null
          enrollment_date: string
          group_id: string | null
          id: string
          is_active: boolean | null
          student_id: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          enrollment_date: string
          group_id?: string | null
          id?: string
          is_active?: boolean | null
          student_id?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          enrollment_date?: string
          group_id?: string | null
          id?: string
          is_active?: boolean | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "student_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          max_age: number
          max_capacity: number | null
          min_age: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_age: number
          max_capacity?: number | null
          min_age: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_age?: number
          max_capacity?: number | null
          min_age?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          academic_performance: string | null
          achievements: string | null
          address: string
          allergies: string | null
          blood_type: string | null
          created_at: string
          date_of_birth: string
          doctor_name: string | null
          doctor_phone: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          enrollment_date: string
          full_name: string
          gender: string | null
          group_id: string | null
          id: string
          medical_conditions: string | null
          monthly_fee: number | null
          nationality: string
          notes: string | null
          parent_email: string | null
          parent_id_number: string | null
          parent_name: string | null
          parent_phone: string | null
          parent_profession: string | null
          payment_status: string | null
          phone: string | null
          photo_url: string | null
          position: string | null
          preferred_foot: string | null
          previous_experience: string | null
          registration_id: string | null
          school_grade: string | null
          school_name: string | null
          shirt_number: number | null
          status: string | null
          student_code: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          academic_performance?: string | null
          achievements?: string | null
          address: string
          allergies?: string | null
          blood_type?: string | null
          created_at?: string
          date_of_birth: string
          doctor_name?: string | null
          doctor_phone?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          enrollment_date?: string
          full_name: string
          gender?: string | null
          group_id?: string | null
          id?: string
          medical_conditions?: string | null
          monthly_fee?: number | null
          nationality: string
          notes?: string | null
          parent_email?: string | null
          parent_id_number?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_profession?: string | null
          payment_status?: string | null
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          preferred_foot?: string | null
          previous_experience?: string | null
          registration_id?: string | null
          school_grade?: string | null
          school_name?: string | null
          shirt_number?: number | null
          status?: string | null
          student_code: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          academic_performance?: string | null
          achievements?: string | null
          address?: string
          allergies?: string | null
          blood_type?: string | null
          created_at?: string
          date_of_birth?: string
          doctor_name?: string | null
          doctor_phone?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          enrollment_date?: string
          full_name?: string
          gender?: string | null
          group_id?: string | null
          id?: string
          medical_conditions?: string | null
          monthly_fee?: number | null
          nationality?: string
          notes?: string | null
          parent_email?: string | null
          parent_id_number?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_profession?: string | null
          payment_status?: string | null
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          preferred_foot?: string | null
          previous_experience?: string | null
          registration_id?: string | null
          school_grade?: string | null
          school_name?: string | null
          shirt_number?: number | null
          status?: string | null
          student_code?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "student_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          coach_id: string | null
          created_at: string
          description: string | null
          end_time: string
          group_id: string | null
          id: string
          is_active: boolean
          location: string | null
          session_date: string
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          coach_id?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          group_id?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          session_date: string
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          coach_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          group_id?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          session_date?: string
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "student_groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_student_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "director" | "comptabilite_chief" | "coach" | "parent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["director", "comptabilite_chief", "coach", "parent"],
    },
  },
} as const
