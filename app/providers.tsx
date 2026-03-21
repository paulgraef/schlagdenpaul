"use client";

import { useEffect } from "react";
import { loadEventSnapshot } from "@/lib/services/event-service";
import { useEventStore } from "@/hooks/use-event-store";
import { useFirebaseEventSync } from "@/hooks/use-firebase-event-sync";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import { hasPublicFirebaseEnv } from "@/lib/firebase/env";

export function Providers({ children }: { children: React.ReactNode }) {
  const eventSlug = useEventStore((state) => state.eventSlug);
  const replaceSnapshot = useEventStore((state) => state.replaceSnapshot);

  useRealtimeSync(eventSlug);
  useFirebaseEventSync(eventSlug);

  useEffect(() => {
    if (hasPublicFirebaseEnv()) {
      return;
    }

    let canceled = false;

    async function bootstrap() {
      const snapshot = await loadEventSnapshot(eventSlug);
      if (!canceled && snapshot) {
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
