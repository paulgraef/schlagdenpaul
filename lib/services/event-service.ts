"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { EventSnapshot } from "@/types/domain";

export async function loadEventSnapshot(eventSlug: string): Promise<EventSnapshot | null> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data: eventRow } = await supabase
    .from("events")
    .select("id,name,slug,status,created_at")
    .eq("slug", eventSlug)
    .single();

  if (!eventRow) {
    return null;
  }

  // For v1 fallback we keep local persisted state until a real DB snapshot mapping exists.
  // Returning null prevents overwriting local calibration/game progress on reload.
  return null;
}
