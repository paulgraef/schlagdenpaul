"use client";

import { useEffect, useRef } from "react";
import { initializeRealtime, subscribeRealtime } from "@/lib/realtime/realtime";
import { useEventStore } from "@/hooks/use-event-store";

export function useRealtimeSync(eventSlug: string) {
  const applyPatch = useEventStore((state) => state.applyRealtimePatch);
  const seenPatchIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    initializeRealtime(eventSlug);

    return subscribeRealtime((patch) => {
      if (seenPatchIds.current.has(patch.id)) {
        return;
      }

      seenPatchIds.current.add(patch.id);
      applyPatch(patch);
    });
  }, [applyPatch, eventSlug]);
}
