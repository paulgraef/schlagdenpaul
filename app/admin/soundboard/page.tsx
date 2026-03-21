"use client";

import { useMemo } from "react";
import { useEventStore } from "@/hooks/use-event-store";
import { useAudioBoard } from "@/hooks/use-audio-board";
import { SoundTile } from "@/components/game/sound-tile";

export default function AdminSoundboardPage() {
  const soundItems = useEventStore((state) => state.snapshot.soundItems);
  const { activeSoundId, play, stop } = useAudioBoard();

  const items = useMemo(() => soundItems.slice().sort((a, b) => a.sortOrder - b.sortOrder), [soundItems]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((sound) => (
        <SoundTile
          key={sound.id}
          sound={sound}
          active={activeSoundId === sound.id}
          onPlay={play}
          onStop={stop}
        />
      ))}
    </div>
  );
}
