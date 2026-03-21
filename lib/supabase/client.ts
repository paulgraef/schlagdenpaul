"use client";

import { createClient } from "@supabase/supabase-js";
import { hasPublicSupabaseEnv } from "@/lib/supabase/env";

let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!hasPublicSupabaseEnv()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      {
        realtime: {
          params: {
            eventsPerSecond: 20
          }
        }
      }
    );
  }

  return browserClient;
}
