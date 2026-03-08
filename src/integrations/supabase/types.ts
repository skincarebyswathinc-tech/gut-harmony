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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          answers: Json
          completed_at: string
          id: string
          overall_score: number | null
          scores: Json
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string
          id?: string
          overall_score?: number | null
          scores?: Json
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          id?: string
          overall_score?: number | null
          scores?: Json
          user_id?: string
        }
        Relationships: []
      }
      daily_gut_logs: {
        Row: {
          abdominal_discomfort: number
          acid_reflux: number
          bloating: number
          created_at: string
          energy_level: number
          exercise_minutes: number | null
          gas: number
          id: string
          incomplete_evacuation: boolean | null
          log_date: string
          mood: number
          mucus_present: boolean | null
          sleep_hours: number | null
          stool_frequency: number | null
          stool_type: number | null
          stress_level: number
          user_id: string
          water_intake: number | null
        }
        Insert: {
          abdominal_discomfort?: number
          acid_reflux?: number
          bloating?: number
          created_at?: string
          energy_level?: number
          exercise_minutes?: number | null
          gas?: number
          id?: string
          incomplete_evacuation?: boolean | null
          log_date?: string
          mood?: number
          mucus_present?: boolean | null
          sleep_hours?: number | null
          stool_frequency?: number | null
          stool_type?: number | null
          stress_level?: number
          user_id: string
          water_intake?: number | null
        }
        Update: {
          abdominal_discomfort?: number
          acid_reflux?: number
          bloating?: number
          created_at?: string
          energy_level?: number
          exercise_minutes?: number | null
          gas?: number
          id?: string
          incomplete_evacuation?: boolean | null
          log_date?: string
          mood?: number
          mucus_present?: boolean | null
          sleep_hours?: number | null
          stool_frequency?: number | null
          stool_type?: number | null
          stress_level?: number
          user_id?: string
          water_intake?: number | null
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          bloating: number
          created_at: string
          fatigue: number
          food_category: string
          food_name: string
          gas: number
          id: string
          log_date: string
          logged_at: string
          notes: string | null
          reflux: number
          user_id: string
        }
        Insert: {
          bloating?: number
          created_at?: string
          fatigue?: number
          food_category: string
          food_name: string
          gas?: number
          id?: string
          log_date?: string
          logged_at?: string
          notes?: string | null
          reflux?: number
          user_id: string
        }
        Update: {
          bloating?: number
          created_at?: string
          fatigue?: number
          food_category?: string
          food_name?: string
          gas?: number
          id?: string
          log_date?: string
          logged_at?: string
          notes?: string | null
          reflux?: number
          user_id?: string
        }
        Relationships: []
      }
      practitioner_notes: {
        Row: {
          created_at: string
          id: string
          note: string
          practitioner_user_id: string
          shared_report_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          note: string
          practitioner_user_id: string
          shared_report_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          practitioner_user_id?: string
          shared_report_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "practitioner_notes_shared_report_id_fkey"
            columns: ["shared_report_id"]
            isOneToOne: false
            referencedRelation: "shared_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          created_at: string
          gender: string | null
          height_cm: number | null
          id: string
          license_number: string | null
          practice_name: string | null
          specialization: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          gender?: string | null
          height_cm?: number | null
          id?: string
          license_number?: string | null
          practice_name?: string | null
          specialization?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          gender?: string | null
          height_cm?: number | null
          id?: string
          license_number?: string | null
          practice_name?: string | null
          specialization?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      shared_reports: {
        Row: {
          assessment_id: string
          id: string
          patient_user_id: string
          practitioner_email: string
          practitioner_user_id: string | null
          share_token: string
          shared_at: string
          status: string
          viewed_at: string | null
        }
        Insert: {
          assessment_id: string
          id?: string
          patient_user_id: string
          practitioner_email: string
          practitioner_user_id?: string | null
          share_token?: string
          shared_at?: string
          status?: string
          viewed_at?: string | null
        }
        Update: {
          assessment_id?: string
          id?: string
          patient_user_id?: string
          practitioner_email?: string
          practitioner_user_id?: string | null
          share_token?: string
          shared_at?: string
          status?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_reports_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      skin_assessments: {
        Row: {
          answers: Json
          completed_at: string
          id: string
          overall_score: number | null
          scores: Json
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string
          id?: string
          overall_score?: number | null
          scores?: Json
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          id?: string
          overall_score?: number | null
          scores?: Json
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_type: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          ai_summary: string | null
          created_at: string
          id: string
          report_data: Json
          user_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          id?: string
          report_data?: Json
          user_id: string
          week_end: string
          week_start: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          id?: string
          report_data?: Json
          user_id?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "practitioner"
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
      app_role: ["user", "practitioner"],
    },
  },
} as const
