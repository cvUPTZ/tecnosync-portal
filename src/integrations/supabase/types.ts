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
      academies: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          modules: Json
          name: string
          settings: Json | null
          subdomain: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          modules?: Json
          name: string
          settings?: Json | null
          subdomain: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          modules?: Json
          name?: string
          settings?: Json | null
          subdomain?: string
          updated_at?: string | null
        }
        Relationships: []
      }
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
      document_access_log: {
        Row: {
          action: string
          created_at: string
          document_id: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          document_id: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          document_id?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_access_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          group_id: string | null
          id: string
          is_active: boolean
          student_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
          uploaded_by: string | null
          visibility: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          group_id?: string | null
          id?: string
          is_active?: boolean
          student_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          visibility?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          group_id?: string | null
          id?: string
          is_active?: boolean
          student_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "student_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structure: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          fee_type: string
          group_id: string | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          fee_type?: string
          group_id?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          fee_type?: string
          group_id?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_structure_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "student_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_receipts: {
        Row: {
          created_at: string
          id: string
          issued_by: string | null
          issued_date: string
          payment_id: string
          receipt_data: Json | null
          receipt_number: string
        }
        Insert: {
          created_at?: string
          id?: string
          issued_by?: string | null
          issued_date?: string
          payment_id: string
          receipt_data?: Json | null
          receipt_number: string
        }
        Update: {
          created_at?: string
          id?: string
          issued_by?: string | null
          issued_date?: string
          payment_id?: string
          receipt_data?: Json | null
          receipt_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_type: string
          recorded_by: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_type?: string
          recorded_by?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_type?: string
          recorded_by?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          academy_id: string | null
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
          academy_id?: string | null
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
          academy_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "profiles_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      public_pages: {
        Row: {
          academy_id: string
          content: Json
          created_at: string
          id: string
          is_published: boolean
          meta_description: string | null
          meta_keywords: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          content?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_keywords?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          content?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_keywords?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_pages_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
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
      team_members: {
        Row: {
          academy_id: string
          bio: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string | null
          is_published: boolean
          name: string
          position: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          bio?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          name: string
          position: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          bio?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          name?: string
          position?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
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
      website_settings: {
        Row: {
          academy_id: string
          address: string | null
          analytics_code: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          custom_css: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          primary_color: string
          seo_settings: Json | null
          social_media: Json | null
          template: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          address?: string | null
          analytics_code?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          custom_css?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string
          seo_settings?: Json | null
          social_media?: Json | null
          template?: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          address?: string | null
          analytics_code?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          custom_css?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string
          seo_settings?: Json | null
          social_media?: Json | null
          template?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_settings_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_new_academy: {
        Args: {
          academy_name: string
          academy_subdomain: string
          admin_full_name: string
          admin_email: string
          admin_password: string
          modules_config?: Json
        }
        Returns: Json
      }
      generate_receipt_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
      log_document_access: {
        Args: {
          p_document_id: string
          p_action: string
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "director"
        | "comptabilite_chief"
        | "coach"
        | "parent"
        | "platform_admin"
        | "admin"
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
      app_role: [
        "director",
        "comptabilite_chief",
        "coach",
        "parent",
        "platform_admin",
        "admin",
      ],
    },
  },
} as const
