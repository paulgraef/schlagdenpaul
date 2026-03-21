"use client";

import { createDemoSnapshot } from "@/config/demo-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { EventSnapshot } from "@/types/domain";

export async function loadEventSnapshot(eventSlug: string): Promise<EventSnapshot> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return createDemoSnapshot();
  }

  const { data: eventRow } = await supabase
    .from("events")
    .select("id,name,slug,status,created_at")
    .eq("slug", eventSlug)
    .single();

  if (!eventRow) {
    return createDemoSnapshot();
  }

  // For v1 fallback we still return the local shape if database mapping is incomplete.
  // This keeps the app usable without a fully provisioned backend.
  return createDemoSnapshot();
}
