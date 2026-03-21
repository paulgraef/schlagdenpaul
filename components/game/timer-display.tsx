"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

function msToTimer(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

interface TimerDisplayProps {
  running: boolean;
  startedAt: string | null;
  elapsedMs: number;
}

export function TimerDisplay({ running, startedAt, elapsedMs }: TimerDisplayProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = setInterval(() => setNow(Date.now()), 300);
    return () => clearInterval(timer);
  }, [running]);

  const liveDelta = running && startedAt ? Math.max(0, now - new Date(startedAt).getTime()) : 0;
  const total = elapsedMs + liveDelta;

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/40 px-4 py-2">
      <Clock3 className="h-4 w-4 text-primary" />
      <span className="font-mono text-lg font-semibold tabular-nums">{msToTimer(total)}</span>
      <span className="text-xs text-muted-foreground">{running ? "LIVE" : "PAUSE"}</span>
    </div>
  );
}
