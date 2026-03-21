"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SoundItemEntity } from "@/types/domain";

interface SoundTileProps {
  sound: SoundItemEntity;
  active: boolean;
  onPlay: (sound: SoundItemEntity) => void;
  onStop: () => void;
}

export function SoundTile({ sound, active, onPlay, onStop }: SoundTileProps) {
  return (
    <Card className={active ? "border-primary/60 bg-primary/10" : ""}>
      <CardContent className="space-y-2 p-2.5">
        <h3 className="truncate text-sm font-semibold leading-tight" title={sound.title}>{sound.title}</h3>

        {!active ? (
          <Button className="h-8 w-full px-2 text-xs" onClick={() => onPlay(sound)}>
            <Play className="mr-2 h-4 w-4" />Play
          </Button>
        ) : (
          <Button className="h-8 w-full px-2 text-xs" variant="secondary" onClick={onStop}>
            <Pause className="mr-2 h-4 w-4" />Stop
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
