import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Creates a Supabase client for use in Server Components, Route Handlers, and Server Actions.
 * Must be called within a request context (inside async functions that handle requests).
 *
 * @example
 * // In a Server Component
 * const supabase = await createClient();
 * const { data } = await supabase.from('pages').select('*');
 *
 * @example
 * // In a Server Action
 * 'use server'
 * const supabase = await createClient();
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component - cookies cannot be set.
            // This can be safely ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client with the service role key.
 * Bypasses RLS - use only in server-side code that must act as admin (e.g. webhooks).
 * Never expose this client or the service role key to the browser.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for service role client");
  }
  return createSupabaseClient<Database>(url, key, { auth: { persistSession: false } });
}
