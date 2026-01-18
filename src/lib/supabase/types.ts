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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
