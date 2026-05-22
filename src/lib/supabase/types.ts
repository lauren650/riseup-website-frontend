/**
 * Database types for Supabase.
 *
 * This is a placeholder type that will be replaced with generated types
 * from the Supabase CLI once the database schema is created.
 *
 * To generate types:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Link to your project: supabase link --project-ref <project-id>
 * 3. Generate types: supabase gen types typescript --linked > src/lib/supabase/types.ts
 *
 * Or use the remote generation URL from your Supabase dashboard:
 * npx supabase gen types typescript --project-id <project-id> > src/lib/supabase/types.ts
 */

// Helper type to extract Row types from tables
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Database = {
  PostgrestVersion: "12";
  public: {
    Tables: {
      sponsors: {
        Row: {
          id: string;
          company_name: string;
          contact_name: string;
          contact_email: string;
          contact_phone: string;
          website_url: string;
          description: string | null;
          logo_url: string;
          status: "pending" | "approved";
          created_at: string;
          updated_at: string;
          approved_at: string | null;
          approved_by: string | null;
        };
        Insert: {
          id?: string;
          company_name: string;
          contact_name: string;
          contact_email: string;
          contact_phone: string;
          website_url: string;
          description?: string | null;
          logo_url: string;
          status?: "pending" | "approved";
          created_at?: string;
          updated_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
        };
        Update: {
          id?: string;
          company_name?: string;
          contact_name?: string;
          contact_email?: string;
          contact_phone?: string;
          website_url?: string;
          description?: string | null;
          logo_url?: string;
          status?: "pending" | "approved";
          created_at?: string;
          updated_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
        };
        Relationships: [];
      };
      site_content: {
        Row: {
          id: string;
          content_key: string;
          content_type: string;
          content: { text?: string; [key: string]: unknown };
          page: string | null;
          section: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content_key: string;
          content_type?: string;
          content: { text?: string; [key: string]: unknown };
          page?: string | null;
          section?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content_key?: string;
          content_type?: string;
          content?: { text?: string; [key: string]: unknown };
          page?: string | null;
          section?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_drafts: {
        Row: {
          id: string;
          content_key: string;
          draft_type: string;
          content: { text?: string; [key: string]: unknown };
          created_by: string | null;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          content_key: string;
          draft_type: string;
          content: { text?: string; [key: string]: unknown };
          created_by?: string | null;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          content_key?: string;
          draft_type?: string;
          content?: { text?: string; [key: string]: unknown };
          created_by?: string | null;
          created_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
      content_versions: {
        Row: {
          id: number;
          content_key: string;
          content: { text?: string; [key: string]: unknown };
          changed_by: string | null;
          changed_at: string;
          change_description: string | null;
        };
        Insert: {
          id?: number;
          content_key: string;
          content: { text?: string; [key: string]: unknown };
          changed_by?: string | null;
          changed_at?: string;
          change_description?: string | null;
        };
        Update: {
          id?: number;
          content_key?: string;
          content?: { text?: string; [key: string]: unknown };
          changed_by?: string | null;
          changed_at?: string;
          change_description?: string | null;
        };
        Relationships: [];
      };
      announcement_bar: {
        Row: {
          id: string;
          text: string;
          link_url: string | null;
          link_text: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          link_url?: string | null;
          link_text?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          link_url?: string | null;
          link_text?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      section_visibility: {
        Row: {
          id: string;
          section_key: string;
          is_visible: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_key: string;
          is_visible?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section_key?: string;
          is_visible?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string | null;
          role: "user" | "assistant";
          content: string;
          tool_calls: unknown | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          role: "user" | "assistant";
          content: string;
          tool_calls?: unknown | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          role?: "user" | "assistant";
          content?: string;
          tool_calls?: unknown | null;
          created_at?: string;
        };
        Relationships: [];
      };
      sponsorship_packages: {
        Row: {
          id: string;
          name: string;
          cost: number;
          closing_date: string | null;
          total_slots: number;
          available_slots: number;
          description: string | null;
          benefits: string[] | null;
          includes_tshirt: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cost: number;
          closing_date?: string | null;
          total_slots: number;
          available_slots: number;
          description?: string | null;
          benefits?: string[] | null;
          includes_tshirt?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cost?: number;
          closing_date?: string | null;
          total_slots?: number;
          available_slots?: number;
          description?: string | null;
          benefits?: string[] | null;
          includes_tshirt?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          stripe_invoice_id: string;
          package_id: string | null;
          package_name: string;
          package_cost: number;
          customer_email: string;
          customer_name: string;
          status: "draft" | "open" | "paid" | "void" | "uncollectible";
          created_at: string;
          finalized_at: string | null;
          paid_at: string | null;
          voided_at: string | null;
          created_by: string | null;
          note: string | null;
        };
        Insert: {
          id?: string;
          stripe_invoice_id: string;
          package_id?: string | null;
          package_name: string;
          package_cost: number;
          customer_email: string;
          customer_name: string;
          status?: "draft" | "open" | "paid" | "void" | "uncollectible";
          created_at?: string;
          finalized_at?: string | null;
          paid_at?: string | null;
          voided_at?: string | null;
          created_by?: string | null;
          note?: string | null;
        };
        Update: {
          id?: string;
          stripe_invoice_id?: string;
          package_id?: string | null;
          package_name?: string;
          package_cost?: number;
          customer_email?: string;
          customer_name?: string;
          status?: "draft" | "open" | "paid" | "void" | "uncollectible";
          created_at?: string;
          finalized_at?: string | null;
          paid_at?: string | null;
          voided_at?: string | null;
          created_by?: string | null;
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_package_id_fkey";
            columns: ["package_id"];
            referencedRelation: "sponsorship_packages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      webhook_events: {
        Row: {
          id: string;
          stripe_event_id: string;
          event_type: string;
          processed_at: string;
          payload: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          stripe_event_id: string;
          event_type: string;
          processed_at?: string;
          payload: Record<string, unknown>;
        };
        Update: {
          id?: string;
          stripe_event_id?: string;
          event_type?: string;
          processed_at?: string;
          payload?: Record<string, unknown>;
        };
        Relationships: [];
      };
      email_templates: {
        Row: {
          id: string;
          template_key: string;
          name: string;
          subject: string;
          html_body: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_key: string;
          name: string;
          subject: string;
          html_body: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template_key?: string;
          name?: string;
          subject?: string;
          html_body?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sponsor_interest: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          company_name: string;
          status: "new" | "contacted" | "converted" | "closed";
          notes: string | null;
          created_at: string;
          updated_at: string;
          contacted_at: string | null;
          contacted_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          company_name: string;
          status?: "new" | "contacted" | "converted" | "closed";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          contacted_at?: string | null;
          contacted_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          company_name?: string;
          status?: "new" | "contacted" | "converted" | "closed";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          contacted_at?: string | null;
          contacted_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sponsor_interest_contacted_by_fkey";
            columns: ["contacted_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      sponsor_uploads: {
        Row: {
          id: string;
          invoice_id: string;
          upload_token: string;
          company_name: string;
          package_id: string;
          logo_url: string | null;
          website_url: string | null;
          drive_folder_id: string;
          drive_file_id: string | null;
          sheets_row_index: number | null;
          status: string;
          uploaded_at: string | null;
          token_expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          upload_token: string;
          company_name: string;
          package_id: string;
          logo_url?: string | null;
          website_url?: string | null;
          drive_folder_id: string;
          drive_file_id?: string | null;
          sheets_row_index?: number | null;
          status?: string;
          uploaded_at?: string | null;
          token_expires_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          upload_token?: string;
          company_name?: string;
          package_id?: string;
          logo_url?: string | null;
          website_url?: string | null;
          drive_folder_id?: string;
          drive_file_id?: string | null;
          sheets_row_index?: number | null;
          status?: string;
          uploaded_at?: string | null;
          token_expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sponsor_uploads_invoice_id_fkey";
            columns: ["invoice_id"];
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sponsor_uploads_package_id_fkey";
            columns: ["package_id"];
            referencedRelation: "sponsorship_packages";
            referencedColumns: ["id"];
          }
        ];
      };
      artwork_proofs: {
        Row: {
          id: string;
          name: string;
          image_url: string;
          approval_due_at: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          image_url: string;
          approval_due_at: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          image_url?: string;
          approval_due_at?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "artwork_proofs_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      artwork_proof_approvals: {
        Row: {
          id: string;
          artwork_proof_id: string;
          sponsor_upload_id: string;
          approval_token: string;
          status: "pending" | "approved" | "changes_requested";
          responded_at: string | null;
          approval_due_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          artwork_proof_id: string;
          sponsor_upload_id: string;
          approval_token: string;
          status?: "pending" | "approved" | "changes_requested";
          responded_at?: string | null;
          approval_due_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          artwork_proof_id?: string;
          sponsor_upload_id?: string;
          approval_token?: string;
          status?: "pending" | "approved" | "changes_requested";
          responded_at?: string | null;
          approval_due_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "artwork_proof_approvals_artwork_proof_id_fkey";
            columns: ["artwork_proof_id"];
            referencedRelation: "artwork_proofs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "artwork_proof_approvals_sponsor_upload_id_fkey";
            columns: ["sponsor_upload_id"];
            referencedRelation: "sponsor_uploads";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      decrement_package_slots: {
        Args: { package_uuid: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
