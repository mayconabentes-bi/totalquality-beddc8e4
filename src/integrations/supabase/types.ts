export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          cnpj: string | null
          created_at: string
          id: string
          industry: string | null
          logo_url: string | null
          market_intelligence: Json
          name: string
          phone: string | null
          size: string | null
          statistical_studies: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          market_intelligence?: Json
          name: string
          phone?: string | null
          size?: string | null
          statistical_studies?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          market_intelligence?: Json
          name?: string
          phone?: string | null
          size?: string | null
          statistical_studies?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          status_homologacao: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          status_homologacao?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          status_homologacao?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      risks: {
        Row: {
          id: string
          company_id: string
          description: string
          category: 'Operacional' | 'Financeiro' | 'Mercado'
          probability: number
          impact: number
          mitigation_plan: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          description: string
          category: 'Operacional' | 'Financeiro' | 'Mercado'
          probability: number
          impact: number
          mitigation_plan?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          description?: string
          category?: 'Operacional' | 'Financeiro' | 'Mercado'
          probability?: number
          impact?: number
          mitigation_plan?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_assets: {
        Row: {
          id: string
          company_id: string
          name: string
          category: string
          last_maintenance: string | null
          next_maintenance: string | null
          status: 'Ok' | 'Alerta' | 'Crítico'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          category: string
          last_maintenance?: string | null
          next_maintenance?: string | null
          status: 'Ok' | 'Alerta' | 'Crítico'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          category?: string
          last_maintenance?: string | null
          next_maintenance?: string | null
          status?: 'Ok' | 'Alerta' | 'Crítico'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_assets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_feedback: {
        Row: {
          id: string
          company_id: string
          score: number
          comment: string | null
          student_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          score: number
          comment?: string | null
          student_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          score?: number
          comment?: string | null
          student_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nps_feedback_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      modalities: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modalities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          id: string
          company_id: string
          name: string
          cpf: string | null
          address: string | null
          phone: string | null
          email: string | null
          status: 'Ativo' | 'Inativo' | 'Cancelado'
          cancellation_reason: string | null
          dependents: Json
          geo_economic_profile: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          cpf?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          status?: 'Ativo' | 'Inativo' | 'Cancelado'
          cancellation_reason?: string | null
          dependents?: Json
          geo_economic_profile?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          cpf?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          status?: 'Ativo' | 'Inativo' | 'Cancelado'
          cancellation_reason?: string | null
          dependents?: Json
          geo_economic_profile?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      student_flow: {
        Row: {
          id: string
          company_id: string
          visitor_name: string
          visit_type: 'Visita sem Aula' | 'Visita com Aula Agendada'
          visit_date: string
          converted_to_student: boolean
          student_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          visitor_name: string
          visit_type: 'Visita sem Aula' | 'Visita com Aula Agendada'
          visit_date?: string
          converted_to_student?: boolean
          student_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          visitor_name?: string
          visit_type?: 'Visita sem Aula' | 'Visita com Aula Agendada'
          visit_date?: string
          converted_to_student?: boolean
          student_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_flow_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_flow_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_rankings: {
        Row: {
          id: string
          company_id: string
          student_id: string
          trainer_id: string
          evaluation_date: string
          score: number
          technique_score: number | null
          load_score: number | null
          attendance_score: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          student_id: string
          trainer_id: string
          evaluation_date?: string
          score: number
          technique_score?: number | null
          load_score?: number | null
          attendance_score?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          student_id?: string
          trainer_id?: string
          evaluation_date?: string
          score?: number
          technique_score?: number | null
          load_score?: number | null
          attendance_score?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_rankings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_rankings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_rankings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
