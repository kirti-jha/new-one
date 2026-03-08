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
      commission_logs: {
        Row: {
          commission_amount: number
          commission_type: string
          commission_value: number
          created_at: string
          credited: boolean
          id: string
          service_key: string
          slab_id: string | null
          transaction_amount: number
          user_id: string
          wallet_txn_id: string | null
        }
        Insert: {
          commission_amount: number
          commission_type: string
          commission_value: number
          created_at?: string
          credited?: boolean
          id?: string
          service_key: string
          slab_id?: string | null
          transaction_amount: number
          user_id: string
          wallet_txn_id?: string | null
        }
        Update: {
          commission_amount?: number
          commission_type?: string
          commission_value?: number
          created_at?: string
          credited?: boolean
          id?: string
          service_key?: string
          slab_id?: string | null
          transaction_amount?: number
          user_id?: string
          wallet_txn_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_logs_slab_id_fkey"
            columns: ["slab_id"]
            isOneToOne: false
            referencedRelation: "commission_slabs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_logs_wallet_txn_id_fkey"
            columns: ["wallet_txn_id"]
            isOneToOne: false
            referencedRelation: "wallet_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_slabs: {
        Row: {
          commission_type: string
          commission_value: number
          created_at: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          service_key: string
          service_label: string
          updated_at: string
        }
        Insert: {
          commission_type?: string
          commission_value?: number
          created_at?: string
          id?: string
          is_active?: boolean
          role: Database["public"]["Enums"]["app_role"]
          service_key: string
          service_label: string
          updated_at?: string
        }
        Update: {
          commission_type?: string
          commission_value?: number
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          service_key?: string
          service_label?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_bank_accounts: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          created_at: string
          created_by: string
          id: string
          ifsc_code: string
          is_active: boolean
          updated_at: string
          upi_id: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          bank_name: string
          created_at?: string
          created_by: string
          id?: string
          ifsc_code: string
          is_active?: boolean
          updated_at?: string
          upi_id?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string
          created_by?: string
          id?: string
          ifsc_code?: string
          is_active?: boolean
          updated_at?: string
          upi_id?: string | null
        }
        Relationships: []
      }
      e_wallet_credits: {
        Row: {
          amount: number
          available_at: string
          consumed: boolean
          created_at: string
          id: string
          reference_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          available_at: string
          consumed?: boolean
          created_at?: string
          id?: string
          reference_id?: string | null
          source?: string
          user_id: string
        }
        Update: {
          amount?: number
          available_at?: string
          consumed?: boolean
          created_at?: string
          id?: string
          reference_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      fund_requests: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          bank_account_id: string
          created_at: string
          id: string
          payment_date: string
          payment_mode: string
          payment_reference: string
          receipt_name: string | null
          receipt_path: string | null
          rejection_reason: string | null
          remarks: string | null
          requester_id: string
          status: string
          updated_at: string
          wallet_txn_id: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          bank_account_id: string
          created_at?: string
          id?: string
          payment_date: string
          payment_mode?: string
          payment_reference: string
          receipt_name?: string | null
          receipt_path?: string | null
          rejection_reason?: string | null
          remarks?: string | null
          requester_id: string
          status?: string
          updated_at?: string
          wallet_txn_id?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          bank_account_id?: string
          created_at?: string
          id?: string
          payment_date?: string
          payment_mode?: string
          payment_reference?: string
          receipt_name?: string | null
          receipt_path?: string | null
          rejection_reason?: string | null
          remarks?: string | null
          requester_id?: string
          status?: string
          updated_at?: string
          wallet_txn_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fund_requests_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "company_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_requests_wallet_txn_id_fkey"
            columns: ["wallet_txn_id"]
            isOneToOne: false
            referencedRelation: "wallet_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_documents: {
        Row: {
          created_at: string
          doc_type: string
          file_name: string
          file_path: string
          id: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_type: string
          file_name: string
          file_path: string
          id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: string
          file_name?: string
          file_path?: string
          id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string
          full_name: string
          id: string
          kyc_status: string
          parent_id: string | null
          phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          full_name?: string
          id?: string
          kyc_status?: string
          parent_id?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          full_name?: string
          id?: string
          kyc_status?: string
          parent_id?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          description: string | null
          from_balance_after: number | null
          from_user_id: string | null
          id: string
          reference: string | null
          to_balance_after: number
          to_user_id: string
          type: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          description?: string | null
          from_balance_after?: number | null
          from_user_id?: string | null
          id?: string
          reference?: string | null
          to_balance_after: number
          to_user_id: string
          type?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          description?: string | null
          from_balance_after?: number | null
          from_user_id?: string | null
          id?: string
          reference?: string | null
          to_balance_after?: number
          to_user_id?: string
          type?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          e_wallet_balance: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          e_wallet_balance?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          e_wallet_balance?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_receipt: {
        Args: { _folder_owner: string; _user_id: string }
        Returns: boolean
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_ancestor_of: {
        Args: { _profile_id: string; _user_id: string }
        Returns: boolean
      }
      role_level: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: number
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "super_distributor"
        | "master_distributor"
        | "distributor"
        | "retailer"
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
        "admin",
        "super_distributor",
        "master_distributor",
        "distributor",
        "retailer",
      ],
    },
  },
} as const
