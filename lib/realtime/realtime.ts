"use client";

import { createId } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { RealtimePatch } from "@/types/realtime";

type PatchListener = (patch: RealtimePatch) => void;

let broadcastChannel: BroadcastChannel | null = null;
let channelKey: string | null = null;
const patchListeners = new Set<PatchListener>();
let supabaseUnsubscribe: (() => void) | null = null;

function notify(patch: RealtimePatch) {
  patchListeners.forEach((listener) => listener(patch));
}

function initBroadcast(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (broadcastChannel && channelKey === key) {
    return;
  }

  if (broadcastChannel) {
    broadcastChannel.close();
  }

  broadcastChannel = new BroadcastChannel(`sdp_${key}`);
  channelKey = key;
  broadcastChannel.onmessage = (event: MessageEvent<RealtimePatch>) => {
    if (!event.data?.id) {
      return;
    }
    notify(event.data);
  };
}

function initSupabase(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (supabaseUnsubscribe && channelKey === key) {
    return;
  }

  if (supabaseUnsubscribe) {
    supabaseUnsubscribe();
    supabaseUnsubscribe = null;
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return;
  }

  const channel = supabase.channel(`event:${key}`, {
    config: {
      broadcast: {
        self: false
      }
    }
  });

  channel.on("broadcast", { event: "patch" }, ({ payload }) => {
    const patch = payload as RealtimePatch;
    if (patch?.id) {
      notify(patch);
    }
  });

  channel.subscribe();

  supabaseUnsubscribe = () => {
    channel.unsubscribe();
  };
}

export function initializeRealtime(eventSlug: string) {
  initBroadcast(eventSlug);
  initSupabase(eventSlug);
}

export function emitRealtimePatch(eventSlug: string, patch: RealtimePatch) {
  initBroadcast(eventSlug);

  broadcastChannel?.postMessage(patch);

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    void supabase.channel(`event:${eventSlug}`).send({
      type: "broadcast",
      event: "patch",
      payload: patch
    });
  }
}

export function subscribeRealtime(listener: PatchListener) {
  patchListeners.add(listener);
  return () => {
    patchListeners.delete(listener);
  };
}

export function makePatch<TPayload>(action: RealtimePatch<TPayload>["action"], payload: TPayload): RealtimePatch<TPayload> {
  return {
    id: createId("patch"),
    action,
    payload,
    at: new Date().toISOString()
  };
}
