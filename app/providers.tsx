"use client";

import { useEffect } from "react";
import { loadEventSnapshot } from "@/lib/services/event-service";
import { useEventStore } from "@/hooks/use-event-store";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";

export function Providers({ children }: { children: React.ReactNode }) {
  const eventSlug = useEventStore((state) => state.eventSlug);
  const replaceSnapshot = useEventStore((state) => state.replaceSnapshot);

  useRealtimeSync(eventSlug);

  useEffect(() => {
    let canceled = false;

    async function bootstrap() {
      const snapshot = await loadEventSnapshot(eventSlug);
      if (!canceled) {
        replaceSnapshot(snapshot, { broadcast: false });
      }
    }

    void bootstrap();

    return () => {
      canceled = true;
    };
  }, [eventSlug, replaceSnapshot]);

  return children;
}
