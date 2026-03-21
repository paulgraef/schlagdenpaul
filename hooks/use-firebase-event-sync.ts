"use client";

import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { useEventStore } from "@/hooks/use-event-store";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import { hasPublicFirebaseEnv } from "@/lib/firebase/env";
import type { EventSnapshot } from "@/types/domain";

interface EventSnapshotDoc {
  snapshot?: EventSnapshot;
}

function toHash(value: EventSnapshot): string {
  return JSON.stringify(value);
}

export function useFirebaseEventSync(eventSlug: string) {
  const snapshot = useEventStore((state) => state.snapshot);
  const replaceSnapshot = useEventStore((state) => state.replaceSnapshot);
  const skipNextSaveRef = useRef(false);
  const lastSavedHashRef = useRef<string | null>(null);
  const [remoteReady, setRemoteReady] = useState(false);

  useEffect(() => {
    if (!hasPublicFirebaseEnv()) {
      return;
    }

    const firestore = getFirebaseFirestore();
    if (!firestore) {
      return;
    }

    setRemoteReady(false);
    lastSavedHashRef.current = null;
    const eventDocRef = doc(firestore, "event_snapshots", eventSlug);

    return onSnapshot(
      eventDocRef,
      (eventDoc) => {
        const data = eventDoc.data() as EventSnapshotDoc | undefined;
        if (!data?.snapshot) {
          setRemoteReady(true);
          return;
        }

        const incomingHash = toHash(data.snapshot);
        const localHash = toHash(useEventStore.getState().snapshot);
        lastSavedHashRef.current = incomingHash;

        if (incomingHash === localHash) {
          setRemoteReady(true);
          return;
        }

        skipNextSaveRef.current = true;
        replaceSnapshot(data.snapshot, { broadcast: false });
        setRemoteReady(true);
      },
      () => {
        setRemoteReady(true);
      }
    );
  }, [eventSlug, replaceSnapshot]);

  useEffect(() => {
    if (!remoteReady || !hasPublicFirebaseEnv()) {
      return;
    }

    const firestore = getFirebaseFirestore();
    if (!firestore) {
      return;
    }

    const currentHash = toHash(snapshot);
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      lastSavedHashRef.current = currentHash;
      return;
    }

    if (lastSavedHashRef.current === currentHash) {
      return;
    }

    const eventDocRef = doc(firestore, "event_snapshots", eventSlug);
    const timeoutId = window.setTimeout(() => {
      lastSavedHashRef.current = currentHash;
      void setDoc(
        eventDocRef,
        {
          snapshot,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [eventSlug, remoteReady, snapshot]);
}
