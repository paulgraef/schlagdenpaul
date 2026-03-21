"use client";

import { useRef, useState } from "react";
import type { SoundItemEntity } from "@/types/domain";

export function useAudioBoard() {
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const isStartingRef = useRef(false);
  const manualStopRef = useRef(false);

  function clearActive(audio?: HTMLAudioElement | null) {
    if (!audio || activeAudioRef.current !== audio) {
      return;
    }
    activeAudioRef.current = null;
    setActiveSoundId(null);
  }

  function stop() {
    const audio = activeAudioRef.current;
    if (!audio) {
      return;
    }

    manualStopRef.current = true;
    audio.pause();
    audio.currentTime = 0;
    clearActive(audio);
  }

  async function play(sound: SoundItemEntity) {
    const current = activeAudioRef.current;

    // Same sound already running -> keep it playing uninterrupted.
    if (current && activeSoundId === sound.id && !current.paused) {
      return;
    }

    if (isStartingRef.current) {
      return;
    }

    isStartingRef.current = true;

    try {
      if (current) {
        stop();
      }

      manualStopRef.current = false;
      const audio = new Audio(sound.assetUrl);
      audio.preload = "auto";
      audio.loop = false;
      activeAudioRef.current = audio;
      setActiveSoundId(sound.id);

      audio.onended = () => {
        clearActive(audio);
      };

      audio.onerror = () => {
        clearActive(audio);
      };

      // If browser/OS pauses unexpectedly, continue unless user clicked Stop.
      audio.onpause = () => {
        if (manualStopRef.current) {
          return;
        }
        if (audio.ended || activeAudioRef.current !== audio) {
          return;
        }
        void audio.play().catch(() => {
          clearActive(audio);
        });
      };

      await audio.play();
    } catch {
      clearActive(activeAudioRef.current);
    } finally {
      isStartingRef.current = false;
    }
  }

  return {
    activeSoundId,
    play,
    stop
  };
}
