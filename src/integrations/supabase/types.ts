export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_access: {
        Row: {
          access_level: string
          admin_id: string
          created_at: string
          id: string
        }
        Insert: {
          access_level?: string
          admin_id: string
          created_at?: string
          id?: string
        }
        Update: {
          access_level?: string
          admin_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_access_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          contract_id: string | null
          created_at: string | null
          id: string
          image_url: string | null
          message: string
          read: boolean | null
          sender_id: string | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          message: string
          read?: boolean | null
          sender_id?: string | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          message?: string
          read?: boolean | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          company_description: string | null
          company_name: string | null
          company_size: string | null
          created_at: string | null
          id: string
          industry: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          company_description?: string | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string | null
          id: string
          industry?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          company_description?: string | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          client_id: string | null
          created_at: string | null
          end_date: string | null
          freelancer_id: string | null
          id: string
          job_id: string | null
          rate: number
          start_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          end_date?: string | null
          freelancer_id?: string | null
          id?: string
          job_id?: string | null
          rate: number
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          end_date?: string | null
          freelancer_id?: string | null
          id?: string
          job_id?: string | null
          rate?: number
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_profiles: {
        Row: {
          availability: string | null
          bio: string | null
          created_at: string | null
          education: string | null
          hourly_rate: number | null
          id: string
          portfolio_links: string[] | null
          skills: string[] | null
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          created_at?: string | null
          education?: string | null
          hourly_rate?: number | null
          id: string
          portfolio_links?: string[] | null
          skills?: string[] | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          availability?: string | null
          bio?: string | null
          created_at?: string | null
          education?: string | null
          hourly_rate?: number | null
          id?: string
          portfolio_links?: string[] | null
          skills?: string[] | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          cover_letter: string | null
          created_at: string | null
          freelancer_id: string | null
          id: string
          job_id: string | null
          pitch: string | null
          proposed_rate: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          cover_letter?: string | null
          created_at?: string | null
          freelancer_id?: string | null
          id?: string
          job_id?: string | null
          pitch?: string | null
          proposed_rate?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          cover_letter?: string | null
          created_at?: string | null
          freelancer_id?: string | null
          id?: string
          job_id?: string | null
          pitch?: string | null
          proposed_rate?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          budget_type: string
          category: string
          client_id: string | null
          created_at: string | null
          description: string
          duration: string | null
          experience_level: string | null
          id: string
          skills_required: string[]
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          budget_type: string
          category: string
          client_id?: string | null
          created_at?: string | null
          description: string
          duration?: string | null
          experience_level?: string | null
          id?: string
          skills_required: string[]
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: string
          category?: string
          client_id?: string | null
          created_at?: string | null
          description?: string
          duration?: string | null
          experience_level?: string | null
          id?: string
          skills_required?: string[]
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          contract_id: string
          created_at: string | null
          freelancer_id: string
          id: string
          payment_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_id: string
          contract_id: string
          created_at?: string | null
          freelancer_id: string
          id?: string
          payment_date?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          contract_id?: string
          created_at?: string | null
          freelancer_id?: string
          id?: string
          payment_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      project_inquiries: {
        Row: {
          client_id: string
          created_at: string | null
          freelancer_id: string
          id: string
          project_description: string
          status: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          freelancer_id: string
          id?: string
          project_description: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          freelancer_id?: string
          id?: string
          project_description?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_submissions: {
        Row: {
          client_id: string
          contract_id: string
          created_at: string | null
          feedback: string | null
          freelancer_id: string
          id: string
          status: string
          submission_date: string | null
          submission_files: string[] | null
          submission_notes: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          contract_id: string
          created_at?: string | null
          feedback?: string | null
          freelancer_id: string
          id?: string
          status: string
          submission_date?: string | null
          submission_files?: string[] | null
          submission_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          contract_id?: string
          created_at?: string | null
          feedback?: string | null
          freelancer_id?: string
          id?: string
          status?: string
          submission_date?: string | null
          submission_files?: string[] | null
          submission_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_submissions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      project_inquiries_with_profiles: {
        Row: {
          client_avatar: string | null
          client_id: string | null
          client_name: string | null
          created_at: string | null
          freelancer_avatar: string | null
          freelancer_id: string | null
          freelancer_name: string | null
          id: string | null
          project_description: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_profile_owner: {
        Args: {
          profile_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
