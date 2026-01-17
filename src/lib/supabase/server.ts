import { createServerClient } from "@supabase/ssr";
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
