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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
