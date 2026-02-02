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
          client_code: string | null
          client_since: string | null
          cnpj: string | null
          contract_end: string | null
          created_at: string
          data_abertura: string | null
          email: string | null
          full_address: Json | null
          id: string
          industry: string | null
          logo_url: string | null
          market_intelligence: Json | null
          name: string
          nome_fantasia: string | null
          notes: string | null
          phone: string | null
          razao_social: string | null
          size: string | null
          statistical_studies: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_code?: string | null
          client_since?: string | null
          cnpj?: string | null
          contract_end?: string | null
          created_at?: string
          data_abertura?: string | null
          email?: string | null
          full_address?: Json | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          market_intelligence?: Json | null
          name: string
          nome_fantasia?: string | null
          notes?: string | null
          phone?: string | null
          razao_social?: string | null
          size?: string | null
          statistical_studies?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_code?: string | null
          client_since?: string | null
          cnpj?: string | null
          contract_end?: string | null
          created_at?: string
          data_abertura?: string | null
          email?: string | null
          full_address?: Json | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          market_intelligence?: Json | null
          name?: string
          nome_fantasia?: string | null
          notes?: string | null
          phone?: string | null
          razao_social?: string | null
          size?: string | null
          statistical_studies?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      modalities: {
        Row: {
          category: string | null
          company_id: string | null
          created_at: string | null
          id: string
          name: string
          strategic_value: Json | null
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          strategic_value?: Json | null
        }
        Update: {
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          strategic_value?: Json | null
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
      performance_rankings: {
        Row: {
          attendance_score: number | null
          evaluation_date: string | null
          id: string
          load_score: number | null
          metrics: Json | null
          score: number | null
          student_id: string | null
          technique_score: number | null
          treinador_id: string | null
        }
        Insert: {
          attendance_score?: number | null
          evaluation_date?: string | null
          id?: string
          load_score?: number | null
          metrics?: Json | null
          score?: number | null
          student_id?: string | null
          technique_score?: number | null
          treinador_id?: string | null
        }
        Update: {
          attendance_score?: number | null
          evaluation_date?: string | null
          id?: string
          load_score?: number | null
          metrics?: Json | null
          score?: number | null
          student_id?: string | null
          technique_score?: number | null
          treinador_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_rankings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_rankings_treinador_id_fkey"
            columns: ["treinador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          status_homologacao: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          status_homologacao?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          status_homologacao?: boolean | null
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
      student_flow: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          modality_id: string | null
          secretaria_id: string | null
          student_id: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          modality_id?: string | null
          secretaria_id?: string | null
          student_id?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          modality_id?: string | null
          secretaria_id?: string | null
          student_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_flow_modality_id_fkey"
            columns: ["modality_id"]
            isOneToOne: false
            referencedRelation: "modalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_flow_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      students: {
        Row: {
          cancel_reason: string | null
          company_id: string | null
          created_at: string | null
          current_payment_method:
            | Database["public"]["Enums"]["payment_method"]
            | null
          current_payment_status:
            | Database["public"]["Enums"]["payment_status"]
            | null
          current_plan: Database["public"]["Enums"]["plan_type"] | null
          id: string
          name: string
          neighborhood: string | null
          status: string | null
          strategic_data: Json | null
        }
        Insert: {
          cancel_reason?: string | null
          company_id?: string | null
          created_at?: string | null
          current_payment_method?:
            | Database["public"]["Enums"]["payment_method"]
            | null
          current_payment_status?:
            | Database["public"]["Enums"]["payment_status"]
            | null
          current_plan?: Database["public"]["Enums"]["plan_type"] | null
          id?: string
          name: string
          neighborhood?: string | null
          status?: string | null
          strategic_data?: Json | null
        }
        Update: {
          cancel_reason?: string | null
          company_id?: string | null
          created_at?: string | null
          current_payment_method?:
            | Database["public"]["Enums"]["payment_method"]
            | null
          current_payment_status?:
            | Database["public"]["Enums"]["payment_status"]
            | null
          current_plan?: Database["public"]["Enums"]["plan_type"] | null
          id?: string
          name?: string
          neighborhood?: string | null
          status?: string | null
          strategic_data?: Json | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      payment_method: "pix" | "credito" | "debito" | "boleto" | "recorrencia"
      payment_status: "adimplente" | "inadimplente"
      plan_type: "mensal" | "bimestral" | "trimestral" | "semestral" | "anual"
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
      payment_method: ["pix", "credito", "debito", "boleto", "recorrencia"],
      payment_status: ["adimplente", "inadimplente"],
      plan_type: ["mensal", "bimestral", "trimestral", "semestral", "anual"],
    },
  },
} as const
